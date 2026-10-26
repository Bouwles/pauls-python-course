Python does arithmetic with seven operators: `+` (add), `-` (subtract), `*` (multiply), `/` (divide), `//` (floor division, which divides and drops the remainder), `%` (modulo, which gives the remainder) and `**` (power). They work on whole numbers (`int`) and decimals (`float`), and most programs use them for totals, shares and conversions. Three of them catch people out: `/` always gives a float, `%` is a remainder rather than a percentage, and the power operator is `**`, not `^`.

## How it works

```python
print(6 / 2, 7 / 2)
print(7 // 2, 7 % 2)
print(2 ** 10, 2 ** 0.5)
print(3 + 1.5, 2 * 3.0)
print(2 ** 100)
```

```text
3.0 3.5
3 1
1024 1.4142135623730951
4.5 6.0
1267650600228229401496703205376
```

`/` always gives a float, even for an exact division. `+`, `-`, `*`, `//` and `%` keep whole numbers whole until one side is a float. A power of 0.5 is a square root. Whole numbers have no upper limit, so `2 ** 100` is exact; floats are approximate, as [float()](/handbook/float-conversion) explains.

`//` and `%` are a pair: together they split an amount into large units and what is left over. `divmod()` gives both at once:

```python
pence = 437
print(pence // 100, pence % 100)
print(divmod(135, 60))
hour = 22
print((hour + 5) % 24)
print(14 % 2, 15 % 2)
```

```text
4 37
(2, 15)
3
0 1
```

437 pence is £4.37, and 135 minutes is 2 hours 15. `% 24` wraps round a clock: five hours after 22:00 is 3:00. A remainder of 0 from `% 2` means the number is even.

Floor division gives the whole number at or below the exact answer, which for positive numbers just drops the remainder. Negative numbers differ:

```python
print(19 // 10, round(19 / 10))
print(7.5 // 2)
print(-7 // 2, -7 % 2)
print(int(-7 / 2))
```

```text
1 2
3.0
-4 1
-3
```

With a float on either side, `//` gives a float. `-7 // 2` is -4, the whole number below -3.5, and `-7 % 2` is 1, so that `-4 * 2 + 1` is -7 again. [int()](/handbook/int-conversion) cuts towards zero instead, giving -3. Dividing by zero with `/`, `//` or `%` is `ZeroDivisionError: division by zero`.

## Common mistakes

- **Expecting `/` to give a whole number.** Even `6 / 2` is `3.0`, which fails where only an int will do: `range(10 / 2)` is `TypeError: 'float' object cannot be interpreted as an integer`. Use `//` for a whole number.
- **Thinking `//` rounds to the nearest whole number.** `19 // 10` is 1, not 2: the remainder is dropped. For the nearest whole number, use `round(19 / 10)`.
- **Reading `%` as a percentage.** `50 % 10` is 0, the remainder when 50 is divided by 10. To find 10 per cent of 50, multiply: `50 * 10 / 100` gives 5.0.
- **Writing `^` for a power.** `^` is a different operator in Python (bitwise exclusive or), so `2 ^ 3` quietly gives 1. Powers use `**`: `2 ** 3` is 8.

## Related

[Operator precedence](/handbook/operator-precedence) decides which part of a mixed sum goes first. Results are usually kept in [variables](/handbook/variables), and numbers typed by a user need [int()](/handbook/int-conversion) or [float()](/handbook/float-conversion) before any arithmetic.
