class Calculator {
  constructor(program) {
    this.setMoldVariables()
    this.setProgramReference(program)
  }

  setProgramReference(program) {
    this.program = program
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
