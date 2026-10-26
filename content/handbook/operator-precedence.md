Operator precedence is the order in which Python works out a calculation with more than one operator in it. It follows the order taught in school maths, often remembered as BIDMAS or BODMAS: brackets first, then powers, then multiplication and division, then addition and subtraction. So `2 + 3 * 4` is 14, not 20. Operators of the same rank go from left to right, and brackets override the order whenever you need them to.

## How it works

From first to last, Python's arithmetic order is:

1. Brackets: `( )`
2. Powers: `**`
3. Multiplication and division: `*`, `/`, `//` and `%`
4. Addition and subtraction: `+` and `-`

```python
print(2 + 3 * 4)
print((2 + 3) * 4)
print(20 - 6 - 4)
print(20 - (6 - 4))
print(12 / 2 * 3)
print(12 / (2 * 3))
```

```text
14
20
10
18
18.0
2.0
```

`*` and `/` share a rank, so `12 / 2 * 3` goes left to right: 12 divided by 2, then times 3, not 12 divided by 6. In the same way, `20 - 6 - 4` takes away 6, then 4. And because `//` and `%` rank with `*`, `17 + 5 % 3` is 19, not 1.

Powers are the exception to left to right:

```python
print(2 ** 3 ** 2)
print((2 ** 3) ** 2)
print(-3 ** 2)
print((-3) ** 2)
```

```text
512
64
-9
9
```

`**` goes right to left, so `2 ** 3 ** 2` is 2 to the power of 9. It also binds more tightly than a minus sign in front of it, so `-3 ** 2` means `-(3 ** 2)`.

Arithmetic comes before comparisons, and comparisons come before `not`, `and` and `or`, so `price * 3 > 700` multiplies first and then compares. The order among `not`, `and` and `or` is on the [Boolean operators](/handbook/boolean-operators) page.

Brackets that change nothing still help. `(4 * 85) + 30` gives the same answer as `4 * 85 + 30`, but nobody has to stop and check. A long calculation is clearer still split into steps, each kept in a well-named [variable](/handbook/variables).

## Common mistakes

- **Working strictly from left to right.** `4 + 2 * 3` is 10, not 18, because the `2 * 3` happens first. To add first, bracket it: `(4 + 2) * 3`.
- **Leaving the brackets off an average.** `240 + 85 / 2` halves only the 85 and gives 282.5. The average is `(240 + 85) / 2`, which is 162.5.
- **Dividing by two things without brackets.** `total / 2 * people` divides by 2, then multiplies by `people`. To divide by both, write `total / (2 * people)`.
- **Squaring a negative number without brackets.** `-3 ** 2` is -9. Write `(-3) ** 2` for 9.

## Related

The operators themselves, including `//`, `%` and `**`, are on the [arithmetic](/handbook/arithmetic) page. For the tests that come after the sums, see [comparisons](/handbook/comparisons).
