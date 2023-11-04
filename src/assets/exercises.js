;(() => {

function main() {
  $(".exercise").forEach(exerciseSpec => {
    const exerciseComponentRoot = h("div")
    swap(exerciseSpec, exerciseComponentRoot)
    initExerciseComponent(parseExercise(exerciseSpec), exerciseComponentRoot)
  })
}

function parseExercise(exerciseSpec) {
  const promptElements = []
  for (let el of exerciseSpec.children) {
    if (el.tagName === "HR") {
      break
    }
    promptElements.push(el)
  }

  const questions = $("li", exerciseSpec)
    .map(li => li.innerHTML.split("|").map(trim))
    .map(([stimulusHtml, correctAnswerHtml]) => {
      return {
        stimulusHtml,
        correctAnswer: parseHtml(correctAnswerHtml.replace(/<x-src>[^<]*<\/x-src>/g, ""))[0].innerText
      }
    })

  const ret = {promptElements, questions}
  console.log(ret)
  return ret
}

function initExerciseComponent(exercise, root) {
  const guesses = exercise.questions.map(() => "")
  const marks = exercise.questions.map(() => "unmarked")

  function checkAnswers() {
    for (let i = 0; i < exercise.questions.length; i++) {
      if (isCloseEnough(guesses[i], exercise.questions[i].correctAnswer)) {
        marks[i] = "correct"
      } else {
        console.log(["the correct answer is", exercise.questions[i].correctAnswer])
        marks[i] = "incorrect"
      }
    }
    render()
  }

  const setGuess = (questionIndex) => (event) => {
    guesses[questionIndex] = event.target.value
    console.log(...guesses)
  }

  function render() {
    root.innerHTML = ""
    root.appendChild(
      h("div", {class: "exercise"}, 
        ...exercise.promptElements,
        h("ul", {},
          ...exercise.questions.map((question, questionIndex) =>
            h("li", {},
              ...parseHtml(question.stimulusHtml),
              h("div", {class: "answer"},
                h("input", {value: guesses[questionIndex], oninput: setGuess(questionIndex)}),
                h("span", {class: marks[questionIndex]}, marks[questionIndex]),
              ),
            )
          ),
        ),
        h("button", {onclick: checkAnswers}, "Check answers")
      )
    )
  }

  render()
}

function h(tag, attributes, ...children) {
  const el = document.createElement(tag)
  for (let child of children) {
    if (typeof child === "string") {
      child = document.createTextNode(child)
    }
    el.appendChild(child)
  }
  for (let attribute in attributes) {
    const value = attributes[attribute]
    if (attribute.startsWith("on")) {
      el.addEventListener(attribute.slice(2), value)
    } else if (attribute === "class") {
      el.className = value
    } else {
      el.setAttribute(attribute, value)
    }
  }
  return el
}

function isCloseEnough(a, b) {
  return normalizeAnswer(a) === normalizeAnswer(b) 
}

function normalizeAnswer(s) {
  return s.toLowerCase()
    .replace(/[\.,;!\?]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

console.log(normalizeAnswer("yn darosvannow a gweldyn boromir."))

function $(selector, root = document) {
  return [...root.querySelectorAll(selector)]
}

function swap(oldElement, newElement) {
  oldElement.insertAdjacentElement("afterend", newElement)
  oldElement.remove()
}

function trim(s) {
  return s.trim()
}

const htmlParserDummyNode = h("div", {})
function parseHtml(html) {
  htmlParserDummyNode.innerHTML = html
  return htmlParserDummyNode.children
}

main()

})();