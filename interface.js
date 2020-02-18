class Interface {
  constructor(program) {
    this.setProgramReference(program)
    this.handleInterface()
  }

  setProgramReference(program) {
    this.program = program
  }

  handleInterface() {
    document.getElementById(
      'startButton'
    ).onclick = this.program.onPressControlButton

    document.getElementById(
      'loadCombinationButton'
    ).onclick = this.program.onPressLoadCombinationButton

    document.getElementById(
      'firstCombinationButton'
    ).onclick = this.program.onPressCreateFirstCombinationButton

    const input = document.getElementById('input')

    input.onclick = this.program.onInputEvent
    input.oninput = this.program.onInputEvent
  }

  updateAfterCycle(data) {
    let combinationsPerSecondForCycle =
      (data.cycleCombinations / data.cycleTime) * 1000
    let combinationsPerSecondTotal =
      (data.totalCombinations / data.totalTime) * 1000

    this.setCombinationToInput(data.currentCombination)

    document.getElementById(
      'stats-combinations-per-s-for-cycle'
    ).innerText = Math.floor(combinationsPerSecondForCycle)

    document.getElementById(
      'stats-combinations-per-s-total'
    ).innerText = Math.floor(combinationsPerSecondTotal)

    document.getElementById('stats-time').innerText = Math.floor(
      data.totalTime / 1000
    )
    document.getElementById('stats-total-combinations').innerText = Math.floor(
      data.totalCombinations
    )
  }

  cleanCycleStats() {
    document.getElementById('stats-combinations-per-s-for-cycle').innerText =
      '-'
  }

  updateStartButtonText(text) {
    document.getElementById('startButton').innerText = text
  }

  blockStartButton(block) {
    document.getElementById('startButton').disabled = block
  }

  blockLoadCombinationButton(block) {
    document.getElementById('loadCombinationButton').disabled = block
  }

  blockCreateFirstCombinationButton(block) {
    document.getElementById('firstCombinationButton').disabled = block
  }

  renderError(e) {
    document.getElementById('error').innerText = e
  }

  cleanError() {
    document.getElementById('error').innerText = ''
  }

  setCombinationToInput(combination) {
    document.getElementById('input').value = combination.join(', ')
  }

  getCombinationFromInput() {
    let value = document.getElementById('input').value
    let matches = value.match(/\d+/g)

    if (!matches || matches.length !== NUMBER_OF_SQUARES) {
      return { error: 'Incorrect number of squares ids!' }
    }

    let ids = matches.map(id => parseInt(id))

    return { ids }
  }
}
