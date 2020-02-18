const Helpers = {
  generateEmptyDatabase: () => {
    let text = ''

    for (let i = 1; i <= 256; i++) {
      text += `{id: ${i}, left: AAA, top: AAA, right: AAA, bottom: AAA},\n${
        i % 4 === 0 ? '\n' : ''
      }`
    }

    return text
  },

  updateSquares: pieces => {
    squares.forEach(square => {
      let type = square.type
      let quantity = 0
      let isBorder = true

      pieces.forEach(piece => {
        let quantityBefore = quantity

        if (piece.left === type) quantity += 1
        if (piece.top === type) quantity += 1
        if (piece.right === type) quantity += 1
        if (piece.bottom === type) quantity += 1

        if (quantityBefore !== quantity && piece.bottom !== BOARD)
          isBorder = false
      })

      square.quantity = quantity / 2
      square.isBorder = isBorder
    })
  },

  createFirstSquaresCombination: () => {
    let combination = []

    squares.forEach(square => {
      for (let i = 0; i < square.quantity; i++) {
        combination.push(square.id)
      }
    })

    return combination
  },
}

const NUMBER_OF_SQUARES = 480
const CYCLE_TIME = 1000

class Program {
  constructor() {
    this.initializeVariables()
    this.createControllers()
  }

  initializeVariables() {
    this.shouldCalculating = false
    this.isCalculating = false

    this.totalTime = 0
    this.totalCombinations = 0
    this.cycleTime = 0
    this.cycleCombinations = 0
  }

  createControllers() {
    this.interface = new Interface(this)
    this.calculator = new Calculator(this)
  }

  onInputEvent = () => {
    this.interface.cleanError()
  }

  onPressControlButton = () => {
    this.interface.cleanError()

    if (!this.shouldCalculating) {
      this.onCalculatingStart()
    } else {
      this.onCalculatingMarkAsStop()
    }
  }

  onPressLoadCombinationButton = () => {
    this.interface.cleanError()

    let combination = JSON.parse(localStorage.getItem('currentCombination'))

    this.interface.setCombinationToInput(combination)
  }

  onCalculatingMarkAsStop() {
    this.shouldCalculating = false

    this.interface.updateStartButtonText('*')
    this.interface.blockStartButton(true)
  }

  onCalculatingStart() {
    this.shouldCalculating = true
    this.isCalculating = true

    this.interface.updateStartButtonText('Stop')
    this.interface.blockLoadCombinationButton(true)

    let result = this.interface.getCombinationFromInput()

    if (result.error) {
      this.interface.renderError(result.error)
      this.onCalculatingStop()

      return false
    }

    this.calculator.setCombination(result.ids)
    this.calculator.prepareDataForCalculations()

    this.calculatingLoop()
  }

  calculatingLoop = () => {
    let startTime = Date.now()
    let currentTime = startTime

    this.cycleTime = 0
    this.cycleCombinations = 0

    while (currentTime - startTime <= CYCLE_TIME) {
      let result = this.calculator.doOneCalculation()

      if (result.error || result.message) {
        this.interface.renderError(result.error || result.message)
        this.onCalculatingStop()
        this.interface.setCombinationToInput(this.calculator.getCombination())

        return false
      }

      this.cycleCombinations += 1
      this.totalCombinations += 1

      currentTime = Date.now()
    }

    this.cycleTime = currentTime - startTime

    this.totalTime += this.cycleTime

    this.updateInterfaceAfterCycle()
    this.storeResultsInLocalStore()

    if (this.shouldCalculating) {
      setTimeout(this.calculatingLoop, CYCLE_TIME / 100)
    } else {
      this.onCalculatingStop()
    }
  }

  onCalculatingStop() {
    this.shouldCalculating = false
    this.isCalculating = false

    this.interface.updateStartButtonText('Start')
    this.interface.blockStartButton(false)
    this.interface.blockLoadCombinationButton(false)
    this.interface.cleanCycleStats()
  }

  updateInterfaceAfterCycle() {
    this.interface.updateAfterCycle({
      totalTime: this.totalTime,
      cycleTime: this.cycleTime,
      cycleCombinations: this.cycleCombinations,
      totalCombinations: this.totalCombinations,
      currentCombination: this.calculator.getCombination(),
    })
  }

  storeResultsInLocalStore() {
    localStorage.setItem(
      'currentCombination',
      JSON.stringify(this.calculator.getCombination())
    )
  }
}

class Controller {
  constructor(program) {
    this.setProgramReference(program)
  }

  setProgramReference(program) {
    this.program = program
  }
}

class Interface extends Controller {
  constructor(program) {
    super(program)

    this.handleInterface()
  }

  handleInterface() {
    document.getElementById(
      'startButton'
    ).onclick = this.program.onPressControlButton

    document.getElementById(
      'loadCombinationButton'
    ).onclick = this.program.onPressLoadCombinationButton

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

class Calculator extends Controller {
  constructor(program) {
    super(program)

    this.setMoldVariables()
  }

  setCombination(combination) {
    this.combination = combination
  }

  getCombination() {
    return this.combination
  }

  setMoldVariables() {
    this.generateMoldMap()
    this.setPiecesCopy()
  }

  prepareDataForCalculations() {
    this.map = JSON.parse(this.moldMapJSON)
    this.usedPieces = []
    this.availablePieces = JSON.parse(this.moldPiecesJSON)
    this.x = 0
    this.y = 0
    this.combinationPointer = 0
  }

  generateMoldMap() {
    let map = []

    for (let i = 0; i < 32; i++) {
      map[i] = []
      for (let j = 0; j < 32; j++) {
        let iCenter = i <= 15 ? 15 : 16
        let jCenter = j <= 15 ? 15 : 16

        let distance = Math.abs(iCenter - i) + Math.abs(jCenter - j)

        map[i][j] = distance <= 14 ? null : BOARD
      }
    }

    this.moldMap = map
    this.moldMapJSON = JSON.stringify(map)
  }

  setPiecesCopy() {
    this.moldPiecesJSON = JSON.stringify(PIECES_DB)
  }

  doOneCalculation() {
    let detectResult = this.detectIncorrectSquare(this.combination)
    if (detectResult.message) return detectResult

    let increaseResult = this.increaseCombinationFromIndex(
      this.combination,
      detectResult.index
    )
    if (increaseResult.error) return increaseResult

    this.combination = increaseResult.combination
    this.moveBackCombinationPointer(increaseResult.indexMoves)

    return { done: true }
  }

  moveBackCombinationPointer(squaresToMoveBack) {
    if (squaresToMoveBack <= 0) return false
    let x = this.x
    let y = this.y - 1

    for (; x >= 1; x--) {
      for (; y >= 1; y--) {
        if (this.map[x][y] !== BOARD) {
          if ((x + y) % 2 == 1) {
            this.unuseLastPiece()
          }

          this.combinationPointer--
          squaresToMoveBack--
          if (squaresToMoveBack === 0) {
            this.x = x
            this.y = y

            return true
          }
        }
      }

      y = 30
    }
  }

  detectIncorrectSquare(combination) {
    let pointer = this.combinationPointer
    let x = this.x
    let y = this.y

    for (; x < 31; x++) {
      for (; y < 31; y++) {
        if (this.map[x][y] !== BOARD) {
          this.map[x][y] = combination[pointer]

          if ((x + y) % 2 == 1) {
            let result = this.usePieceFor(
              this.map[x][y],
              this.map[x - 1][y],
              this.map[x - 1][y - 1],
              this.map[x][y - 1]
            )

            if (!result) {
              this.x = x
              this.y = y
              this.combinationPointer = pointer

              return { index: pointer }
            }
          }

          pointer++
        }
      }

      y = 1
    }

    return { message: 'Current combination is correct!' }
  }

  unuseLastPiece() {
    let element = this.usedPieces.pop()
    this.availablePieces.push(element)

    return true
  }

  usePieceFor(one, two, three, four) {
    let index = this.availablePieces.findIndex(piece => {
      if (
        piece.left == one &&
        piece.top == two &&
        piece.right == three &&
        piece.bottom == four
      )
        return true
      if (
        piece.left == two &&
        piece.top == three &&
        piece.right == four &&
        piece.bottom == one
      )
        return true
      if (
        piece.left == three &&
        piece.top == four &&
        piece.right == one &&
        piece.bottom == two
      )
        return true
      if (
        piece.left == four &&
        piece.top == one &&
        piece.right == two &&
        piece.bottom == three
      )
        return true

      return false
    })

    if (index == -1) return false

    this.usedPieces.push(this.availablePieces[index])
    this.availablePieces.splice(index, 1)

    return true
  }

  increaseCombinationFromIndex(combinationInput, index) {
    let combination = [...combinationInput]

    let freeElements = combination.splice(index + 1)
    let indexMoves = -1

    for (let i = index; i >= 0; i--) {
      let currentElement = combination[i]

      combination.splice(i)

      this.addToFreeElements(currentElement, freeElements)
      //freeElements.push(currentElement)
      //freeElements.sort((a, b) => a - b)

      indexMoves++

      for (let j = 0; j < freeElements.length; j++) {
        let currentFreeElement = freeElements[j]

        if (currentFreeElement > currentElement) {
          freeElements.splice(j, 1)

          return {
            combination: [...combination, currentFreeElement, ...freeElements],
            indexMoves,
          }
        }
      }
    }

    return { error: 'Last combination' }
  }

  addToFreeElements(element, elements) {
    let left = 0
    let right = elements.length - 1
    let x = 100

    while (x--) {
      let difference = right - left

      if (difference === 0) {
        elements.splice(right, 0, element)
        return true
      }

      let i = Math.round(difference / 2) + left
      let checkedElement = elements[i]

      if (checkedElement > element) {
        right = i - 1
      } else if (checkedElement < element) {
        left = i + 1
      } else {
        elements.splice(i, 0, element)
        return true
      }
    }

    throw 'Error'
  }
}

new Program()
