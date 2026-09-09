/* Paul's Python Course - all lesson content lives here.
   To add a lesson: append one object to LESSONS and delete the matching
   entry from UPCOMING. Nothing else needs editing. See README.md. */

window.LESSONS = [
  {
    id: 1,
    slug: "first-lines",
    title: "Your first lines of code",
    summary: "print, quotes, comments, variables and input.",
    objectives: [
      "Run Python without installing anything",
      "Make the computer print a message",
      "Store information in a variable",
      "Ask the person using your program a question"
    ],

    sections: [
      {
        type: "text",
        heading: "What Python is",
        body: [
          "Python is a language for giving a computer instructions. It reads your file top to bottom, one line at a time, the way you read a recipe: do this, then do this, then do this.",
          "The words look close to English. That is the whole reason we start here rather than somewhere else. You will be able to guess what a lot of it does before anyone explains it to you."
        ]
      },

      {
        type: "code",
        heading: "print",
        body: "print is how you get the computer to say something back to you. Whatever sits inside the brackets is what shows up.",
        code: 'print("Hello")\n',
        explain: "Press Run. The word Hello appears underneath. Change Hello to something else and run it again.",
        runnable: true
      },

      {
        type: "mistake",
        heading: "Text needs quotes",
        body: "The quotes are not decoration. They are how you tell Python that this is text, not a name.",
        wrong: 'print(Hello)',
        right: 'print("Hello")',
        why: "Without quotes, Python thinks Hello is the name of something you made earlier. It goes looking for it, does not find it, and stops with a NameError. With quotes, Python does not try to look anything up. It just takes the letters as they are."
      },

      {
        type: "code",
        heading: "Comments",
        body: "Anything after a # is skipped. Python does not read it at all. Use comments to leave yourself a reminder, or to switch a line off without deleting it.",
        code: '# this line is a note to myself\nprint("This line runs")\n# print("This line does not run")\n',
        explain: "Only one line prints. The third line is still there, still readable, just switched off. That is a very common way to test things.",
        runnable: true
      },

      {
        type: "code",
        heading: "Variables",
        body: "A variable is a labelled box. The label is the name you chose, and the thing inside is the value. You put something in with =, and you get it back out by using the name.",
        code: 'name = "Sara"\nprint(name)\n',
        explain: "The box is labelled name and it holds the text Sara. Asking for name gives you what is inside the box.",
        runnable: true
      },

      {
        type: "mistake",
        heading: "The name, or the word",
        body: "This one catches everybody once.",
        wrong: 'name = "Sara"\nprint("name")',
        right: 'name = "Sara"\nprint(name)',
        why: "With quotes you asked for the four letters n-a-m-e, so that is what you get. Without quotes you asked for whatever is in the box labelled name, which is Sara. Quotes mean text. No quotes means look this up."
      },

      {
        type: "code",
        heading: "Numbers do not need quotes",
        body: "Text needs quotes. Numbers do not. A number in quotes is text that happens to look like a number, which is a different thing, and it will matter later.",
        code: 'name = "Sara"\nage = 14\nprint(name)\nprint(age)\n',
        explain: "Two boxes, two prints, two lines of output. Put your own name and age in and run it.",
        runnable: true
      },

      {
        type: "code",
        heading: "input",
        body: "input stops the program and waits for someone to type something and press enter. Whatever they typed comes back as text, so you usually put it straight into a variable. The + sign glues two pieces of text together.",
        code: 'name = input("What is your name? ")\nprint("Hi " + name)\n',
        explain: "Two spaces are doing quiet work here. The space after the question mark keeps the typing cursor off the question, and the space after Hi stops it reading HiSara. Take them out and run it to see.",
        runnable: true
      },

      {
        type: "callout",
        heading: "Errors are normal",
        body: [
          "You will see red text today. That is not a sign that anything is broken, and nothing you wrote is lost.",
          "Read the last line first. It names the problem, for example NameError or SyntaxError. Just above it Python tells you the line number it was on when it gave up. Go to that line, then look at the line above it too.",
          "Everyone who writes code sees these every single day. Reading them is the skill, not avoiding them."
        ]
      }
    ],

    practice: [
      {
        id: "p1",
        prompt: "Print your own name.",
        starter: '# type your code here\n',
        hint: "print, then brackets, then your name inside quotes.",
        solution: 'print("Paul")\n',
        check: { type: "output-not-empty" }
      },
      {
        id: "p2",
        prompt: "Print two lines: your name, and then your favourite food.",
        starter: '# two prints, one under the other\n',
        hint: "Each print gets its own line, and each one puts its text on a new line of output.",
        solution: 'print("Paul")\nprint("Katsu curry")\n',
        check: {
          type: "custom",
          message: "That gave one line of output. Two separate prints give you two lines.",
          fn: function (ctx) {
            return ctx.output.split("\n").filter(function (l) { return l.trim() !== ""; }).length >= 2;
          }
        }
      },
      {
        id: "p3",
        prompt: "Store your age in a variable called age, then print it.",
        starter: '# make the box, then look inside it\n',
        hint: "age = 14 on one line, print(age) on the next. No quotes around the number, and no quotes around age in the print.",
        solution: 'age = 14\nprint(age)\n',
        check: [
          { type: "code-contains", value: "age =", message: "I could not find a variable called age. It needs age = and then the number." },
          { type: "output-not-empty" }
        ]
      },
      {
        id: "p4",
        prompt: "Ask for a name with input, then greet that person by it.",
        starter: '# ask first, then say hello\n',
        hint: 'name = input("What is your name? ") on one line, then print("Hi " + name). Watch the spaces.',
        solution: 'name = input("What is your name? ")\nprint("Hi " + name)\n',
        check: { type: "code-contains", value: ["input", "print"], message: "This one needs both input and print in it." }
      },
      {
        id: "p5",
        prompt: "Put a comment at the top of your file saying who wrote it.",
        starter: 'print("done")\n',
        hint: "A # at the start of the line, then your name. Python will skip it.",
        solution: '# written by Paul\nprint("done")\n',
        check: {
          type: "custom",
          message: "I could not see a line starting with #.",
          fn: function (ctx) { return /^[ \t]*#/m.test(ctx.code); }
        }
      }
    ],

    /* Question types: "choice" (the default), "predict" (shows code, options
       are output, rendered as code), "write" (they type a line of Python).
       `review` is the index of the section worth re-reading if they get it
       wrong; it drives the list at the end of the quiz. */
    quiz: [
      {
        question: 'What do the quotes in print("Hello") tell Python?',
        options: [
          "That this is text and should be taken exactly as written",
          "That Hello is the name of a variable to look up",
          "That the line should be skipped"
        ],
        answer: 0,
        explain: "Quotes mean text. Without them Python would go looking for something called Hello, and not find it.",
        review: 2
      },
      {
        question: "What does # do?",
        options: [
          "Makes the line run twice",
          "Makes Python ignore the rest of that line",
          "Turns the line into a heading"
        ],
        answer: 1,
        explain: "Everything after # on that line is skipped, which is handy for notes and for switching a line off.",
        review: 3
      },
      {
        type: "predict",
        question: "What comes out when this runs?",
        code: '# print("one")\nprint("two")\n',
        options: ["two", "one\ntwo", "one"],
        answer: 0,
        explain: "The first line is commented out, so Python skips it entirely. Only the second line runs.",
        review: 3
      },
      {
        question: 'If name = "Sara", what does print("name") show?',
        options: ["Sara", "name", "An error"],
        answer: 1,
        explain: "The quotes mean you asked for the word itself. Drop the quotes and you get what is in the box: Sara.",
        review: 5
      },
      {
        type: "predict",
        question: "What comes out when this runs?",
        code: 'name = "Sara"\nprint(name)\nprint("name")\n',
        options: ["Sara\nname", "Sara\nSara", "name\nname"],
        answer: 0,
        explain: "Line two asks for what is in the box, so you get Sara. Line three has quotes, so you get the word name.",
        review: 5
      },
      {
        question: "Which one of these stops with a NameError?",
        options: ['print("Hello")', "print(Hello)", "# print(Hello)"],
        optionsAreCode: true,
        answer: 1,
        explain: "Without quotes Python goes looking for something called Hello. The third line is a comment, so Python never even reads it.",
        review: 2
      },
      {
        type: "write",
        question: "Write the line that shows the word Hello on the screen.",
        placeholder: 'one line of Python',
        accept: ['print("Hello")'],
        explain: "print, then brackets, then the text inside quotes.",
        review: 1
      },
      {
        question: "What does input do?",
        options: [
          "Prints a question on the screen and carries straight on",
          "Waits for someone to type something and press enter",
          "Loads a file from your computer"
        ],
        answer: 1,
        explain: "It stops and waits. Whatever gets typed comes back as text, so you normally store it in a variable.",
        review: 7
      },
      {
        type: "predict",
        question: "Someone types Sara. What comes out?",
        code: 'name = input("What is your name? ")\nprint("Hi" + name)\n',
        options: ["HiSara", "Hi Sara", "Hi + Sara"],
        answer: 0,
        explain: "+ joins the two pieces of text exactly as they are. There is no space at the end of \"Hi\", so nothing separates them. Write \"Hi \" to get one.",
        review: 7
      },
      {
        type: "write",
        question: "Write the line that puts the number 14 into a variable called age.",
        placeholder: "one line of Python",
        accept: ["age = 14"],
        explain: "The name goes on the left, the = in the middle, the value on the right. Numbers do not need quotes.",
        review: 6
      }
    ],

    cheatsheet: [
      { code: 'print(x)', meaning: "shows x on the screen" },
      { code: '"text"', meaning: "quotes mean this is text, not a name" },
      { code: '# comment', meaning: "the rest of the line is ignored" },
      { code: 'name = value', meaning: "put a value in a box labelled name" },
      { code: 'input("question ")', meaning: "wait for someone to type an answer" },
      { code: '"Hi " + name', meaning: "glue two pieces of text together" }
    ],

    next: "Numbers, doing maths, int(), and getting Python to make decisions with if and else."
  },

  {
    id: 2,
    slug: "numbers-and-decisions",
    title: "Numbers and decisions",
    summary: "Doing maths, turning text into numbers, and getting Python to choose.",
    objectives: [
      "Do maths in Python",
      "Understand why input always gives you text",
      "Use if and else to make the program choose",
      "Build a small number guessing game"
    ],

    sections: [
      {
        type: "code",
        heading: "Numbers do not need quotes",
        body: [
          "You met this at the end of lesson 1. Today it starts to matter.",
          "age = 14 is a number. age = \"14\" is text that happens to look like a number. On screen they come out identical, which is exactly why this one catches people."
        ],
        code: 'age = 14\nage_text = "14"\nprint(age)\nprint(age_text)\n',
        explain: "Two lines of output, and you cannot tell them apart by looking. One is a number you can do maths with. The other is two characters, a 1 and a 4, and Python treats it completely differently.",
        runnable: true
      },

      {
        type: "code",
        heading: "Doing maths",
        body: [
          "Python does sums with the symbols you already know: + adds, - takes away, * multiplies, / divides. No quotes anywhere, because these are numbers.",
          "The odd one is /. It always hands back a decimal, even when the sum comes out even, so 10 / 2 is 5.0 and not 5. Two more you will see later on: // divides and throws away everything after the point, and % gives you the remainder. You do not need those today."
        ],
        code: 'print(10 + 3)\nprint(10 - 3)\nprint(10 * 3)\nprint(10 / 2)\n',
        explain: "The last line is the surprise: 5.0, with a point and a zero. Change the numbers and run it again.",
        runnable: true
      },

      {
        type: "mistake",
        heading: "input always gives you text",
        body: [
          "This is the part of the lesson to hang on to. input does not care what the person types. Numbers, words, their whole name, it all comes back as text.",
          "So when someone types 14, you have not got the number 14. You have got the characters 1 and 4, sitting in a box, looking like a number and behaving like text.",
          "Which means the moment you try to do maths with it, Python stops."
        ],
        wrong: 'age = input("How old are you? ")\nprint(age + 1)',
        right: 'age = int(input("How old are you? "))\nprint(age + 1)',
        why: "The broken one stops with TypeError: can only concatenate str (not \"int\") to str. Said out loud: Python will not add a number to text, because it does not know which one you meant. Did you want 14 + 1 to come out as 15, or did you want the 14 and the 1 stuck together as 141? Both are fair. Python will not guess, so it stops and waits for you to say which. int() is how you say it."
      },

      {
        type: "code",
        heading: "int() turns text into a number",
        body: "int() takes text that looks like a number and gives you back the actual number. You wrap it round the input, so the text goes in, a number comes out, and what lands in the box is something you can do maths with.",
        code: 'age = int(input("How old are you? "))\nprint("Next year you will be")\nprint(age + 1)\n',
        explain: "Read the brackets from the inside out: input asks the question, int turns the answer into a number, and = puts it in the box. If you want decimals rather than whole numbers, float() does the same job.",
        runnable: true
      },

      {
        type: "code",
        heading: "Comparing things",
        body: [
          "A comparison asks a question and gets back True or False, nothing else. == asks are these the same, != asks are these different, and > < >= <= do what they look like.",
          "Here is the one that trips up everybody. = puts something in a box. == asks a question. One equals sign stores, two equals signs compare."
        ],
        code: 'age = 14\nprint(age == 14)\nprint(age == 20)\nprint(age != 20)\nprint(age > 10)\nprint(age <= 13)\n',
        explain: "Five questions, five answers, and every answer is either True or False. Note the capital T and F. That is how Python writes them.",
        runnable: true
      },

      {
        type: "code",
        heading: "if",
        body: "if runs some lines only when something is True. The if line ends with a colon, and the lines that belong to it are pushed in from the left. That gap is called indentation, and it is the only thing telling Python which lines are inside the if. Four spaces is the normal amount.",
        code: 'age = int(input("How old are you? "))\nif age >= 13:\n    print("You can watch it")\n',
        explain: "Type 15 and the message appears. Type 9 and nothing happens at all, because the indented line only runs when the answer to age >= 13 is True.",
        runnable: true
      },

      {
        type: "mistake",
        heading: "Indentation is not decoration",
        body: "In plenty of languages the spaces at the start of a line are only tidiness. In Python they carry meaning, and Python will not let you skip them.",
        wrong: 'age = 14\nif age >= 13:\nprint("You can watch it")',
        right: 'age = 14\nif age >= 13:\n    print("You can watch it")',
        why: "The broken one stops with IndentationError: expected an indented block. A colon at the end of a line is Python saying something belongs underneath this, and it will be pushed in. Nothing was pushed in, so Python has an if with nothing inside it and gives up. Four spaces, every time."
      },

      {
        type: "code",
        heading: "else",
        body: "if covers one case. else covers the rest of the time. It gets its own colon and its own indented lines, and exactly one of the two blocks runs, never both and never neither.",
        code: 'age = int(input("How old are you? "))\nif age >= 13:\n    print("You can watch it")\nelse:\n    print("Not this one, sorry")\n',
        explain: "Run it twice, once with a big number and once with a small one. Notice that else lines up underneath if rather than being pushed in, because it is part of the same decision.",
        runnable: true
      },

      {
        type: "code",
        heading: "elif",
        body: "Two options is if and else. More than two is elif, which is short for else if. Python works down the list from the top and stops at the first one that is True, so everything below it gets skipped. The else at the bottom catches whatever is left.",
        code: 'score = int(input("What did you get out of 100? "))\n\nif score >= 70:\n    print("A")\nelif score >= 50:\n    print("B")\nelse:\n    print("Have another go")\n',
        explain: "Type 85. It is 70 or more, so it prints A and never even looks at the elif. Type 60 and the first question comes back False, so Python moves down to the next one. You can have as many elif lines as you need.",
        runnable: true
      },

      {
        type: "code",
        heading: "Putting it together",
        body: "Everything from this lesson in one small program: a number, an input, int(), a comparison, and a decision with three ways it can go.",
        code: 'secret = 7\nguess = int(input("Guess a number from 1 to 10: "))\n\nif guess == secret:\n    print("Correct")\nelif guess < secret:\n    print("Too low")\nelse:\n    print("Too high")\n',
        explain: "It gives you one go and then stops, which is a bit mean. Getting it to ask again until you are right is what a loop does, and loops are lesson 3.",
        runnable: true
      }
    ],

    practice: [
      {
        id: "p1",
        prompt: "Print the answer to 17 * 23. Do not work it out yourself, let Python do it.",
        starter: '# let Python do the maths\n',
        hint: "print, then the sum inside the brackets. No quotes: with quotes you would get the sum printed back at you instead of the answer.",
        solution: 'print(17 * 23)\n',
        check: { type: "output-contains", value: "391", message: "I was looking for the answer to 17 * 23 in the output. Put the sum inside print, with no quotes round it." }
      },
      {
        id: "p2",
        prompt: "Ask for two numbers and print their total.",
        starter: '# two questions, then one answer\n',
        hint: 'Two lines of int(input("...")), each into its own variable, then print the two variables added together.',
        solution: 'first = int(input("First number: "))\nsecond = int(input("Second number: "))\nprint(first + second)\n',
        check: [
          { type: "code-contains", value: "input", message: "This one needs input, so the person using it can type the numbers in." },
          { type: "code-contains", value: "int(", message: "input gives you text. Wrap it in int() or the two numbers get glued together instead of added up." }
        ]
      },
      {
        id: "p3",
        prompt: "Ask someone their age and tell them how old they will be in ten years.",
        starter: '# ask, convert, add ten\n',
        hint: "Same shape as the example: int(input(...)) into a variable, then print that variable plus 10.",
        solution: 'age = int(input("How old are you? "))\nprint("In ten years you will be")\nprint(age + 10)\n',
        check: [
          { type: "code-contains", value: "int(", message: "The answer from input is text, so it needs int() round it before you can add ten to it." },
          { type: "output-not-empty" }
        ]
      },
      {
        id: "p4",
        prompt: "Ask for a number and print whether it is bigger than 100.",
        starter: '# ask, then decide\n',
        hint: "if number > 100: on one line with a colon, the print pushed in four spaces underneath, then else: with its own print.",
        solution: 'number = int(input("Give me a number: "))\nif number > 100:\n    print("That is bigger than 100")\nelse:\n    print("That is not bigger than 100")\n',
        check: [
          { type: "code-contains", value: "if", message: "This one needs an if, so the program can decide." },
          { type: "code-contains", value: "else", message: "Add an else so it still says something when the number is not bigger than 100." }
        ]
      },
      {
        id: "p5",
        prompt: "Ask for a test score out of 100 and print a grade using if, elif and else.",
        starter: '# three ways this can go\n',
        hint: "Put the highest score at the top. Python stops at the first one that is True, so if you start low everything lands in the first branch.",
        solution: 'score = int(input("What did you get out of 100? "))\nif score >= 70:\n    print("A")\nelif score >= 50:\n    print("B")\nelse:\n    print("Have another go")\n',
        check: [
          { type: "code-contains", value: "if", message: "This one starts with an if." },
          { type: "code-contains", value: "elif", message: "It needs an elif in the middle for the third option." },
          { type: "code-contains", value: "else", message: "It needs an else at the bottom to catch everything that is left." }
        ]
      },
      {
        id: "p6",
        prompt: "Make your own version of the guessing game with a different secret number and different messages.",
        starter: '# your game, your secret, your words\n',
        hint: "Copy the shape from the last example: a secret, an int(input(...)) guess, then if, elif and else. Change the number and write the messages yourself.",
        solution: 'secret = 3\nguess = int(input("Pick a number from 1 to 5: "))\n\nif guess == secret:\n    print("Spot on")\nelif guess < secret:\n    print("Go higher")\nelse:\n    print("Go lower")\n',
        check: {
          type: "custom",
          message: "A guessing game needs input to get the guess, then if and elif so it can say correct, too low or too high.",
          fn: function (ctx) {
            var code = ctx.code.toLowerCase();
            return code.indexOf("input") !== -1 && /\bif\b/.test(code) && code.indexOf("elif") !== -1;
          }
        }
      }
    ],

    quiz: [
      {
        question: "What does input always give you, no matter what the person types?",
        options: [
          "Text",
          "A number if they typed a number, text if they typed a word",
          "Whatever type you asked for"
        ],
        answer: 0,
        explain: "Always text. Even 14 comes back as the characters 1 and 4, which is the whole reason int() exists.",
        review: 2
      },
      {
        question: "What is the difference between = and ==?",
        options: [
          "= stores a value, == compares two things",
          "They do the same job, == is the tidier one",
          "= compares two things, == stores a value"
        ],
        answer: 0,
        explain: "One equals sign puts something in a box. Two equals signs ask a question and get back True or False.",
        review: 4
      },
      {
        question: 'Why does print(input("Age? ") + 1) break?',
        options: [
          "You cannot add a number to text",
          "print only takes one thing at a time",
          "input has to go on its own line"
        ],
        answer: 0,
        explain: "input hands back text, and Python will not guess whether you meant to add up or to stick together. Wrap it in int() to do maths with it.",
        review: 2
      },
      {
        type: "predict",
        question: "What comes out when this runs?",
        code: 'print(10 / 2)\n',
        options: ["5.0", "5", "5.5"],
        answer: 0,
        explain: "/ always hands back a decimal, even when it divides evenly.",
        review: 1
      },
      {
        question: "What decides which lines belong to an if?",
        options: [
          "The indentation, the spaces at the start of the line",
          "The order they are written in",
          "The colon at the end of every line"
        ],
        answer: 0,
        explain: "The spaces are the whole mechanism. Four spaces in means the line is inside the if. Back at the left means it is not.",
        review: 6
      }
    ],

    cheatsheet: [
      { code: '+ - * /', meaning: "add, take away, multiply, divide", example: 'print(10 + 3)\nprint(10 - 3)\nprint(10 * 3)\nprint(10 / 2)\n' },
      { code: 'int(x)', meaning: "turn text that looks like a number into a number", example: 'age = int(input("How old are you? "))\nprint(age + 1)\n' },
      { code: '= and ==', meaning: "= puts something in a box, == asks a question", example: 'age = 14\nprint(age == 14)\n' },
      { code: '> and <', meaning: "bigger than, smaller than, and the or equal to versions >= and <=", example: 'age = 14\nprint(age > 10)\nprint(age <= 13)\n' },
      { code: 'if x > 5:', meaning: "run the indented lines only when this is True", example: 'x = 9\nif x > 5:\n    print("bigger")\n' },
      { code: 'elif x > 3:', meaning: "check this next, if everything above it was False", example: 'x = 4\nif x > 5:\n    print("bigger")\nelif x > 3:\n    print("middling")\n' },
      { code: 'else:', meaning: "run these lines the rest of the time", example: 'x = 1\nif x > 5:\n    print("bigger")\nelse:\n    print("smaller")\n' },
      { code: 'four spaces', meaning: "indentation is what shows which lines are inside the if", example: 'if 2 > 1:\n    print("this line is inside the if")\nprint("this line is not")\n' }
    ],

    next: "Loops: getting Python to repeat things with while, so a guessing game can keep asking until you get it right."
  }
];

/* Lessons not written yet. These render as locked cards on the home page. */
window.UPCOMING = [
  { id: 3, title: "Loops", summary: "Repeating things, and while." },
  { id: 4, title: "Your own functions", summary: "def, arguments, and return." }
];
