---
id: make
type: make
title: A brain that sees
files: [seeing.py]
entry: seeing.py
timeout_ms: 60000
on_pass: { wendt: "Two hundred and eighty-nine, with thirty-six numbers per digit instead of sixty-four. Fewer numbers, better ones." }
hints:
  nudge: "A digit is 8 by 8 and a kernel is 3 by 3. How many places does the kernel fit each way, and what shape does the map come out?"
  plan:
    - How many places the window fits, down and across
    - At each place, the slice under the window
    - Multiply and add
    - Write it into the answer
    - "max_pool: the biggest number in each whole block"
    - "conv_layer: convolve, add that kernel's bias, relu, for every kernel"
    - "forward: maps, pool each, flatten, scores, chances"
  shape: |
    def convolve(image, kernel):
        height, width = kernel.shape
        rows = image.shape[0] - height + 1
        cols = image.shape[1] - width + 1
        out = np.zeros((rows, cols))
        for i in range(rows):
            for j in range(cols):
                out[i, j] = np.sum(image[i:i + ___, j:j + ___] * ___)
        return out


    def max_pool(feature, size=2):
        rows, cols = feature.shape[0] // size, feature.shape[1] // size
        out = np.zeros((rows, cols))
        for i in range(rows):
            for j in range(cols):
                out[i, j] = feature[i * size:___, j * size:___].max()
        return out


    def forward(image, params):
        maps = conv_layer(image, params["kernels"], params["kernel_biases"])
        pooled = np.array([max_pool(feature) for feature in ___])
        return softmax(pooled.___() @ params["W"] + params["b"])
---
Wendt trained a small seeing brain at home, in PyTorch, then copied its numbers into `filters.py` by hand, because she trusts nothing she hasn't run herself. Four 3 by 3 kernels, then one layer that reads the pooled maps. Write its forward pass in `seeing.py`, by hand: no SciPy, no PyTorch. The comments are the subgoals from Priya's barometer.

```
A digit (8, 8) becomes maps (4, 6, 6), pooled to (4, 3, 3): 36 numbers, then 10 chances
Read 289 of 297 digits it had never seen
```

Print `PARAMS["kernels"][1]`: a row of minuses over a row of pluses. Nobody told it to look for the tops of strokes. It found them useful.

A **convolutional network** is this: kernels learned like any other weights, sliding over the picture, then layers that read what they found.
