---
id: explain
type: explain
title: What the winner hides
dialogue:
  - committee: "The printer has a second question. How much worse is the free go after six?"
  - committee: "He would like to know whether to keep the plates for it..."
  - committee: "...or melt them down."
prompt: "Thompson sampling lost about a tenth as many visitors as the even split. Which of the two can answer the printer, and why can't the other?"
answer: "The even split can. It handed the free go after six to 1250 visitors, so its estimate of that rate is close. Thompson sampling stopped handing it out once it was fairly sure the free go wasn't the best: about a hundred visitors, so its estimate could be out by a third either way. A bandit answers \"which is best?\" cheaply. An even split pays for an answer to \"how good is each one?\", and if the committee need that, the visitors it costs are the price of the question."
concept: ab-testing
---
Print `counts` for each strategy beside your table before you answer. A bandit test and a plain A/B test are both fair; they are fair about different questions.
