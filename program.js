const CYCLE_TIME = 1000
const NUMBER_OF_SQUARES = 480

class Program {
  constructor() {
    this.initializeVariables()
    this.createControllers()
    this.updateSquaresDB()
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

  updateSquaresDB() {
    Helpers.updateSquaresDB()
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

  onPressCreateFirstCombinationButton = () => {
    this.interface.cleanError()

    let firstCombination = Helpers.createFirstCombination()

    this.interface.setCombinationToInput(firstCombination)
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
    this.interface.blockCreateFirstCombinationButton(true)

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
      setTimeout(this.calculatingLoop, CYCLE_TIME / 25)
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
    this.interface.blockCreateFirstCombinationButton(false)

    this.interface.cleanCycleStats()
  }

  updateInterfaceAfterCycle() {
    const map = this.calculator.getMap()

    this.interface.clearCanvas()
    this.interface.drawMap(map)
    this.interface.drawPiecesLines()

    this.interface.updateAfterCycle({
      totalTime: this.totalTime,
      cycleTime: this.cycleTime,
      cycleCombinations: this.cycleCombinations,
      totalCombinations: this.totalCombinations,
      currentCombination: this.calculator.getPreviousCombination(),
    })
  }

  storeResultsInLocalStore() {
    localStorage.setItem(
      'currentCombination',
      JSON.stringify(this.calculator.getCombination())
    )
  }
}

new Program()
