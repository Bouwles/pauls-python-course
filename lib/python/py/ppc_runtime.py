"""
The Workbench runtime. Runs inside Pyodide, in the browser's worker and in the
Node content-test runner, so both see exactly the same behaviour.

The host provides a module called `ppc_bridge` with:
    out(kind, text)          stream output to the console ("out" or "err")
    read_input(prompt)       block until the learner types a line; None if stopped
    sleep(seconds)           block for a while; returns True if stopped meanwhile
    event(name, json_text)   tell the host about test progress

Public entry points (all take and return JSON text):
    run(request)             run a program interactively
    trace(request)           run a program and record every step for the visualiser
    check(request)           run the tests in a tests.py source against the program
    describe(request)        list the tests in a tests.py source without running them
"""

import ast
import builtins
import importlib
import io
import json
import math
import os
import random
import re
import shutil
import sys
import time
import traceback
import types

import ppc_bridge

try:
    import workshop  # Living Visualisations the learner's code can draw with
except ImportError:  # pragma: no cover - older hosts without the module
    workshop = None

# Plots render off-screen; figures are captured as PNGs after a run (Section 10.4).
os.environ.setdefault("MPLBACKEND", "Agg")
import warnings
warnings.filterwarnings("ignore", message=".*non-interactive.*")
warnings.filterwarnings("ignore", message=".*FigureCanvasAgg.*")

WORKDIR = "/home/pyodide/work"
MAX_OUTPUT_LINES = 2000
MAX_OUTPUT_CHARS = 200_000
STREAM_INTERVAL = 0.03
DEFAULT_TRACE_LIMIT = 1000


# ---------------------------------------------------------------------------
# Signals the learner's code cannot swallow with `except Exception`
# ---------------------------------------------------------------------------

class OutputLimitReached(BaseException):
    pass


class TraceLimitReached(BaseException):
    pass


class InputsExhausted(EOFError):
    pass


# ---------------------------------------------------------------------------
# Output capture
# ---------------------------------------------------------------------------

class Transcript:
    """Everything a run printed, in order, with prompts and typed input marked."""

    def __init__(self, stream):
        self.stream = stream
        self.parts = []  # (kind, text): out, err, prompt, input
        self.lines = 0
        self.chars = 0
        self.pending = []
        self.last_flush = time.monotonic()

    def add(self, kind, text):
        if not text:
            return
        self.lines += text.count("\n")
        self.chars += len(text)
        if self.lines > MAX_OUTPUT_LINES or self.chars > MAX_OUTPUT_CHARS:
            self.flush()
            raise OutputLimitReached()
        self.parts.append((kind, text))
        if self.stream:
            self.pending.append((kind, text))
            now = time.monotonic()
            if now - self.last_flush > STREAM_INTERVAL or kind in ("prompt", "input"):
                self.flush()

    def flush(self):
        if not self.stream or not self.pending:
            self.pending = []
            return
        merged = []
        for kind, text in self.pending:
            if merged and merged[-1][0] == kind:
                merged[-1] = (kind, merged[-1][1] + text)
            else:
                merged.append((kind, text))
        self.pending = []
        self.last_flush = time.monotonic()
        for kind, text in merged:
            ppc_bridge.out(kind, text)

    def printed(self, include_prompts=False, include_errors=False):
        keep = {"out"}
        if include_prompts:
            keep |= {"prompt", "input"}
        if include_errors:
            keep.add("err")
        return "".join(text for kind, text in self.parts if kind in keep)

    def as_terminal(self):
        """What a terminal would show: prompts, typed input and output together."""
        return "".join(text for kind, text in self.parts if kind != "err")


class Writer(io.TextIOBase):
    def __init__(self, transcript, kind):
        self.transcript = transcript
        self.kind = kind

    def writable(self):
        return True

    def write(self, text):
        if not isinstance(text, str):
            raise TypeError(f"write() argument must be str, not {type(text).__name__}")
        self.transcript.add(self.kind, text)
        return len(text)

    def flush(self):
        self.transcript.flush()

    @property
    def encoding(self):
        return "utf-8"


class StdinReader(io.TextIOBase):
    def __init__(self, session):
        self.session = session

    def readable(self):
        return True

    def readline(self, size=-1):
        try:
            return self.session.read_line("") + "\n"
        except EOFError:
            return ""

    def read(self, size=-1):
        return self.readline()

    def __iter__(self):
        while True:
            line = self.readline()
            if not line:
                return
            yield line


# ---------------------------------------------------------------------------
# A session: one run of the learner's program with everything patched
# ---------------------------------------------------------------------------

class Session:
    def __init__(self, files, entry, inputs=None, stream=False, fast_sleep=False, seed=None, code=None, argv=None):
        self.code_override = code
        self.argv = [entry] + [str(a) for a in (argv or [])]
        self.files = files or {}
        self.entry = entry or "main.py"
        self.inputs = None if inputs is None else [str(v) for v in inputs]
        self.input_index = 0
        self.inputs_requested = 0
        self.stream = stream
        self.fast_sleep = fast_sleep
        self.seed = seed
        self.transcript = Transcript(stream)
        self.exhausted = False

    # -- input ---------------------------------------------------------------
    def read_line(self, prompt):
        self.transcript.add("prompt", prompt)
        self.inputs_requested += 1
        if self.inputs is not None:
            if self.input_index >= len(self.inputs):
                self.exhausted = True
                raise InputsExhausted("The program asked for more input than this check gives it.")
            value = self.inputs[self.input_index]
            self.input_index += 1
        else:
            self.transcript.flush()
            value = ppc_bridge.read_input(prompt)
            if value is None:
                raise KeyboardInterrupt()
            value = str(value)
        self.transcript.add("input", value + "\n")
        return value

    def fake_input(self, prompt=""):
        return self.read_line(str(prompt))

    def fake_sleep(self, seconds):
        if not isinstance(seconds, (int, float)):
            raise TypeError(f"'{type(seconds).__name__}' object cannot be interpreted as a number")
        if seconds < 0:
            raise ValueError("sleep length must be non-negative")
        if self.fast_sleep:
            return
        self.transcript.flush()
        if ppc_bridge.sleep(float(seconds)):
            raise KeyboardInterrupt()

    # -- environment -----------------------------------------------------------
    def __enter__(self):
        shutil.rmtree(WORKDIR, ignore_errors=True)
        os.makedirs(WORKDIR, exist_ok=True)
        for name, content in self.files.items():
            path = os.path.join(WORKDIR, name)
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w", encoding="utf-8") as fh:
                fh.write(content)
        self._before = {name: content for name, content in self.files.items()}
        forget_learner_modules()
        importlib.invalidate_caches()
        self.old = (sys.stdout, sys.stderr, sys.stdin, builtins.input, time.sleep, os.getcwd(), list(sys.path), list(sys.argv))
        sys.argv = list(self.argv)
        sys.stdout = Writer(self.transcript, "out")
        sys.stderr = Writer(self.transcript, "err")
        sys.stdin = StdinReader(self)
        builtins.input = self.fake_input
        time.sleep = self.fake_sleep
        os.chdir(WORKDIR)
        if WORKDIR not in sys.path:
            sys.path.insert(0, WORKDIR)
        random.seed(self.seed)
        if workshop is not None:
            workshop.reset()
        return self

    def __exit__(self, *exc):
        try:
            self.transcript.flush()
        except BaseException:
            pass
        sys.stdout, sys.stderr, sys.stdin, builtins.input, time.sleep, cwd, path, argv = self.old
        sys.argv[:] = argv
        sys.path[:] = path
        try:
            os.chdir(cwd)
        except OSError:
            pass
        return False

    def changed_files(self):
        """Non-Python files the program created or changed, for saving with the Job."""
        out = {}
        for root, _dirs, names in os.walk(WORKDIR):
            for name in names:
                path = os.path.join(root, name)
                rel = os.path.relpath(path, WORKDIR)
                if rel.endswith(".py") or "__pycache__" in rel:
                    continue
                try:
                    if os.path.getsize(path) > 200_000:
                        continue
                    with open(path, "r", encoding="utf-8") as fh:
                        content = fh.read()
                except (OSError, UnicodeDecodeError):
                    continue
                if self._before.get(rel) != content:
                    out[rel] = content
        return out

    # -- running ---------------------------------------------------------------
    def compile_entry(self):
        source = self.files.get(self.entry, "")
        if self.code_override is not None:
            return source, self.code_override
        return source, compile(source, self.entry, "exec", dont_inherit=True)

    def run_main(self, code, name="__main__"):
        module = types.ModuleType(name)
        module.__file__ = os.path.join(WORKDIR, self.entry)
        module.__builtins__ = builtins
        if name != "__main__":
            sys.modules[name] = module
        exec(code, module.__dict__)
        return module


def forget_learner_modules():
    for name, module in list(sys.modules.items()):
        path = getattr(module, "__file__", None) or ""
        if path.startswith(WORKDIR):
            del sys.modules[name]


def is_learner_file(filename):
    if not filename:
        return False
    if filename.startswith(WORKDIR):
        return True
    return not filename.startswith("/") and not filename.startswith("<") and filename.endswith(".py")


def display_name(filename):
    if filename.startswith(WORKDIR + "/"):
        return filename[len(WORKDIR) + 1:]
    return filename


# ---------------------------------------------------------------------------
# Errors, formatted for people
# ---------------------------------------------------------------------------

def source_line(files, filename, lineno):
    src = files.get(display_name(filename or ""), None)
    if src is None or not lineno:
        return None
    lines = src.splitlines()
    if 0 < lineno <= len(lines):
        return lines[lineno - 1]
    return None


def describe_error(exc, files):
    info = {
        "type": type(exc).__name__,
        "message": str(exc),
        "file": None,
        "line": None,
        "column": None,
        "text": None,
        "frames": [],
        "traceback": "",
    }
    lines = []
    if isinstance(exc, SyntaxError):
        info["file"] = display_name(exc.filename or "")
        info["line"] = exc.lineno
        info["column"] = exc.offset
        info["message"] = exc.msg
        src_text = source_line(files, exc.filename, exc.lineno)
        info["text"] = src_text if src_text is not None else (exc.text or "").rstrip("\n")
        tb_frames = [f for f in traceback.extract_tb(exc.__traceback__) if is_learner_file(f.filename)]
        if tb_frames:
            lines.append("Traceback (most recent call last):")
            for f in tb_frames:
                lines.append(f'  File "{display_name(f.filename)}", line {f.lineno}, in {f.name}')
                text = source_line(files, f.filename, f.lineno) or f.line
                if text:
                    lines.append(f"    {text.strip()}")
        lines.append(f'  File "{info["file"]}", line {info["line"]}')
        if info["text"] is not None:
            stripped = info["text"].lstrip()
            lines.append(f"    {stripped}")
            if exc.offset:
                indent = len(info["text"]) - len(stripped)
                caret = max(1, exc.offset - indent)
                end = getattr(exc, "end_offset", None)
                width = 1
                if end and getattr(exc, "end_lineno", exc.lineno) == exc.lineno and end > exc.offset:
                    width = end - exc.offset
                lines.append("    " + " " * (caret - 1) + "^" * width)
        lines.append(f"{type(exc).__name__}: {exc.msg}")
    else:
        frames = [f for f in traceback.extract_tb(exc.__traceback__) if is_learner_file(f.filename)]
        lines.append("Traceback (most recent call last):")
        for f in frames:
            name = display_name(f.filename)
            info["frames"].append({"file": name, "line": f.lineno, "name": f.name})
            lines.append(f'  File "{name}", line {f.lineno}, in {f.name}')
            text = source_line(files, f.filename, f.lineno) or f.line
            if text:
                lines.append(f"    {text.strip()}")
        if frames:
            last = frames[-1]
            info["file"] = display_name(last.filename)
            info["line"] = last.lineno
            info["text"] = (source_line(files, last.filename, last.lineno) or last.line or "").strip()
        # TracebackException keeps Python's "Did you mean" suggestions.
        try:
            only = [l.rstrip("\n") for l in traceback.TracebackException.from_exception(exc).format_exception_only()]
        except Exception:
            only = [l.rstrip("\n") for l in traceback.format_exception_only(type(exc), exc)]
        lines.extend(only)
        prefix = type(exc).__name__ + ": "
        if only and only[0].startswith(prefix):
            info["message"] = only[0][len(prefix):]
    info["traceback"] = "\n".join(lines)
    return info


# ---------------------------------------------------------------------------
# run()
# ---------------------------------------------------------------------------

def capture_figures(limit=8):
    """PNG data (base64) for every open matplotlib figure, then close them."""
    plt = sys.modules.get("matplotlib.pyplot")
    if plt is None:
        return []
    import base64
    out = []
    try:
        for num in plt.get_fignums()[:limit]:
            buf = io.BytesIO()
            plt.figure(num).savefig(buf, format="png", dpi=96, bbox_inches="tight")
            out.append(base64.b64encode(buf.getvalue()).decode("ascii"))
        plt.close("all")
    except Exception:
        pass
    return out


def run(request_json):
    req = json.loads(request_json)
    files = req.get("files", {})
    entry = req.get("entry", "main.py")
    inputs = req.get("inputs")
    result = {"status": "ok", "error": None, "exitCode": 0, "filesOut": {}, "output": ""}
    session = Session(files, entry, inputs=inputs, stream=req.get("stream", True), fast_sleep=req.get("fastSleep", False), seed=req.get("seed"), argv=req.get("argv"))
    with session:
        try:
            _source, code = session.compile_entry()
            session.run_main(code)
        except SystemExit as exc:
            result["exitCode"] = exc.code if isinstance(exc.code, int) else (0 if exc.code is None else 1)
            if exc.code is not None and not isinstance(exc.code, int):
                session.transcript.add("err", f"{exc.code}\n")
        except KeyboardInterrupt:
            result["status"] = "stopped"
        except OutputLimitReached:
            result["status"] = "output-limit"
        except InputsExhausted as exc:
            result["status"] = "error"
            result["error"] = describe_error(exc, files)
            result["error"]["inputsExhausted"] = True
        except BaseException as exc:  # noqa: BLE001 - the learner's code can raise anything
            result["status"] = "error"
            result["error"] = describe_error(exc, files)
        try:
            result["filesOut"] = session.changed_files()
        except BaseException:
            pass
    result["output"] = session.transcript.as_terminal()
    result["printed"] = session.transcript.printed()
    result["inputsRequested"] = session.inputs_requested
    try:
        result["events"] = code_events(files.get(entry, ""))
    except BaseException:
        result["events"] = []
    result["figures"] = capture_figures()
    if workshop is not None:
        try:
            visuals = workshop.take()
            if visuals:
                result["visuals"] = visuals
        except BaseException:
            pass
    return json.dumps(result)


# ---------------------------------------------------------------------------
# code_events(): cheap static facts about the learner's code, so the cast can
# react to what was actually written (REDESIGN.md 6.5). Never judged, never shown
# as notes: they only choose which line a character says.
# ---------------------------------------------------------------------------

PRICE_WORDS = ("price", "cost", "total", "pence", "pounds", "fare", "amount", "bill", "tip")


def code_events(source):
    try:
        tree = ast.parse(source)
    except SyntaxError:
        return []
    events = []

    def add(event, **detail):
        if not any(e["event"] == event for e in events):
            events.append({"event": event, **detail})

    lines = source.splitlines()
    if any(len(line) > 100 for line in lines):
        add("long-line")
    loops = 0
    for node in ast.walk(tree):
        if isinstance(node, ast.JoinedStr):
            add("fstring")
        elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            add("function")
            end = getattr(node, "end_lineno", node.lineno)
            if end - node.lineno > 25:
                add("long-function", name=node.name)
        elif isinstance(node, ast.For):
            loops += 1
            it = node.iter
            # range(0), range(n, n) with literals, or an empty literal: the body never runs.
            if isinstance(it, ast.Call) and isinstance(it.func, ast.Name) and it.func.id == "range":
                args = [a.value for a in it.args if isinstance(a, ast.Constant) and isinstance(a.value, int)]
                if len(args) == len(it.args) and ((len(args) == 1 and args[0] <= 0) or (len(args) >= 2 and args[1] <= args[0])):
                    add("loop-never-runs")
            elif isinstance(it, (ast.List, ast.Tuple)) and not it.elts:
                add("loop-never-runs")
            if any(isinstance(n, (ast.For, ast.While)) for n in ast.walk(node) if n is not node):
                add("nested-loop")
        elif isinstance(node, ast.While):
            loops += 1
            if isinstance(node.test, ast.Constant) and not node.test.value:
                add("loop-never-runs")
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in ("int", "float"):
            if node.args and isinstance(node.args[0], ast.Call) and isinstance(node.args[0].func, ast.Name) and node.args[0].func.id == "input":
                add("converts-input")
        elif isinstance(node, ast.Assign):
            for target in node.targets:
                if not isinstance(target, ast.Name):
                    continue
                name = target.id
                value = node.value
                is_number = isinstance(value, ast.Constant) and isinstance(value.value, (int, float)) and not isinstance(value.value, bool)
                is_sum = isinstance(value, ast.BinOp)
                if len(name) == 1 and name not in ("i", "j", "k", "n", "_") and (is_number or is_sum):
                    add("letter-name", name=name)
                elif "_" in name.strip("_") and len(name) >= 8 and name.islower() and any(w in name for w in PRICE_WORDS + ("count", "name", "list", "number", "average", "score")):
                    add("good-name", name=name)
    if loops == 0 and len([l for l in lines if l.strip() and not l.strip().startswith("#")]) > 25:
        add("long-no-loop")
    return events


# ---------------------------------------------------------------------------
# trace(): Python Tutor style step recording
# ---------------------------------------------------------------------------

PRIMITIVES = (int, float, bool, type(None), complex)


class HeapEncoder:
    def __init__(self):
        self.heap = {}

    def encode(self, value, depth=0):
        if isinstance(value, bool) or value is None:
            return {"k": "prim", "t": type(value).__name__, "v": repr(value)}
        if isinstance(value, PRIMITIVES):
            return {"k": "prim", "t": type(value).__name__, "v": repr(value)}
        if isinstance(value, str):
            text = value if len(value) <= 200 else value[:200] + "..."
            return {"k": "prim", "t": "str", "v": repr(text)}
        oid = str(id(value))
        if oid not in self.heap and depth < 6:
            self.heap[oid] = None  # reserve, protects against cycles
            self.heap[oid] = self.describe(value, depth)
        elif oid not in self.heap:
            self.heap[oid] = {"t": type(value).__name__, "repr": "..."}
        return {"k": "ref", "id": oid}

    def describe(self, value, depth):
        limit = 40
        if isinstance(value, list):
            return {"t": "list", "items": [self.encode(v, depth + 1) for v in value[:limit]], "more": max(0, len(value) - limit)}
        if isinstance(value, tuple):
            return {"t": "tuple", "items": [self.encode(v, depth + 1) for v in value[:limit]], "more": max(0, len(value) - limit)}
        if isinstance(value, (set, frozenset)):
            items = list(value)[:limit]
            try:
                items.sort(key=repr)
            except Exception:
                pass
            return {"t": type(value).__name__, "items": [self.encode(v, depth + 1) for v in items], "more": max(0, len(value) - limit)}
        if isinstance(value, dict):
            pairs = list(value.items())[:limit]
            return {"t": "dict", "pairs": [[self.encode(k, depth + 1), self.encode(v, depth + 1)] for k, v in pairs], "more": max(0, len(value) - limit)}
        if isinstance(value, types.FunctionType):
            return {"t": "function", "name": value.__name__, "params": list(value.__code__.co_varnames[: value.__code__.co_argcount])}
        if isinstance(value, type):
            return {"t": "class", "name": value.__name__}
        if isinstance(value, types.ModuleType):
            return {"t": "module", "name": value.__name__}
        if isinstance(value, (types.BuiltinFunctionType, types.MethodType)):
            return {"t": "function", "name": getattr(value, "__name__", "?"), "params": []}
        attrs = getattr(value, "__dict__", None)
        if isinstance(attrs, dict):
            pairs = [(k, v) for k, v in attrs.items() if not k.startswith("__")][:limit]
            return {"t": "instance", "cls": type(value).__name__, "attrs": [[k, self.encode(v, depth + 1)] for k, v in pairs]}
        try:
            text = repr(value)
        except Exception:
            text = f"<{type(value).__name__}>"
        return {"t": type(value).__name__, "repr": text[:200]}


def loop_lines(source):
    try:
        tree = ast.parse(source)
    except SyntaxError:
        return []
    found = []
    for node in ast.walk(tree):
        if isinstance(node, (ast.For, ast.While)):
            found.append({"line": node.lineno, "end": getattr(node, "end_lineno", node.lineno), "kind": type(node).__name__.lower()})
    return found


def trace(request_json):
    req = json.loads(request_json)
    files = req.get("files", {})
    entry = req.get("entry", "main.py")
    limit = int(req.get("limit", DEFAULT_TRACE_LIMIT))
    steps = []
    result = {"status": "ok", "error": None, "steps": steps, "limit": limit, "loops": loop_lines(files.get(entry, "")), "entry": entry}
    session = Session(files, entry, inputs=req.get("inputs"), stream=req.get("stream", True), fast_sleep=True, seed=req.get("seed"))
    entry_path = entry

    def learner_frame(frame):
        name = frame.f_code.co_filename
        return name == entry_path or name.startswith(WORKDIR)

    def snapshot(frame, event, arg):
        enc = HeapEncoder()
        stack = []
        f = frame
        while f is not None:
            if learner_frame(f):
                is_module = f.f_code.co_name == "<module>"
                variables = []
                for key, value in f.f_locals.items():
                    if key.startswith("__") or isinstance(value, types.ModuleType):
                        continue
                    if is_module and key in ("ppc_bridge",):
                        continue
                    variables.append([key, enc.encode(value)])
                stack.append({"name": "global" if is_module else f.f_code.co_name, "line": f.f_lineno, "file": display_name(f.f_code.co_filename), "vars": variables})
            f = f.f_back
        stack.reverse()
        step = {"event": event, "line": frame.f_lineno, "file": display_name(frame.f_code.co_filename), "stack": stack, "heap": enc.heap, "out": len(session.transcript.printed(include_prompts=True))}
        if event == "return":
            step["ret"] = enc.encode(arg)
        if event == "exception":
            step["exc"] = f"{arg[0].__name__}: {arg[1]}"
        steps.append(step)
        if len(steps) >= limit:
            raise TraceLimitReached()

    def tracer(frame, event, arg):
        if not learner_frame(frame):
            return None
        if event in ("line", "return", "exception"):
            snapshot(frame, event, arg)
        return tracer

    with session:
        try:
            _source, code = session.compile_entry()
            sys.settrace(tracer)
            try:
                session.run_main(code)
            finally:
                sys.settrace(None)
        except TraceLimitReached:
            result["status"] = "limit"
        except SystemExit:
            pass
        except KeyboardInterrupt:
            result["status"] = "stopped"
        except OutputLimitReached:
            result["status"] = "output-limit"
        except BaseException as exc:  # noqa: BLE001
            result["status"] = "error"
            result["error"] = describe_error(exc, files)
    result["output"] = session.transcript.printed(include_prompts=True)
    return json.dumps(result)


# ---------------------------------------------------------------------------
# The test harness
# ---------------------------------------------------------------------------

class Check:
    kind = "check"

    def __init__(self, name, visible=False, stretch=False, hint=None, timeout=None):
        self.name = name
        self.visible = visible
        self.stretch = stretch
        self.hint = hint
        self.timeout = timeout

    def meta(self):
        return {"name": self.name, "kind": self.kind, "visible": self.visible, "stretch": self.stretch, "hint": self.hint}


class OutputCheck(Check):
    kind = "output"

    def __init__(self, name, inputs=(), expect="", match="lines", ignore_case=False, include_prompts=False, tol=1e-6, files=None, seed=None, set_vars=None, argv=None, exit_code=None, **kw):
        super().__init__(name, **kw)
        self.set_vars = set_vars or {}
        self.argv = list(argv or [])
        self.exit_code = exit_code
        self.inputs = list(inputs)
        self.expect = expect
        self.match = match
        self.ignore_case = ignore_case
        self.include_prompts = include_prompts
        self.tol = tol
        self.files = files or {}
        self.seed = seed

    def meta(self):
        m = super().meta()
        m.update({"inputs": self.inputs, "expect": self.expect, "match": self.match})
        if self.argv:
            m["argv"] = self.argv
        if self.set_vars:
            m["setVars"] = {k: repr(v) for k, v in self.set_vars.items()}
        return m


class FunctionCheck(Check):
    kind = "function"

    def __init__(self, name, call, args=(), kwargs=None, expect=None, tol=None, returns_type=None, inputs=(), files=None, seed=None, prints=None, **kw):
        super().__init__(name, **kw)
        self.call = call
        self.args = tuple(args)
        self.kwargs = kwargs or {}
        self.expect = expect
        self.tol = tol
        self.returns_type = returns_type
        self.inputs = list(inputs)
        self.files = files or {}
        self.seed = seed
        self.prints = prints

    def call_text(self):
        parts = [repr(a) for a in self.args] + [f"{k}={v!r}" for k, v in self.kwargs.items()]
        return f"{self.call}({', '.join(parts)})"

    def meta(self):
        m = super().meta()
        m.update({"call": self.call_text(), "expect": repr(self.expect)})
        return m


class StructureCheck(Check):
    kind = "structure"

    def __init__(self, name, requires=(), forbids=(), defines=(), calls=(), forbids_calls=(), check=None, message=None, **kw):
        super().__init__(name, **kw)
        self.requires = list(requires)
        self.forbids = list(forbids)
        self.defines = list(defines)
        self.calls = list(calls)
        self.forbids_calls = list(forbids_calls)
        self.check = check
        self.message = message


class VariableCheck(Check):
    kind = "variable"

    def __init__(self, name, variable, expect=None, inputs=(), tol=None, files=None, seed=None, **kw):
        super().__init__(name, **kw)
        self.variable = variable
        self.expect = expect
        self.inputs = list(inputs)
        self.tol = tol
        self.files = files or {}
        self.seed = seed

    def meta(self):
        m = super().meta()
        m.update({"inputs": self.inputs, "call": self.variable, "expect": repr(self.expect)})
        return m


class CustomCheck(Check):
    kind = "custom"

    def __init__(self, name, fn, **kw):
        super().__init__(name, **kw)
        self.fn = fn


def output(name, **kw):
    return OutputCheck(name, **kw)


def function(name, **kw):
    return FunctionCheck(name, **kw)


def structure(name, **kw):
    return StructureCheck(name, **kw)


def variable(name, **kw):
    return VariableCheck(name, **kw)


def custom(name, fn=None, **kw):
    if fn is None:
        return lambda f: CustomCheck(name, f, **kw)
    return CustomCheck(name, fn, **kw)


class CheckFailed(AssertionError):
    def __init__(self, message, expected=None, actual=None, extra=None):
        super().__init__(message)
        self.message = message
        self.expected = expected
        self.actual = actual
        self.extra = extra or {}


# -- comparing output ---------------------------------------------------------

NUMBER_RE = re.compile(r"-?\d+(?:\.\d+)?")


def norm_lines(text, ignore_case=False):
    lines = [line.rstrip() for line in text.replace("\r\n", "\n").split("\n")]
    while lines and lines[-1] == "":
        lines.pop()
    if ignore_case:
        lines = [l.lower() for l in lines]
    return lines


def output_matches(actual, expect, match, ignore_case=False, tol=1e-6):
    if match == "exact":
        return actual == expect
    if match == "lines":
        return norm_lines(actual, ignore_case) == norm_lines(expect, ignore_case)
    a = actual.lower() if ignore_case else actual
    e = expect.lower() if ignore_case else expect
    if match == "contains":
        return e.strip() in a
    if match == "last_line":
        lines = norm_lines(a)
        lines = [l for l in lines if l.strip()]
        return bool(lines) and lines[-1].strip() == e.strip()
    if match == "regex":
        flags = re.M | (re.I if ignore_case else 0)
        return re.search(expect, actual, flags) is not None
    if match == "numbers":
        got = [float(x) for x in NUMBER_RE.findall(actual)]
        want = [float(x) for x in NUMBER_RE.findall(expect)]
        return len(got) == len(want) and all(abs(g - w) <= tol for g, w in zip(got, want))
    raise ValueError(f"Unknown match mode: {match}")


def diagnose_output(actual, expect, match, ignore_case, read_input=True):
    """A human guess at why printed output differs. None if nothing specific."""
    a_lines = [l for l in norm_lines(actual) if l.strip()]
    e_lines = [l for l in norm_lines(expect) if l.strip()]
    if not a_lines:
        return "Nothing was printed. Is there a print() for the result?"
    if not ignore_case and norm_lines(actual, True) == norm_lines(expect, True):
        return "The words are right but the capital letters differ."
    squash = lambda s: re.sub(r"\s+", "", s)
    if squash(actual) == squash(expect):
        return "The words are right but the spacing differs. Check the spaces inside your strings."
    if [l.strip(" .,!") for l in a_lines] == [l.strip(" .,!") for l in e_lines]:
        return "Nearly there: the punctuation at the end of a line differs."
    # numbers: formatting and off-by-one
    a_nums = NUMBER_RE.findall(actual)
    e_nums = NUMBER_RE.findall(expect)
    if a_nums and e_nums and len(a_nums) == len(e_nums):
        for got, want in zip(a_nums, e_nums):
            if got == want:
                continue
            try:
                g, w = float(got), float(want)
            except ValueError:
                continue
            if g == w and "." in want and len(want.split(".")[1]) != len(got.split(".")[1] if "." in got else ""):
                places = len(want.split(".")[1])
                return f"The value is right but it needs exactly {places} decimal places. An f-string like {{total:.{places}f}} does that."
            if abs(g - w) == 1:
                return "Off by one. Check where a count starts and whether the last value is included."
            if "." in got and "." in want and abs(g - w) < 10 ** -len(want.split(".")[1]) and len(got.split(".")[1]) > len(want.split(".")[1]):
                places = len(want.split(".")[1])
                return f"Nearly: {got} is {want} with floating-point noise. Round it for display with an f-string like {{total:.{places}f}}."
    # text repeated instead of multiplied: "33" where 6 was expected. Only when the
    # program read input(), which is where the text comes from.
    for got in a_nums if read_input else ():
        for want in e_nums:
            if len(got) > 1 and len(set(got)) == 1 and got != want:
                digit = got[0]
                try:
                    if float(want) == float(digit) * len(got):
                        return "That looks like text repeated rather than a number multiplied. input() gives text; int() or float() turns it into a number."
                except ValueError:
                    pass
    a_all, e_all = norm_lines(actual), norm_lines(expect)
    if len(a_all) == len(e_all) and len(a_all) > 1:
        diffs = [i for i, (a, e) in enumerate(zip(a_all, e_all)) if a != e]
        if len(diffs) == 1:
            i = diffs[0]
            ordinal = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"]
            which = ordinal[i] if i < len(ordinal) else f"number {i + 1}"
            return f"Everything matches except the {which} line. Compare it with the expected one, character by character."
    if len(a_lines) > len(e_lines) and all(any(e.strip() == a.strip() for a in a_lines) for e in e_lines):
        return "The right lines are there, plus some extra ones. Remove the extra print() calls."
    if len(a_lines) < len(e_lines) and all(any(a.strip() == e.strip() for e in e_lines) for a in a_lines):
        return "Some lines are missing from the output."
    return None


def diagnose_value(actual, expect):
    if actual is None and expect is not None:
        return "The function gave back None. Did it print the answer instead of returning it?"
    if isinstance(actual, str) and not isinstance(expect, str):
        try:
            if float(actual) == float(expect):
                return f"It returned the text {actual!r}, not the number {expect!r}."
        except (TypeError, ValueError):
            pass
    if isinstance(expect, str) and not isinstance(actual, str) and str(actual) == expect:
        return f"It returned {actual!r} as a {type(actual).__name__}. This check wants the text {expect!r}."
    if isinstance(actual, (int, float)) and isinstance(expect, (int, float)) and not isinstance(actual, bool):
        if abs(actual - expect) == 1:
            return "Off by one."
        if isinstance(expect, int) and isinstance(actual, float) and actual == expect:
            return None
    if isinstance(actual, list) and isinstance(expect, list) and sorted(map(repr, actual)) == sorted(map(repr, expect)):
        return "The right items, in a different order."
    return None


def values_equal(actual, expect, tol):
    if isinstance(actual, bool) or isinstance(expect, bool):
        return type(actual) is type(expect) and actual == expect
    if isinstance(actual, (int, float)) and isinstance(expect, (int, float)):
        if tol is not None:
            return abs(actual - expect) <= tol
        if isinstance(actual, float) or isinstance(expect, float):
            return math.isclose(actual, expect, rel_tol=1e-9, abs_tol=1e-9)
        return actual == expect
    if isinstance(expect, (list, tuple)):
        return type(actual) is type(expect) and len(actual) == len(expect) and all(values_equal(a, e, tol) for a, e in zip(actual, expect))
    if isinstance(expect, dict):
        return isinstance(actual, dict) and actual.keys() == expect.keys() and all(values_equal(actual[k], expect[k], tol) for k in expect)
    return type(actual) is type(expect) and actual == expect


# -- structure helpers ---------------------------------------------------------

def node_names(tree):
    return {type(n).__name__ for n in ast.walk(tree)}


def called_names(tree):
    names = set()
    for n in ast.walk(tree):
        if isinstance(n, ast.Call):
            if isinstance(n.func, ast.Name):
                names.add(n.func.id)
            elif isinstance(n.func, ast.Attribute):
                names.add(n.func.attr)
    return names


def defined_functions(tree):
    return {n.name for n in ast.walk(tree) if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))}


FRIENDLY_NODES = {
    "For": "a for loop",
    "While": "a while loop",
    "If": "an if statement",
    "FunctionDef": "a function (def)",
    "Return": "a return statement",
    "ListComp": "a list comprehension",
    "DictComp": "a dict comprehension",
    "SetComp": "a set comprehension",
    "Try": "a try block",
    "ClassDef": "a class",
    "With": "a with block",
    "Break": "break",
    "Continue": "continue",
    "JoinedStr": "an f-string",
    "Lambda": "a lambda",
    "Yield": "yield",
    "Import": "an import",
    "ImportFrom": "an import",
}


def friendly(node):
    return FRIENDLY_NODES.get(node, node)


# -- context passed to custom checks ------------------------------------------

class Context:
    def __init__(self, files, entry):
        self.files = files
        self.entry = entry
        self.source = files.get(entry, "")
        self._tree = None
        self._open = []

    @property
    def tree(self):
        if self._tree is None:
            self._tree = ast.parse(self.source)
        return self._tree

    def run_program(self, inputs=(), files=None, seed=None, argv=None):
        """Run the whole program with scripted inputs and return what happened."""
        merged = dict(self.files)
        merged.update(files or {})
        session = Session(merged, self.entry, inputs=list(inputs), stream=False, fast_sleep=True, seed=seed, argv=argv)
        with session:
            error = None
            try:
                _src, code = session.compile_entry()
                session.run_main(code)
            except SystemExit as exc:
                session.exit_code = exc.code if isinstance(exc.code, int) else (0 if exc.code is None else 1)
            except (KeyboardInterrupt, OutputLimitReached, TraceLimitReached):
                raise
            except BaseException as exc:  # noqa: BLE001
                error = exc
        return ProgramResult(session, error, merged)

    def module(self, inputs=(), files=None, seed=None):
        """Import the learner's file as a module. input() and print() stay patched
        until the check finishes, so functions can be called safely."""
        merged = dict(self.files)
        merged.update(files or {})
        session = Session(merged, self.entry, inputs=list(inputs), stream=False, fast_sleep=True, seed=seed)
        session.__enter__()
        self._open.append(session)
        _src, code = session.compile_entry()
        try:
            return session.run_main(code, name="learner_main")
        except InputsExhausted:
            raise CheckFailed("The file asks for input() as soon as it loads. Put that code inside if __name__ == \"__main__\": so the functions can be tested on their own.")

    def close(self):
        while self._open:
            self._open.pop().__exit__(None, None, None)


class ProgramResult:
    def __init__(self, session, error, files):
        self.session = session
        self.error = error
        self.files = files
        self.output = session.transcript.printed()
        self.stderr = "".join(text for kind, text in session.transcript.parts if kind == "err")
        self.terminal = session.transcript.as_terminal()
        self.exit_code = getattr(session, "exit_code", 0)
        self.files_out = session.changed_files() if hasattr(session, "changed_files") else {}

    def lines(self):
        return [l for l in norm_lines(self.output)]


# -- running checks -----------------------------------------------------------

def load_checks(tests_source):
    namespace = {
        "__name__": "ppc_tests",
        "output": output,
        "function": function,
        "structure": structure,
        "variable": variable,
        "custom": custom,
        "CheckFailed": CheckFailed,
        "norm_lines": norm_lines,
    }
    exec(compile(tests_source, "tests.py", "exec"), namespace)
    checks = namespace.get("TESTS")
    if checks is None:
        checks = [v for v in namespace.values() if isinstance(v, Check)]
    return [c for c in checks if isinstance(c, Check)]


def describe(request_json):
    req = json.loads(request_json)
    checks = load_checks(req["tests"])
    return json.dumps([c.meta() for c in checks])


def with_values(source, entry, values):
    """Compile the program with the first top-level `name = constant` for each
    name replaced, so a fixed program can be tested with other values."""
    tree = ast.parse(source)
    found = set()
    for node in tree.body:
        if (
            isinstance(node, ast.Assign)
            and len(node.targets) == 1
            and isinstance(node.targets[0], ast.Name)
            and node.targets[0].id in values
            and node.targets[0].id not in found
            and isinstance(node.value, (ast.Constant, ast.UnaryOp, ast.List, ast.Tuple, ast.Dict, ast.Set))
        ):
            name = node.targets[0].id
            # Any Python literal: numbers, text, lists, dicts...
            replacement = ast.parse(repr(values[name]), mode="eval").body
            node.value = ast.copy_location(replacement, node.value)
            ast.fix_missing_locations(node)
            found.add(name)
    missing = [name for name in values if name not in found]
    if missing:
        names = " and ".join(missing)
        raise CheckFailed(f"This check changes {names} to try other values. Set {names} near the top to a plain value, like {missing[0]} = 3.")
    ast.fix_missing_locations(tree)
    return compile(tree, entry, "exec", dont_inherit=True)


def run_output_check(c, ctx):
    files = dict(ctx.files)
    files.update(c.files)
    code = with_values(ctx.source, ctx.entry, c.set_vars) if c.set_vars else None
    session = Session(files, ctx.entry, inputs=c.inputs, stream=False, fast_sleep=True, seed=c.seed, code=code, argv=c.argv)
    report = {"inputs": c.inputs, "expected": c.expect}
    if c.set_vars:
        report["setVars"] = {k: repr(v) for k, v in c.set_vars.items()}
    exit_code = 0
    with session:
        try:
            _src, code = session.compile_entry()
            session.run_main(code)
        except SystemExit as exc:
            exit_code = exc.code if isinstance(exc.code, int) else (0 if exc.code is None else 1)
            if exc.code is not None and not isinstance(exc.code, int):
                session.transcript.add("err", f"{exc.code}\n")
        except InputsExhausted:
            report["actual"] = session.transcript.as_terminal()
            raise CheckFailed(
                f"The program asked for input {session.inputs_requested} times. This check only gives it {len(c.inputs)}.",
                expected=c.expect,
                actual=report["actual"],
            )
    printed = session.transcript.printed(include_prompts=c.include_prompts)
    report["actual"] = printed
    report["terminal"] = session.transcript.as_terminal()
    if c.exit_code is not None and exit_code != c.exit_code:
        raise CheckFailed(f"The program should finish with exit code {c.exit_code}, but it finished with {exit_code}.", expected=c.expect, actual=printed)
    if not output_matches(printed, c.expect, c.match, c.ignore_case, c.tol):
        message = diagnose_output(printed, c.expect, c.match, c.ignore_case, read_input=session.inputs_requested > 0)
        raise CheckFailed(message or "The output is not what was expected.", expected=c.expect, actual=printed, extra={"terminal": report["terminal"]})
    return report


def run_function_check(c, ctx):
    module = ctx.module(inputs=c.inputs, files=c.files, seed=c.seed)
    session = ctx._open[-1]
    fn = getattr(module, c.call, None)
    report = {"call": c.call_text(), "expected": repr(c.expect)}
    if fn is None:
        names = sorted(n for n, v in vars(module).items() if isinstance(v, types.FunctionType) and not n.startswith("_"))
        found = f" Functions found: {', '.join(names)}." if names else " No functions were found."
        raise CheckFailed(f"There is no function called {c.call}.{found}", expected=report["expected"], actual="(missing)")
    if not callable(fn):
        raise CheckFailed(f"{c.call} exists but it is not a function.", expected=report["expected"], actual=repr(fn))
    mark = len(session.transcript.parts)
    actual = fn(*c.args, **c.kwargs)
    printed = "".join(text for kind, text in session.transcript.parts[mark:] if kind == "out")
    report["actual"] = repr(actual)
    report["printed"] = printed
    if c.returns_type is not None and not isinstance(actual, c.returns_type):
        wanted = c.returns_type.__name__ if isinstance(c.returns_type, type) else str(c.returns_type)
        raise CheckFailed(f"{c.call} should return a {wanted}, but it returned a {type(actual).__name__}.", expected=report["expected"], actual=report["actual"])
    if c.expect is not None or c.returns_type is None:
        if not values_equal(actual, c.expect, c.tol):
            message = diagnose_value(actual, c.expect)
            raise CheckFailed(message or f"{c.call_text()} should give back {c.expect!r}.", expected=report["expected"], actual=report["actual"])
    if c.prints is not None and norm_lines(printed) != norm_lines(c.prints):
        raise CheckFailed(f"{c.call_text()} should print {c.prints!r}.", expected=c.prints, actual=printed)
    return report


def run_structure_check(c, ctx):
    tree = ctx.tree
    present = node_names(tree)
    for node in c.requires:
        if node not in present:
            raise CheckFailed(c.message or f"This step needs {friendly(node)}.")
    for node in c.forbids:
        if node in present:
            raise CheckFailed(c.message or f"This step should be done without {friendly(node)}.")
    defined = defined_functions(tree)
    for name in c.defines:
        if name not in defined:
            raise CheckFailed(c.message or f"Define a function called {name}.")
    calls = called_names(tree)
    for name in c.calls:
        if name not in calls:
            raise CheckFailed(c.message or f"This step needs a call to {name}().")
    for name in c.forbids_calls:
        if name in calls:
            raise CheckFailed(c.message or f"Do this without calling {name}().")
    if c.check is not None:
        problem = c.check(tree, ctx.source)
        if problem:
            raise CheckFailed(problem if isinstance(problem, str) else (c.message or "The code is not shaped the way this step needs."))
    return {}


def run_variable_check(c, ctx):
    module = ctx.module(inputs=c.inputs, files=c.files, seed=c.seed)
    report = {"call": c.variable, "expected": repr(c.expect), "inputs": c.inputs}
    if not hasattr(module, c.variable):
        raise CheckFailed(f"There is no variable called {c.variable}.", expected=report["expected"], actual="(missing)")
    actual = getattr(module, c.variable)
    report["actual"] = repr(actual)
    if not values_equal(actual, c.expect, c.tol):
        message = diagnose_value(actual, c.expect)
        raise CheckFailed(message or f"{c.variable} should be {c.expect!r}.", expected=report["expected"], actual=report["actual"])
    return report


def run_custom_check(c, ctx):
    value = c.fn(ctx)
    return value if isinstance(value, dict) else {}


RUNNERS = {
    "output": run_output_check,
    "function": run_function_check,
    "structure": run_structure_check,
    "variable": run_variable_check,
    "custom": run_custom_check,
}


def check(request_json):
    req = json.loads(request_json)
    files = req.get("files", {})
    entry = req.get("entry", "main.py")
    default_timeout = int(req.get("timeoutMs", 10_000))
    ctx = Context(files, entry)
    report = {"status": "ok", "results": [], "syntaxError": None}

    # A syntax error fails every check the same way, so say it once.
    try:
        compile(files.get(entry, ""), entry, "exec", dont_inherit=True)
    except SyntaxError as exc:
        report["status"] = "syntax-error"
        report["syntaxError"] = describe_error(exc, files)
        try:
            report["tests"] = [c.meta() for c in load_checks(req["tests"])]
        except BaseException:
            report["tests"] = []
        return json.dumps(report)

    checks = load_checks(req["tests"])
    ppc_bridge.event("tests", json.dumps([c.meta() for c in checks]))
    for index, c in enumerate(checks):
        timeout = int(c.timeout * 1000) if c.timeout else default_timeout
        entry_report = c.meta()
        entry_report.update({"passed": False, "message": None, "error": None})
        ppc_bridge.event("test-start", json.dumps({"index": index, "timeoutMs": timeout}))
        started = time.monotonic()
        try:
            entry_report.update(RUNNERS[c.kind](c, ctx))
            entry_report["passed"] = True
        except CheckFailed as exc:
            entry_report["message"] = exc.message
            if exc.expected is not None:
                entry_report["expected"] = exc.expected
            if exc.actual is not None:
                entry_report["actual"] = exc.actual
            entry_report.update(exc.extra)
        except KeyboardInterrupt:
            secs = max(1, round(timeout / 1000))
            entry_report["message"] = f"This took longer than {secs} second{'s' if secs != 1 else ''}. A loop that never ends is the usual cause."
            entry_report["timedOut"] = True
        except OutputLimitReached:
            entry_report["message"] = f"The program printed more than {MAX_OUTPUT_LINES} lines. A loop that never ends is the usual cause."
        except AssertionError as exc:
            entry_report["message"] = str(exc) or "A check inside this test failed."
        except BaseException as exc:  # noqa: BLE001
            entry_report["error"] = describe_error(exc, files)
            entry_report["message"] = "The program crashed during this check."
        finally:
            ctx.close()
        entry_report["ms"] = int((time.monotonic() - started) * 1000)
        report["results"].append(entry_report)
        ppc_bridge.event("test-end", json.dumps({"index": index, "result": entry_report}, default=repr))
    return json.dumps(report, default=repr)


# ---------------------------------------------------------------------------
# review(): Paul's code style notes on a shipped project (Section 5.1)
#
# A small, beginner-sized subset of PEP 8 checks, written against the AST so it
# runs in Pyodide (Ruff can't). Every rule carries Paul's reason. Notes never
# stop a Job shipping.
# ---------------------------------------------------------------------------

BUILTIN_NAMES = {
    "list", "dict", "str", "int", "float", "input", "print", "sum", "max", "min", "id", "type", "len", "set",
    "tuple", "range", "open", "map", "filter", "sorted", "next", "iter", "all", "any", "round", "format",
    "object", "bytes", "hash", "vars", "dir", "zip", "abs", "pow", "bool", "chr", "ord", "file",
}

STYLE_RULES = {
    "shadowed-builtin": "Name it for what it holds",
    "variable-name": "Lower case, with underscores",
    "function-name": "Lower case, with underscores",
    "class-name": "Classes get capital letters",
    "compare-none": "Compare with None using is",
    "compare-bool": "No need to compare with True",
    "bare-except": "Say which error you expect",
    "mutable-default": "A default list is shared by every call",
    "unused-import": "An import nobody uses",
    "ambiguous-name": "A name that looks like a number",
    "deep-nesting": "Too many levels deep",
    "long-line": "A line too long to read in one go",
    "semicolon": "One statement to a line",
}
STYLE_ORDER = list(STYLE_RULES)


def _snake(name):
    out = re.sub(r"(?<=[a-z0-9])([A-Z])", r"_\1", name).lower()
    return re.sub(r"_+", "_", out)


def _capwords(name):
    return "".join(part[:1].upper() + part[1:] for part in re.split(r"_+", name) if part)


def style_notes(source, filename):
    try:
        tree = ast.parse(source)
    except SyntaxError:
        return []
    notes = []

    def note(rule, node_or_line, message):
        line = node_or_line if isinstance(node_or_line, int) else getattr(node_or_line, "lineno", 1)
        notes.append({"rule": rule, "title": STYLE_RULES[rule], "file": filename, "line": line, "message": message})

    def check_name(name, node, kind):
        if name in BUILTIN_NAMES:
            note("shadowed-builtin", node, f"`{name}` is already a name Python knows, and now `{name}()` won't work further down. Call it something that says what it holds.")
        elif name in ("l", "O", "I"):
            note("ambiguous-name", node, f"`{name}` looks like a 1 or a 0 in plenty of fonts. Use a word.")
        elif kind == "variable" and re.search(r"[a-z]", name) and re.search(r"[A-Z]", name):
            note("variable-name", node, f"`{_snake(name)}`, not `{name}`. Python names are lower case with underscores, so everyone's code reads the same.")

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            if not (node.name.startswith("__") and node.name.endswith("__")) and not re.fullmatch(r"_*[a-z][a-z0-9_]*", node.name):
                note("function-name", node, f"`{_snake(node.name)}`, not `{node.name}`. Python readers take a capital letter to mean a class.")
            for arg in node.args.args + node.args.kwonlyargs:
                check_name(arg.arg, arg, "variable")
            for default in node.args.defaults + [d for d in node.args.kw_defaults if d is not None]:
                mutable = isinstance(default, (ast.List, ast.Dict, ast.Set)) or (isinstance(default, ast.Call) and isinstance(default.func, ast.Name) and default.func.id in ("list", "dict", "set"))
                if mutable:
                    note("mutable-default", default, f"`{node.name}` has a list or dict as a default. It's made once and shared by every call that leaves it out. Default to None and make a fresh one inside.")
        elif isinstance(node, ast.ClassDef):
            if not re.fullmatch(r"_*[A-Z][A-Za-z0-9]*", node.name):
                note("class-name", node, f"`{_capwords(node.name)}`, not `{node.name}`. Then anyone can tell a class from a function at a glance.")
        elif isinstance(node, (ast.Assign, ast.AnnAssign, ast.AugAssign, ast.For, ast.comprehension, ast.With)):
            targets = node.targets if isinstance(node, ast.Assign) else [getattr(node, "target", None)] if not isinstance(node, ast.With) else [i.optional_vars for i in node.items]
            for target in targets:
                for sub in ast.walk(target) if target is not None else []:
                    if isinstance(sub, ast.Name) and isinstance(sub.ctx, ast.Store) and not sub.id.isupper():
                        check_name(sub.id, sub, "variable")
        elif isinstance(node, ast.Compare):
            for op, right in zip(node.ops, node.comparators):
                if isinstance(op, (ast.Eq, ast.NotEq)) and isinstance(right, ast.Constant):
                    if right.value is None:
                        word = "is" if isinstance(op, ast.Eq) else "is not"
                        note("compare-none", node, f"Write `{word} None`. `==` asks the object whether it's equal, and an object can say yes to anything; `is` can't be fooled.")
                    elif right.value is True or right.value is False:
                        note("compare-bool", node, "The condition is already True or False, so `== True` adds nothing: `if done:` reads better, and `if not done:` for False.")
        elif isinstance(node, ast.ExceptHandler) and node.type is None:
            note("bare-except", node, "A bare `except:` catches every error, Ctrl+C included, and hides the ones you didn't expect. Name the one you mean: `except ValueError:`.")

    # Imports nobody uses (names only, at module level).
    used = {n.id for n in ast.walk(tree) if isinstance(n, ast.Name)}
    used |= {n.value.id for n in ast.walk(tree) if isinstance(n, ast.Attribute) and isinstance(n.value, ast.Name)}
    for node in tree.body:
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            for alias in node.names:
                name = (alias.asname or alias.name).split(".")[0]
                if name != "*" and name not in used and "__all__" not in source:
                    note("unused-import", node, f"`{name}` is imported and never used. Take it out: the next reader will go looking for where it matters.")

    # Nesting depth inside functions.
    def depth_walk(node, depth, fn):
        for child in ast.iter_child_nodes(node):
            if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                continue
            d = depth + 1 if isinstance(child, (ast.If, ast.For, ast.While, ast.With, ast.Try)) else depth
            if d > 4:
                note("deep-nesting", child, f"`{fn}` goes {d} levels deep here. Pull the inside out into a function with a good name, or return early.")
                return True
            if depth_walk(child, d, fn):
                return True
        return False

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            depth_walk(node, 0, node.name)

    for number, text in enumerate(source.splitlines(), start=1):
        if len(text) > 99:
            note("long-line", number, f"Line {number} is {len(text)} characters. Past about 99 it stops fitting on a screen. Break it after a comma, or give part of it a name.")
            break
    try:
        import tokenize
        for tok in tokenize.generate_tokens(io.StringIO(source).readline):
            if tok.type == tokenize.OP and tok.string == ";":
                note("semicolon", tok.start[0], "One statement to a line. A semicolon makes the reader hunt for where one thing ends.")
                break
    except (tokenize.TokenError, IndentationError, SyntaxError):
        pass
    return notes


def review(request_json):
    """Style notes for the learner's files: the first note of each kind, most useful first."""
    req = json.loads(request_json)
    notes = []
    for name, source in sorted(req.get("files", {}).items()):
        if name.endswith(".py") and not os.path.basename(name).startswith("test_"):
            notes.extend(style_notes(source, name))
    first = {}
    counts = {}
    for n in notes:
        counts[n["rule"]] = counts.get(n["rule"], 0) + 1
        first.setdefault(n["rule"], n)
    out = []
    for rule in STYLE_ORDER:
        if rule in first:
            out.append({**first[rule], "count": counts[rule]})
    return json.dumps({"notes": out[: req.get("limit", 3)], "total": len(notes)})
