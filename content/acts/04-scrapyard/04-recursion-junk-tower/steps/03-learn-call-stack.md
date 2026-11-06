---
id: learn-call-stack
type: learn
title: Calls that wait
concept: call-stack
code: |
  def visit(level):
      print("in", level)
      if level > 1:
          visit(level - 1)
      print("out", level)


  visit(2)
---
When a function calls another, the first one stops on that line and waits. When the call it made returns, the first carries on from where it stopped, with its own variables just as it left them.

Python keeps every waiting call in a pile called the **call stack**. Picture a stack of crates: each new call goes on top, only the top one runs, and when it returns it comes off and the one underneath carries on. So the newest call always finishes first.

The example prints a line going into each call and one coming out: `in 2`, `in 1`, `out 1`, `out 2`. Press Step through: the editor draws the call stack as a tower of crates.

The usual slip is to think the old call is left behind. It waits, and finishes later.
