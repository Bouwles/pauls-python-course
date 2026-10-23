def show_price(price):
    if price >= 100:
        return f"£{price / 100:.2f}"
    return f"{price}p"


def labels(stock):
    return [
        f"{name.upper()} {show_price(price)}" if count > 0 else f"{name.upper()} sold out"
        for name, price, count in stock
    ]
