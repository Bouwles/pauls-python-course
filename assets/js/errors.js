/* Plain-English translations for the errors beginners actually hit.
   Add to this list as your students find new ones. First match wins,
   so put the specific patterns above the general ones. */

window.PPC_ERROR_HINTS = [
  {
    // age = input(...) then age + 1, or print("Hi " + age) where age is a number
    test: /TypeError:\s*can only concatenate str \(not "(int|float)"\) to str/i,
    hint: 'One side of the + is text and the other is a number, and Python will not guess which you meant. If the text came from input and you want to do maths with it, wrap it in int(), like int(input("Age? ")). If you wanted to stick them together instead, wrap the number in str().'
  },
  {
    test: /TypeError:\s*unsupported operand type\(s\) for \+: '(int|float)' and 'str'/i,
    hint: 'One side of the + is a number and the other is text. If you want the number, use int(), and if you want the text, use str().'
  },
  {
    test: /TypeError:\s*unsupported operand type\(s\) for \+: 'str' and '(int|float)'/i,
    hint: 'One side of the + is text and the other is a number. Wrap the number in str() to join them, or int() to add them up.'
  },
  {
    test: /ValueError:\s*invalid literal for int\(\) with base 10:\s*'\s*'/i,
    hint: "int() was handed nothing at all. Something was typed in blank, or enter was pressed straight away, and there is no number there to convert."
  },
  {
    test: /ValueError:\s*invalid literal for int\(\) with base 10:\s*'([^']*)'/i,
    hint: function (match) {
      return "int() only works on something that is actually a number, and " + match[1] + " is not one. That is what happens when somebody types a word into a question that wanted a number. Your code is fine; the answer was not.";
    }
  },
  {
    test: /ValueError:\s*could not convert string to float/i,
    hint: "float() only works on something that is actually a number. A word went in, and there is nothing there to turn into a number."
  },
  {
    test: /NameError:\s*name '([^']+)' is not defined/i,
    hint: function (match) {
      return "Python went looking for something called " + match[1] + " and could not find it. Either it is spelled differently where you made it, or it needs quotes around it because it is meant to be text.";
    }
  },
  {
    test: /SyntaxError:\s*'(\(|\[|\{)' was never closed/i,
    hint: "A bracket was opened and never closed. Count the ( and the ) on that line and the line above it."
  },
  {
    test: /SyntaxError:\s*unterminated string literal/i,
    hint: "A quote was opened and never closed. Text needs a quote at both ends."
  },
  {
    test: /SyntaxError:\s*invalid syntax/i,
    hint: "Python got to this point and could not make sense of it. Look for a missing bracket, a missing quote, or a missing colon at the end of the line above."
  },
  {
    test: /SyntaxError/i,
    hint: "Something about the way the line is written stops Python reading it. Check brackets, quotes and colons on that line and the one before it."
  },
  {
    test: /IndentationError:\s*expected an indented block/i,
    hint: "A line ending in a colon is Python saying something belongs underneath this. Nothing was pushed in underneath it, so the if has nothing inside it. Put four spaces at the start of the line below."
  },
  {
    test: /IndentationError:\s*unexpected indent/i,
    hint: "This line is pushed in further than Python expected. If it is not meant to be inside an if, move it back to the left so it lines up with the line above it."
  },
  {
    test: /IndentationError:\s*unindent does not match/i,
    hint: "The spaces at the start of this line do not line up with anything above it. Every line in the same block needs exactly the same amount of space in front of it, so pick four spaces and stick to it."
  },
  {
    test: /IndentationError|TabError/i,
    hint: "The spaces at the start of the line are not what Python expected. Lines that belong together need the same amount of space in front of them, and four spaces is the normal amount. Mixing tabs and spaces causes this too."
  },
  {
    test: /IndexError/i,
    hint: "You asked for an item that is not there. Counting starts at 0, so the last item of a list of 3 is number 2."
  },
  {
    test: /KeyError/i,
    hint: "That name is not in the dictionary. Check the spelling, including capital letters."
  },
  {
    test: /ZeroDivisionError/i,
    hint: "Something got divided by zero. Check the number you are dividing by is not 0."
  },
  {
    test: /AttributeError:\s*'str' object has no attribute/i,
    hint: "That is not something text can do. Check the spelling of the bit after the dot."
  },
  {
    test: /ModuleNotFoundError|ImportError/i,
    hint: "That module is not available in the browser. Everything in this course runs without imports."
  },
  {
    test: /RecursionError/i,
    hint: "Something called itself over and over with no way to stop. There needs to be a case where it stops calling itself."
  }
];

/* Returns a friendly line for a traceback, or null. */
window.PPC_explainError = function (text) {
  var list = window.PPC_ERROR_HINTS || [];
  for (var i = 0; i < list.length; i++) {
    var match = list[i].test.exec(text);
    if (match) {
      return typeof list[i].hint === "function" ? list[i].hint(match) : list[i].hint;
    }
  }
  return null;
};
