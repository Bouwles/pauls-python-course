---
id: postage-tests
type: make
title: Tests from a spec
files: [test_postage.py, postage.py]
entry: test_postage.py
on_pass: { paul.proud.thumbs: "Every broken postage caught, and the real one passed. Those are tests you can lean on." }
hints:
  nudge: "Where in the docstring does one price stop and the next begin, and what should be refused?"
  plan:
    - One typical weight in each band
    - The top weight of each band, and one gram past it
    - Away is twice local, at more than one weight
    - Everything that should be refused, with pytest.raises
  shape: |
    def test_each_band_at_its_top_weight():
        assert postage(100, "local") == ___
        assert postage(___, "local") == 90
        assert postage(2000, "local") == ___


    def test_away_is_twice_local():
        for weight in (1, 100, ___, 2000):
            assert postage(weight, "away") == ___


    def test_too_heavy_to_post():
        with pytest.raises(___):
            postage(___, "local")
---
Your project's test plan will start as sentences. This step is practice at turning sentences into tests that catch mutants.

`postage.py` is the postage for Riya's prints, from her shop's website, with its rules in the docstring. Write tests for it in `test_postage.py`, from the docstring alone, as if you couldn't see the code. Press Run and pytest runs them.

1. A typical weight in each price band.
2. The top weight of each band, and one gram past it.
3. Away is twice local, at more than one weight.
4. Everything the docstring refuses, with `pytest.raises(ValueError)`.

Write plain test functions with no arguments.

Done: your tests pass on the real postage, and fail on each of eight mutants the checks make, the kind of mistakes people really make.
