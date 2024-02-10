const {
  getAllTests,
  runTests,
  formatTestResultsAsText,
  reportsFailure
} = window.Taste



runTests(getAllTests())
  .then(formatTestResultsAsText)
  .then((results) => {
    if (reportsFailure(results)) {
      const el = document.getElementById("test-results")
      el.innerText = results
      el.style.display = "block"
    }
  })