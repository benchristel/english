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

  return {promptElements, questions}
}

function pickRandomly(howMany, array) {
  return shuffle(array).slice(0, howMany)
}

function shuffle(array) {
  array = [...array]
  for (let lh = 0; lh < array.length; lh++) {
    const rh = randIntInRange(lh, array.length - 1)
    const tmp = array[lh]
    array[lh] = array[rh]
    array[rh] = tmp
  }
  return array
}

function randIntInRange(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

function initExerciseComponent(exercise, root) {
  let questions = pickRandomly(4, exercise.questions)
  let guesses = exercise.questions.map(() => "")
  let marks = exercise.questions.map(() => "unmarked")
  

  function checkAnswers() {
    for (let i = 0; i < questions.length; i++) {
      if (isCloseEnough(guesses[i], questions[i].correctAnswer)) {
        marks[i] = "correct"
      } else {
        console.log(["the correct answer is", questions[i].correctAnswer])
        marks[i] = "incorrect"
      }
    }
    render()
  }

  function refreshQuestions() {
    questions = pickRandomly(4, exercise.questions)
    guesses = guesses = exercise.questions.map(() => "")
    marks = exercise.questions.map(() => "unmarked")
    render()
  }

  const setGuess = (questionIndex) => (event) => {
    guesses[questionIndex] = event.target.value
  }

  function render() {
    root.innerHTML = ""
    root.appendChild(
      h("div", {class: "exercise"}, 
        ...exercise.promptElements,
        h("ul", {},
          ...questions.map((question, questionIndex) =>
            h("li", {},
              ...parseHtml(question.stimulusHtml),
              h("div", {class: "answer"},
                h("input", {value: guesses[questionIndex], oninput: setGuess(questionIndex)}),
                h("span", {class: marks[questionIndex]}, marks[questionIndex]),
              ),
            )
          ),
        ),
        h("button", {onclick: checkAnswers}, "Check answers"),
        h("button", {onclick: refreshQuestions}, "More questions like this")
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
  return htmlParserDummyNode.childNodes
}

main()

})();