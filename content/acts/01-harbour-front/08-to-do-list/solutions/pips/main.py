# Neil's jobs, in the order he means to do them
tasks = ["mark the quizzes", "fix the projector", "order chalk", "answer Caitlin"]

board = sorted(tasks)

print("For the whiteboard:")
for task in board:
    print(task)
print("First job:", tasks[0])
