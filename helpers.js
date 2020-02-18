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

  updateSquaresDB: () => {
    SQUARES_DB.forEach(square => {
      let type = square.type
      let quantity = 0
      let isBorder = true

      PIECES_DB.forEach(piece => {
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

  createFirstCombination: () => {
    let combination = []

    SQUARES_DB.forEach(square => {
      for (let i = 0; i < square.quantity; i++) {
        combination.push(square.id)
      }
    })

    return combination
  },
}
