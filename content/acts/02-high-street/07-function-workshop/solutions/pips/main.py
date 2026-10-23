def queue_label(text, queue=None):
    """Add a label to a print queue and return the queue."""
    if queue is None:
        queue = []
    queue.append(text)
    return queue


monday = queue_label("KETTLE for Bea")
tuesday = queue_label("CLOCK for Tom")
print("Monday:", monday)
print("Tuesday:", tuesday)
