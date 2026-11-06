---
id: learn-precision-recall
type: learn
title: Precision and recall
concept: classification-metrics
code: |
  tp, fp, fn = 2, 2, 1      # the eight nights from the last example

  precision = tp / (tp + fp)
  recall = tp / (tp + fn)
  f1 = 2 * precision * recall / (precision + recall)
  print(round(precision, 2), round(recall, 2), round(f1, 2))
---
Two numbers from the confusion matrix say what accuracy hides.

**Precision** starts from the warnings: of the times it warned, the share that were right, `tp / (tp + fp)`.

**Recall** starts from the real cases: of the times it happened, the share that were warned, `tp / (tp + fn)`.

Warn every night and recall is perfect, precision poor. Never warn and recall is 0. The example's eight nights print `0.5 0.67`: half the warnings were right, and two storms of three were caught.

**F1**, `2 * precision * recall / (precision + recall)`, puts them together. It's high only when both are, so one good number can't hide a bad one: here `0.57`.

The usual mistake is swapping them. Precision is about the warnings; recall is about the real cases.
