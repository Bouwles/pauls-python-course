# Sanjay's Monday labels.
# Each item: (name, price in pence, how many in the shop)
stock = [
    ("apples", 45, 30),
    ("pears", 60, 8),
    ("leeks", 80, 0),
    ("plums", 25, 12),
    ("kale", 150, 4),
]


def labels(stock):
    return [
        f"{name.upper()} {price}p" if count > 0 else f"{name.upper()} sold out"
        for name, price, count in stock
    ]


def reorder(stock):
    return {name for name, price, count in stock if count < 10}


def price_book(stock):
    return {name: price for name, price, count in stock if count > 0}


for label in labels(stock):
    print(label)
print("Reorder:", ", ".join(sorted(reorder(stock))))
