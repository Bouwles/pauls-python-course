def verdict(score, total):
    if score * 2 >= total:
        return "Respectable."
    else:
        return "There's always next Tuesday."


def main():
    score = 3
    total = 5
    print(f"You scored {score} out of {total}.")
    print(verdict(score, total))


if __name__ == "__main__":
    main()
