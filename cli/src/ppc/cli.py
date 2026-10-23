"""
ppc: fetch Take It Home Jobs, run their tests, hand them in.

Standard library only, so it installs anywhere Python does.
"""

import argparse
import base64
import io
import json
import os
import platform
import stat
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
import webbrowser
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

from . import __version__
from ._site import DEFAULT_SITE

SKIP_DIRS = {".venv", "venv", "env", "__pycache__", ".git", ".pytest_cache", ".mypy_cache", ".ruff_cache", "node_modules", ".ipynb_checkpoints"}
MAX_FILE = 1_000_000
MAX_ZIP = 9_500_000


class Problem(Exception):
    """Something the learner can fix; printed without a traceback."""


# ---------------------------------------------------------------------------
# Settings on this computer
# ---------------------------------------------------------------------------

def config_path() -> Path:
    if os.name == "nt":
        base = Path(os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming"))
    else:
        base = Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config"))
    return base / "ppc" / "config.json"


def load_config() -> dict:
    try:
        return json.loads(config_path().read_text("utf-8"))
    except (OSError, ValueError):
        return {}


def save_config(cfg: dict) -> None:
    path = config_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(cfg, indent=2), "utf-8")
    try:
        path.chmod(stat.S_IRUSR | stat.S_IWUSR)
    except OSError:
        pass


def site_for(args, project=None) -> str:
    """The course site: --site, then the project's .ppc.json, then where you logged in, then the default."""
    if getattr(args, "site", None):
        return args.site.rstrip("/")
    if project and project.get("site"):
        return project["site"].rstrip("/")
    cfg = load_config()
    if cfg.get("site"):
        return cfg["site"].rstrip("/")
    return os.environ.get("PPC_SITE", DEFAULT_SITE).rstrip("/")


def token_for(site: str) -> str:
    token = load_config().get("tokens", {}).get(site)
    if not token:
        raise Problem(f"Not signed in to {site}. Run: ppc login")
    return token


# ---------------------------------------------------------------------------
# HTTP
# ---------------------------------------------------------------------------

def request(method: str, url: str, body=None, token=None, raw=False, timeout=60):
    data = None
    headers = {"User-Agent": f"ppc/{__version__} (Python {platform.python_version()}; {platform.system()})", "Accept": "application/json"}
    if body is not None:
        data = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as res:
            payload = res.read()
            return payload if raw else json.loads(payload.decode("utf-8") or "{}")
    except urllib.error.HTTPError as err:
        text = err.read().decode("utf-8", "replace")
        try:
            message = json.loads(text)
        except ValueError:
            message = {"error": text.strip()[:200] or err.reason}
        message["status"] = err.code
        return message
    except urllib.error.URLError as err:
        raise Problem(f"Couldn't reach {url.split('/api')[0]}: {err.reason}") from None


# ---------------------------------------------------------------------------
# Projects
# ---------------------------------------------------------------------------

def find_project(start: Path):
    """The nearest folder (this one or above) with a .ppc.json, and what it says."""
    for folder in [start, *start.parents]:
        marker = folder / ".ppc.json"
        if marker.is_file():
            try:
                return folder, json.loads(marker.read_text("utf-8"))
            except ValueError:
                raise Problem(f"{marker} isn't valid JSON. Download the project again, or fix it by hand.") from None
    raise Problem("This isn't a Take It Home project folder (there's no .ppc.json here or above). cd into the project first, or fetch one with: ppc get <job-id>")


def project_python(folder: Path) -> str:
    """The project's virtual environment's Python if it has one, else this one."""
    for candidate in (folder / ".venv" / "Scripts" / "python.exe", folder / ".venv" / "bin" / "python", folder / "venv" / "bin" / "python"):
        if candidate.exists():
            return str(candidate)
    return sys.executable


def run_tests(folder: Path):
    """Run pytest in the project and read its JUnit report."""
    python = project_python(folder)
    with tempfile.TemporaryDirectory() as tmp:
        report = Path(tmp) / "report.xml"
        cmd = [python, "-m", "pytest", "-q", f"--junitxml={report}", "-p", "no:cacheprovider"]
        print(f"Running the tests with {python if python != sys.executable else 'this Python'}...\n", flush=True)
        proc = subprocess.run(cmd, cwd=folder)
        if not report.exists():
            if proc.returncode == 4 or proc.returncode == 1:
                raise Problem("pytest didn't produce a report. Is pytest installed in the project's environment? Run: pip install -r requirements.txt")
            raise Problem(f"pytest exited with code {proc.returncode} and no report. Read the output above.")
        return parse_junit(report.read_text("utf-8"))


def parse_junit(xml_text: str):
    root = ET.fromstring(xml_text)
    cases = []
    for case in root.iter("testcase"):
        name = "::".join(x for x in (case.get("classname"), case.get("name")) if x)
        outcome, message = "passed", None
        for tag, kind in (("failure", "failed"), ("error", "error"), ("skipped", "skipped")):
            el = case.find(tag)
            if el is not None:
                outcome, message = kind, (el.get("message") or "")[:500] or None
                break
        cases.append({"name": name[:300], "outcome": outcome, "message": message})
    return cases


def zip_project(folder: Path) -> bytes:
    buf = io.BytesIO()
    total = 0
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(folder.rglob("*")):
            rel = path.relative_to(folder)
            if any(part in SKIP_DIRS for part in rel.parts) or not path.is_file():
                continue
            size = path.stat().st_size
            if size > MAX_FILE:
                print(f"  leaving out {rel} ({size // 1000} KB; files over 1 MB stay on your computer)")
                continue
            total += size
            if total > MAX_ZIP:
                raise Problem("The project is over 10 MB without .venv. Move large data files out of the folder and try again.")
            zf.write(path, Path(folder.name) / rel)
    return buf.getvalue()


def summary_line(cases) -> str:
    count = {k: sum(1 for c in cases if c["outcome"] == k) for k in ("passed", "failed", "error", "skipped")}
    parts = [f"{count['passed']} passed"]
    if count["failed"]:
        parts.append(f"{count['failed']} failed")
    if count["error"]:
        parts.append(f"{count['error']} errors")
    if count["skipped"]:
        parts.append(f"{count['skipped']} skipped")
    return ", ".join(parts)


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

def cmd_login(args) -> int:
    site = site_for(args)
    start = request("POST", f"{site}/api/device/code")
    if "user_code" not in start:
        raise Problem(start.get("error") or "The site didn't give a code. Try again in a minute.")
    print(f"To connect ppc to your account, open:\n\n    {start['verification_uri']}\n\nand type this code:\n\n    {start['user_code']}\n", flush=True)
    if not args.no_browser:
        try:
            webbrowser.open(start.get("verification_uri_complete") or start["verification_uri"])
        except Exception:  # noqa: BLE001 - a missing browser is fine
            pass
    print("Waiting for you to confirm on the site (Ctrl+C to give up)...", flush=True)
    interval = max(2, int(start.get("interval", 5)))
    deadline = time.time() + int(start.get("expires_in", 900))
    while time.time() < deadline:
        time.sleep(interval)
        res = request("POST", f"{site}/api/device/token", {"device_code": start["device_code"]})
        if res.get("access_token"):
            cfg = load_config()
            cfg.setdefault("tokens", {})[site] = res["access_token"]
            cfg["site"] = site
            save_config(cfg)
            print(f"\nSigned in to {site}. Your sign-in is kept in {config_path()}.")
            return 0
        if res.get("error") == "authorization_pending":
            continue
        if res.get("error") == "expired_token":
            break
        raise Problem(f"Sign-in failed: {res.get('error')}. Run ppc login again.")
    raise Problem("The code expired before it was confirmed. Run ppc login again.")


def cmd_logout(args) -> int:
    site = site_for(args)
    cfg = load_config()
    if cfg.get("tokens", {}).pop(site, None):
        save_config(cfg)
        print(f"Signed out of {site} on this computer. To cut the connection everywhere, use Settings on the site.")
    else:
        print(f"Not signed in to {site}.")
    return 0


def cmd_status(args) -> int:
    site = site_for(args)
    signed_in = bool(load_config().get("tokens", {}).get(site))
    print(f"ppc {__version__}, Python {platform.python_version()}")
    print(f"Site: {site}")
    print("Signed in." if signed_in else "Not signed in. Run: ppc login")
    try:
        folder, project = find_project(Path.cwd())
        print(f"Project: {folder.name} (Job {project.get('job')}, step {project.get('step')})")
    except Problem:
        pass
    return 0


def cmd_get(args) -> int:
    site = site_for(args)
    url = f"{site}/api/takehome/starter?jobId={urllib.request.quote(args.job)}"
    data = request("GET", url, raw=True)
    if isinstance(data, dict):
        raise Problem(data.get("error") or f"No Take It Home project for {args.job}.")
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        top = {Path(n).parts[0] for n in zf.namelist()}
        if len(top) != 1:
            raise Problem("The download wasn't the shape ppc expected. Try the Download button on the Job page.")
        name = top.pop()
        target = Path.cwd() / name
        if target.exists():
            raise Problem(f"{name} already exists here. Move it, or cd somewhere else first.")
        for member in zf.namelist():
            dest = (Path.cwd() / member).resolve()
            if not str(dest).startswith(str(Path.cwd().resolve())):
                raise Problem("The download contained a path outside the folder; not unpacking it.")
        zf.extractall(Path.cwd())
    print(f"Downloaded {name}. Next:\n\n    cd {name}\n\nthen follow README.md to set up its virtual environment.")
    return 0


def hand_in(args, final: bool) -> int:
    folder, project = find_project(Path.cwd())
    site = site_for(args, project)
    token = token_for(site)
    cases = run_tests(folder)
    if not cases:
        raise Problem("pytest found no tests. Run ppc from inside the project folder.")
    line = summary_line(cases)
    failing = [c for c in cases if c["outcome"] in ("failed", "error")]
    print(f"\n{line}.")
    if final and failing:
        print("\nNot handed in: ppc submit only sends work that passes. Fix these first, or use ppc check to send it as it is:")
        for c in failing[:8]:
            print(f"  {c['name'].split('::')[-1]}: {(c['message'] or '').splitlines()[0] if c['message'] else ''}")
        return 1
    body = {
        "jobId": project.get("job"),
        "stepId": project.get("step"),
        "report": {"cases": cases},
        "environment": f"Python {platform.python_version()} on {platform.system()} {platform.machine()}",
        "final": final,
    }
    if not args.no_code:
        body["project"] = base64.b64encode(zip_project(folder)).decode("ascii")
    res = request("POST", f"{site}/api/takehome", body, token=token, timeout=120)
    if res.get("status") == 401:
        raise Problem("The site didn't accept your sign-in (it may have been disconnected). Run: ppc login")
    if not res.get("ok"):
        raise Problem(res.get("error") or "The site didn't accept the results.")
    if res.get("passes"):
        print(f"Handed in to {site}. The Job page shows it next time you open it.")
    else:
        print(f"Sent to {site}. Not finished yet: it needs every required test passing.")
    return 0 if res.get("passes") else 1


def cmd_check(args) -> int:
    return hand_in(args, final=False)


def cmd_submit(args) -> int:
    return hand_in(args, final=True)


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(prog="ppc", description="Take It Home Jobs for Paul's Python Course.")
    parser.add_argument("--version", action="version", version=f"ppc {__version__}")
    parser.add_argument("--site", help="the course site, e.g. https://example.org (default: where you logged in)")
    sub = parser.add_subparsers(dest="command", metavar="command")

    p = sub.add_parser("login", help="sign in: shows a code to type on the site")
    p.add_argument("--no-browser", action="store_true", help="don't try to open the browser")
    p.set_defaults(fn=cmd_login)
    sub.add_parser("logout", help="forget the sign-in on this computer").set_defaults(fn=cmd_logout)
    sub.add_parser("status", help="who you're signed in as, and where").set_defaults(fn=cmd_status)
    p = sub.add_parser("get", help="download a Job's starter project into this folder")
    p.add_argument("job", help="the Job's id, from its address: /job/<id>")
    p.set_defaults(fn=cmd_get)
    for name, fn, text in (("check", cmd_check, "run the tests and send the results and the code"), ("submit", cmd_submit, "the same, but only when everything passes")):
        p = sub.add_parser(name, help=text)
        p.add_argument("--no-code", action="store_true", help="send the results only, not the code")
        p.set_defaults(fn=fn)

    args = parser.parse_args(argv)
    if not getattr(args, "fn", None):
        parser.print_help()
        return 0
    try:
        return args.fn(args)
    except Problem as err:
        print(f"ppc: {err}", file=sys.stderr)
        return 2
    except KeyboardInterrupt:
        print("\nStopped.", file=sys.stderr)
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
