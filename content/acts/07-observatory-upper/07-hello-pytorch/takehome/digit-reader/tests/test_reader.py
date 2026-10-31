"""The digit reader's checks. Run them with: pytest"""

import sys

import numpy as np
import pytest
import torch
from torch import nn

from notebooks import load_split
from reader import DigitReader, accuracy, blackboard_gradients, to_tensors, train


@pytest.fixture(scope="module")
def digits():
    """The same split as reader.py, as tensors, made here so these tests don't depend on to_tensors."""
    X_learn, labels_learn, X_held, labels_held = load_split()
    return (torch.tensor(X_learn, dtype=torch.float32), torch.tensor(labels_learn),
            torch.tensor(X_held, dtype=torch.float32), torch.tensor(labels_held))


def test_to_tensors_types_and_shapes():
    X = np.random.default_rng(0).uniform(0, 1, (5, 64))
    labels = np.array([3, 1, 4, 1, 5])
    X_t, labels_t = to_tensors(X, labels)
    assert isinstance(X_t, torch.Tensor) and isinstance(labels_t, torch.Tensor)
    assert X_t.shape == (5, 64) and X_t.dtype == torch.float32
    assert labels_t.shape == (5,) and labels_t.dtype == torch.long


def test_to_tensors_keeps_the_numbers():
    X = np.array([[0.0, 0.25, 1.0] + [0.5] * 61])
    X_t, labels_t = to_tensors(X, np.array([7]))
    assert torch.allclose(X_t, torch.tensor(X, dtype=torch.float32))
    assert labels_t.tolist() == [7]


def test_blackboard_gradients_match_the_blackboard():
    d_w1, d_w2 = blackboard_gradients()
    assert isinstance(d_w1, float) and isinstance(d_w2, float), "Use .item() to turn each gradient into a plain float."
    assert d_w1 == pytest.approx(24.0)
    assert d_w2 == pytest.approx(4.0)


def test_the_reader_is_a_module():
    assert isinstance(DigitReader(), nn.Module)


def test_layers_are_named_and_shaped():
    model = DigitReader(hidden=32)
    assert isinstance(model.hidden, nn.Linear) and isinstance(model.out, nn.Linear)
    # nn.Linear keeps its weight as (out, in): the other way round from the NumPy network's W1.
    assert model.hidden.weight.shape == (32, 64)
    assert model.out.weight.shape == (10, 32)


def test_parameter_count():
    count = sum(p.numel() for p in DigitReader(hidden=32).parameters())
    assert count == 64 * 32 + 32 + 32 * 10 + 10
    count = sum(p.numel() for p in DigitReader(hidden=16).parameters())
    assert count == 64 * 16 + 16 + 16 * 10 + 10


def test_forward_gives_a_row_of_ten_per_digit():
    torch.manual_seed(0)
    scores = DigitReader()(torch.rand(5, 64))
    assert scores.shape == (5, 10)


def test_forward_gives_scores_not_chances():
    torch.manual_seed(0)
    scores = DigitReader()(torch.rand(20, 64))
    # Chances are never negative. Raw scores usually are, somewhere.
    assert (scores < 0).any(), "forward should end at the last layer's scores. nn.CrossEntropyLoss does the softmax itself."


def test_loss_falls_over_a_few_epochs(digits):
    X, labels = digits[0][:300], digits[1][:300]
    torch.manual_seed(0)
    losses = train(DigitReader(), X, labels, epochs=3, batch_size=32, rate=0.01, seed=0)
    assert len(losses) == 3
    assert all(isinstance(loss, float) for loss in losses), "Use .item() so each loss is a plain float."
    assert losses[-1] < losses[0]


def test_training_moves_every_layer(digits):
    X, labels = digits[0][:200], digits[1][:200]
    torch.manual_seed(0)
    model = DigitReader()
    before = [p.detach().clone() for p in model.parameters()]
    assert len(before) == 4, "Two nn.Linear layers: a weight and a bias each."
    train(model, X, labels, epochs=1, batch_size=50, rate=0.01, seed=0)
    for old, new in zip(before, model.parameters()):
        assert not torch.equal(old, new), "Every weight and bias should move: zero, forward, loss, backward, step."


def test_training_is_repeatable(digits):
    X, labels = digits[0][:200], digits[1][:200]
    runs = []
    for _ in range(2):
        torch.manual_seed(3)
        runs.append(train(DigitReader(), X, labels, epochs=2, batch_size=40, rate=0.01, seed=5))
    assert isinstance(runs[0], list) and len(runs[0]) == 2
    assert runs[0] == pytest.approx(runs[1]), "Seed a torch.Generator with seed and shuffle with it: torch.randperm(n, generator=...)."


class FixedScores(nn.Module):
    """A stand-in network whose answers are known: rows guess 1, 0, 2 and 1."""

    def forward(self, x):
        return torch.tensor([[0.1, 0.9, 0.0], [2.0, 1.0, 0.5], [0.0, 0.0, 3.0], [0.3, 0.4, 0.2]])


def test_accuracy_counts_the_right_rows():
    got = accuracy(FixedScores(), torch.zeros(4, 64), torch.tensor([1, 2, 2, 1]))
    assert isinstance(got, float), "Use .item() so accuracy is a plain float."
    assert got == pytest.approx(0.75)


def test_reads_digits_it_has_never_seen(digits):
    X_learn, labels_learn, X_held, labels_held = digits
    torch.manual_seed(1)
    model = DigitReader()
    train(model, X_learn, labels_learn, epochs=15, batch_size=32, rate=0.01, seed=2)
    assert accuracy(model, X_held, labels_held) > 0.95


@pytest.mark.local
def test_python_is_new_enough():
    assert sys.version_info >= (3, 10)


@pytest.mark.local
def test_running_in_a_virtual_environment():
    assert sys.prefix != sys.base_prefix, "Make and activate a virtual environment for the project, then install requirements.txt into it."
