const SQUARE_SIZE = 25
const AREA_SIZE = 800

class Interface {
  constructor(program) {
    this.setProgramReference(program)
    this.loadAllImages()
    this.setCanvasContext()
    this.handleInterface()
  }

  setProgramReference(program) {
    this.program = program
  }

  setCanvasContext = () => {
    const canvas = document.getElementById('squaresMap')

    this.canvasContext = canvas.getContext('2d')

    this.canvasWidth = canvas.width
    this.canvasHeight = canvas.height
  }

  clearCanvas() {
    this.canvasContext.fillStyle = '#121212'
    this.canvasContext.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
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

  loadAllImages = () => {
    this.images = {}

    for (let i = 1; i <= 22; i++) {
      this.images['square' + i] = this.loadImage('squares', i.toString())
    }

    this.images['board'] = this.loadImage('squares', 'board')
    this.images['unknown'] = this.loadImage('squares', 'unknown')
    this.images['incorrect'] = this.loadImage('squares', 'incorrect')
  }

  loadImage = (path, name) => {
    const img = new Image()
    img.src = `${path}/${name}.png`

    return img
  }

  drawMap = map => {
    let errorSuareLocated = false

    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[i].length; j++) {
        const current_square = map[i][j]

        const x = i * SQUARE_SIZE
        const y = j * SQUARE_SIZE

        let name = `square${current_square}`
        if (current_square === 0) continue
        if (current_square === null) name = 'unknown'

        this.canvasContext.drawImage(
          this.images[name],
          x,
          y,
          SQUARE_SIZE,
          SQUARE_SIZE
        )
      }
    }
  }

  drawPiecesLines() {
    const halfSize = AREA_SIZE / 2

    for (let offset = 0; offset <= halfSize; offset += SQUARE_SIZE) {
      this.drawLine(offset, halfSize + offset, halfSize + offset, offset, 'red')
      this.drawLine(
        halfSize - offset,
        offset,
        AREA_SIZE - offset,
        halfSize + offset,
        'red'
      )
    }
  }

  drawLine = (x1, y1, x2, y2, color = 'black') => {
    this.canvasContext.beginPath()
    this.canvasContext.moveTo(x1, y1)
    this.canvasContext.lineTo(x2, y2)

    this.canvasContext.strokeStyle = color

    this.canvasContext.stroke()
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
    document.getElementById('stats-total-combinations').innerText = String(
      data.totalCombinations
    ).replace(/(.)(?=(\d{3})+$)/g, '$1,')
  }

  setHideCanvas(value) {
    this.hideCanvas = value
  }

  setHideSeparatingLines(value) {
    this.hideSeparatingLines = value
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
    this.renderError('')
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
