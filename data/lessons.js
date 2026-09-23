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

    next: "Loops: getting Python to repeat things with for and while, so a guessing game can keep asking until you get it right."
  },

  {
    id: 3,
    slug: "loops",
    title: "Loops",
    summary: "Getting the computer to repeat something without writing it out fifty times.",
    objectives: [
      "Repeat something a set number of times",
      "Repeat something until a condition changes",
      "Stop a loop that will not stop",
      "Finish the guessing game properly"
    ],

    sections: [
      {
        type: "code",
        heading: "The problem",
        body: [
          "Say you want the numbers 1 to 5 on the screen. You already know how to do this."
        ],
        code: "print(1)\nprint(2)\nprint(3)\nprint(4)\nprint(5)\n",
        explain: "That works. Now do it up to a hundred. That is ninety five more lines to type, every one of them a chance to make a typo, and the computer is sitting there doing none of the work. Repeating things is the job it is best at.",
        runnable: false
      },

      {
        type: "code",
        heading: "for and range",
        body: [
          "A for loop says: run these lines once for each number I give you.",
          "The colon and the indent work exactly as they did with if last lesson. The colon says something belongs underneath this, and the four spaces say which lines."
        ],
        code: "for i in range(5):\n    print(i)\n",
        explain: "Five lines of output: 0, 1, 2, 3, 4. Five numbers, starting at zero. Python counts from zero. Take it as the convention it is, and it will stop looking odd after you have written a few of these.",
        runnable: true
      },

      {
        type: "code",
        heading: "Telling range where to start and stop",
        body: [
          "range can take more than one number. Give it two and the first is where to start, the second is where to stop.",
          "The stop number is never included. range(1, 6) gives you 1, 2, 3, 4, 5 and no 6. Give it a third number and that is the size of the step."
        ],
        code: "for i in range(1, 6):\n    print(i)\n\nfor i in range(0, 10, 2):\n    print(i)\n",
        table: {
          head: ["Written", "What you get"],
          rows: [
            ["range(5)", "0 1 2 3 4"],
            ["range(1, 6)", "1 2 3 4 5"],
            ["range(0, 10, 2)", "0 2 4 6 8"]
          ]
        },
        explain: "Change the numbers in the editor and run it again. Guess what will come out first, then check. That is the quickest way to get the feel of this.",
        runnable: true
      },

      {
        type: "code",
        heading: "What is i",
        body: [
          "i is an ordinary variable. Nothing about it is special and nothing needs the letter i. The loop puts the next value into it each time round, and you can call it whatever you like.",
          "A loop does not even need range. Give it a list of things and it walks through them one at a time."
        ],
        code: 'for number in range(3):\n    print(number)\n\nfor name in ["Sara", "Ali", "Maya"]:\n    print("Hello " + name)\n',
        explain: "Square brackets with things inside them is a list. That is all you need to know about them today, and they get a lesson of their own next time.",
        runnable: true
      },

      {
        type: "code",
        heading: "Running totals",
        body: [
          "This is the one that takes a minute to click, so give it that minute. You want to add up 1, 2, 3, 4 and 5.",
          "The answer has to be kept somewhere while it is being built, so you make a variable before the loop and start it at 0. Each time round, the current number gets added to it."
        ],
        code: "total = 0\nfor i in range(1, 6):\n    total = total + i\nprint(total)\n",
        explain: "total = total + i is not a claim that the two sides are equal. It is an instruction, and it happens in two halves: work out the right hand side first, then put that answer back in the box, replacing whatever was in there before.",
        table: {
          code: false,
          head: ["Round", "i is", "total afterwards"],
          rows: [
            ["before the loop", "-", "0"],
            ["1st", "1", "1"],
            ["2nd", "2", "3"],
            ["3rd", "3", "6"],
            ["4th", "4", "10"],
            ["5th", "5", "15"]
          ]
        },
        after: [
          "Only one number gets printed, because print is outside the loop, back at the left margin. Push it in by four spaces and you will get all five instead. Try it and watch the total climb."
        ],
        runnable: true
      },

      {
        type: "code",
        heading: "while",
        body: [
          "A for loop has to know how many times before it starts. Sometimes you do not know that. What you know instead is when to stop.",
          "while repeats for as long as something stays true. It checks the condition before every round, including the very first one, so a condition that is false at the start means the loop never runs at all."
        ],
        code: 'count = 1\nwhile count <= 5:\n    print(count)\n    count = count + 1\nprint("Done")\n',
        explain: "Use for when you know how many times. Use while when you only know what has to be true for it to keep going. The last line inside the loop is what eventually ends it: count climbs until count <= 5 stops being true.",
        runnable: true
      },

      {
        type: "mistake",
        heading: "The loop that never stops",
        body: [
          "Take the counting line out and the loop has no way of ever finishing. You will write one of these today, probably by accident."
        ],
        wrong: 'count = 1\nwhile count <= 5:\n    print(count)',
        right: 'count = 1\nwhile count <= 5:\n    print(count)\n    count = count + 1',
        why: "count never changes, so count <= 5 is true now and will still be true in a thousand years. The loop is doing exactly what it was told. Nothing is damaged and nothing is lost. On this site, press the Stop button above the output and it ends straight away with your code still sitting in the editor. On a real computer it is Ctrl and C. Everybody who writes loops does this, and it is not a sign that you are bad at it."
      },

      {
        type: "code",
        heading: "Keep asking until they get it right",
        body: [
          "while and input together is where this starts being useful. The loop keeps asking until the answer is the one you were after.",
          'The first line has to be there. The while looks at answer on its very first round, before anyone has typed anything, so answer has to already exist. Two quotes with nothing between them is an empty piece of text, and it is a perfectly good thing to start with.'
        ],
        code: 'answer = ""\nwhile answer != "yes":\n    answer = input("Ready? ")\nprint("Off we go")\n',
        explain: "!= means is not equal to. Type no a few times and watch the question come back round. Type yes and it moves on.",
        runnable: true
      },

      {
        type: "code",
        heading: "The game, finished",
        body: [
          "Last lesson the guessing game got one go. One guess, one answer, done. Wrapping it in a while loop is the thing that turns it into a game.",
          "guess = 0 is there for the same reason the empty quotes were: the while needs something to look at on the first round. Nobody is going to guess 0, so it is a safe place to start."
        ],
        code: 'secret = 7\nguess = 0\n\nwhile guess != secret:\n    guess = int(input("Guess a number from 1 to 10: "))\n    if guess < secret:\n        print("Too low")\n    elif guess > secret:\n        print("Too high")\n\nprint("Correct")\n',
        explain: 'Look down the left edge. The lines inside the while are four spaces in. The two prints are eight, because they are inside the if and the elif, which are themselves inside the while. print("Correct") is back at the margin, so it only runs once the loop has finished, and the loop can only finish when the guess is right.',
        link: { href: "lesson.html?id=2#section-10", text: "The one guess version from lesson 2" },
        runnable: true
      },

      {
        type: "code",
        aside: true,
        heading: "break",
        body: [
          "One more way out of a loop, for when you want it. break stops the loop immediately, wherever it has got to.",
          "while True is a loop with no way out built in, because True is simply always true. Put break inside it and you get: keep going until I say."
        ],
        code: 'while True:\n    answer = input("Type quit to stop: ")\n    if answer == "quit":\n        break\n    print("You said " + answer)\nprint("Finished")\n',
        explain: "Plenty of people write loops for years without ever needing this. It is here so that you recognise it when you come across it.",
        runnable: true
      }
    ],

    practice: [
      {
        id: "p1",
        prompt: "Print the numbers 1 to 20.",
        starter: "# one line to start the loop, one line to do the printing\n",
        hint: "for i in range(1, 21): on the first line, then print(i) indented underneath. Remember the stop number is never included, so it has to be 21 to get to 20.",
        solution: "for i in range(1, 21):\n    print(i)\n",
        check: [
          { type: "code-contains", value: "for", message: "This one wants a for loop rather than twenty print lines." },
          { type: "output-contains", value: ["1", "20"], message: "I was looking for everything from 1 to 20 in the output." }
        ]
      },
      {
        id: "p2",
        prompt: "Print the 7 times table, from 7 x 1 up to 7 x 12.",
        starter: "# the numbers 1 to 12, each one multiplied by 7\n",
        hint: "Loop over range(1, 13) and print 7 * i each time round. * is the multiply sign.",
        solution: "for i in range(1, 13):\n    print(7 * i)\n",
        check: {
          type: "output-contains",
          value: ["7", "84"],
          message: "The table should start at 7 and finish at 84, so both of those want to be in the output."
        }
      },
      {
        id: "p3",
        prompt: "Add up every number from 1 to 100 and print the total.",
        starter: "total = 0\n# now loop, and add each number to total\n",
        hint: "Same shape as the running total example, just with bigger numbers: total = 0 before the loop, total = total + i inside it, and print(total) at the end, outside the loop.",
        solution: "total = 0\nfor i in range(1, 101):\n    total = total + i\nprint(total)\n",
        check: {
          type: "output-contains",
          value: "5050",
          message: "Not the number I was expecting. Check the range goes all the way to 100, and that the print is outside the loop."
        }
      },
      {
        id: "p4",
        prompt: "Keep asking for a password until they type python.",
        starter: '# something for the while to look at on the first round\n',
        hint: 'Start with password = "" so there is something to check, then while password != "python": and ask again inside the loop.',
        solution: 'password = ""\nwhile password != "python":\n    password = input("Password: ")\nprint("You are in")\n',
        check: [
          { type: "code-contains", value: "while", message: "This one needs a while loop, because you do not know how many goes they will take." },
          { type: "code-contains", value: "input", message: "It needs input as well, so there is something to ask them." }
        ]
      },
      {
        id: "p5",
        prompt: "Add a counter to the guessing game so it says how many tries they took.",
        starter: 'secret = 7\nguess = 0\ntries = 0\n\n# the while loop goes here\n',
        hint: 'Add tries = tries + 1 inside the loop, just after the guess comes in. At the end, print("You took " + str(tries) + " tries"). str() is needed because tries is a number and the rest is text.',
        solution: 'secret = 7\nguess = 0\ntries = 0\n\nwhile guess != secret:\n    guess = int(input("Guess a number from 1 to 10: "))\n    tries = tries + 1\n    if guess < secret:\n        print("Too low")\n    elif guess > secret:\n        print("Too high")\n\nprint("Correct. You took " + str(tries) + " tries")\n',
        check: {
          type: "custom",
          fn: function (ctx) {
            var code = (ctx.code || "").toLowerCase();
            return code.indexOf("while") !== -1 &&
                   code.indexOf("int(") !== -1 &&
                   code.indexOf("str(") !== -1;
          },
          message: "This one wants the while loop to keep it going, int() to turn the typed guess into a number, and str() to put the count into a sentence at the end."
        }
      }
    ],

    quiz: [
      {
        question: "What does range(1, 6) give you?",
        options: ["1, 2, 3, 4, 5", "1, 2, 3, 4, 5, 6", "0, 1, 2, 3, 4, 5"],
        answer: 0,
        explain: "It starts at the first number and stops before the second one. The stop number is never included.",
        review: 2
      },
      {
        type: "predict",
        question: "What comes out when this runs?",
        code: "for i in range(3):\n    print(i)\n",
        options: ["0\n1\n2", "1\n2\n3", "0\n1\n2\n3"],
        answer: 0,
        explain: "Three numbers, starting at zero. range(3) means three of them, not up to three.",
        review: 1
      },
      {
        question: "When would you use while instead of for?",
        options: [
          "When you do not know how many times in advance, only when to stop",
          "When there are more than ten rounds to do",
          "When the numbers need to count downwards"
        ],
        answer: 0,
        explain: "for is for a known number of rounds. while is for carrying on until something changes, however long that takes.",
        review: 5
      },
      {
        type: "predict",
        question: "Why does this never stop?",
        code: "count = 1\nwhile count <= 5:\n    print(count)\n",
        options: [
          "Nothing ever changes count, so the condition stays true forever",
          "5 is too small a number for a while loop",
          "print cannot go inside a while loop"
        ],
        answer: 0,
        explain: "count stays at 1, so count <= 5 is true every single time it is checked. The loop needs a line that moves count along.",
        review: 6
      },
      {
        question: "What does total = total + i actually do?",
        options: [
          "Works out the right hand side, then stores that answer back in total",
          "Says that total and total + i are the same thing",
          "Makes a second variable also called total"
        ],
        answer: 0,
        explain: "Right side first, then the answer goes back in the box and replaces what was there. That is why it can climb.",
        review: 4
      },
      {
        type: "predict",
        question: "What is the last thing this prints?",
        code: "total = 0\nfor i in range(1, 4):\n    total = total + i\nprint(total)\n",
        options: ["6", "3", "1\n3\n6"],
        answer: 0,
        explain: "1, then 1 + 2 = 3, then 3 + 3 = 6. Only one line comes out, because print is outside the loop.",
        review: 4
      },
      {
        question: "How many levels of indent does an if inside a while need?",
        options: ["Two, so eight spaces", "One, so four spaces", "None, ifs are never indented"],
        answer: 0,
        explain: "Four spaces to be inside the while, and four more to be inside the if. Things inside two things get indented twice.",
        review: 8
      },
      {
        type: "write",
        question: "Write the first line of a loop that counts from 0 to 4.",
        placeholder: "one line of Python",
        accept: ["for i in range(5):", "for i in range(0, 5):"],
        explain: "for, a name for the variable, in, then the range, and a colon on the end.",
        review: 1
      }
    ],

    cheatsheet: [
      { code: "for i in range(n):", meaning: "do the indented lines n times", example: "for i in range(5):\n    print(i)\n" },
      { code: "range(start, stop)", meaning: "counts from start, and stops before stop", example: "for i in range(1, 6):\n    print(i)\n" },
      { code: "range(start, stop, step)", meaning: "the same, but counting in steps", example: "for i in range(0, 10, 2):\n    print(i)\n" },
      { code: "the stop number", meaning: "never included, so range(1, 6) ends at 5", example: "for i in range(1, 6):\n    print(i)\n" },
      { code: "while condition:", meaning: "keep going for as long as this stays true", example: 'count = 1\nwhile count <= 5:\n    print(count)\n    count = count + 1\n' },
      { code: "total = total + x", meaning: "work out the right side, then put it back in total", example: "total = 0\nfor i in range(1, 6):\n    total = total + i\nprint(total)\n" },
      { code: "break", meaning: "leave the loop immediately", example: 'while True:\n    answer = input("Type quit to stop: ")\n    if answer == "quit":\n        break\n' }
    ],

    next: "Lists: keeping a whole pile of things in one variable, and going through them without writing each one out."
  }
];

/* Lessons not written yet. These render as locked cards on the home page. */
window.UPCOMING = [
  { id: 4, title: "Lists", summary: "Keeping many things in one variable." },
  { id: 5, title: "Your own functions", summary: "def, arguments, and return." }
];
