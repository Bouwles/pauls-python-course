---
id: digit-reader
type: takehome
title: The digit reader, at home
python: "3.10"
requirements: [torch, scikit-learn]
heavy: true
setup: |
  PyTorch is a big download. Install the CPU build: it's all this project needs, and a fraction of the size.

  - **Windows and macOS:** `pip install -r requirements.txt` fetches a CPU build already. On a Mac with Apple silicon it can use the GPU too, through `"mps"`.
  - **Linux:** install torch first from PyTorch's CPU index, then the rest. Otherwise pip fetches several gigabytes of GPU libraries:

  ```console
  (.venv) $ pip install torch --index-url https://download.pytorch.org/whl/cpu
  (.venv) $ pip install -r requirements.txt
  ```

  Check it worked with `python -c "import torch; print(torch.__version__)"`. scikit-learn is there only to load the digits.
dialogue:
  - aaesha.thinking: "Same digits, same split, a different engine. If it disagrees with ours, I want to know which one is wrong."
---
The project has three files: `notebooks.py` loads the digits and splits them exactly as in the Digit Recogniser, `reader.py` is yours to fill in, and `tests/` is the agreement. The comments in `reader.py` are the steps from Paul's focus line.

```console
(.venv) $ python reader.py
Loss: 0.481 after the first epoch, 0.035 after the last
Read 291 of 297 digits it had never seen
(.venv) $ pytest
```

Your numbers may differ in the last place on another version of PyTorch. The tests check shapes, the blackboard's gradients, that `forward` gives scores, that the loss falls, and that it reads more than 95% of the held-back digits. Two of them check your own computer: a recent enough Python, and a virtual environment.
