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
  }
];

/* Lessons not written yet. These render as locked cards on the home page. */
window.UPCOMING = [
  { id: 2, title: "Numbers and decisions", summary: "Maths, int(), and if / else." },
  { id: 3, title: "Repeating yourself", summary: "for, while, and lists." },
  { id: 4, title: "Your own functions", summary: "def, arguments, and return." }
];
