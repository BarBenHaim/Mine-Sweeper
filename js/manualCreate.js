var gManualCreate = {
    isOn: false,
    mineCount: 0,
    minesPlaced: 0,
    mineCoords: [],
}

function onManuallyCreate() {
    gManualCreate.mineCount = +prompt('How Many Mines You Want?')
    if (isNaN(gManualCreate.mineCount) || gManualCreate.mineCount <= 0) {
        alert('Invalid number of mines')
        return
    }
    gManualCreate.isOn = true
    gManualCreate.minesPlaced = 0
    gManualCreate.mineCoords = []
    clearBoard()
    renderBoard(gBoard)
    alert(`Choose ${gManualCreate.mineCount} cells you want to fill with mines`)
}

function placeMineManual(i, j) {
    if (gManualCreate.minesPlaced < gManualCreate.mineCount) {
        gManualCreate.mineCoords.push({ i, j })
        gManualCreate.minesPlaced++
        var cellElement = document.getElementById(`cell-${i}-${j}`)
        cellElement.classList.add('mine')
        if (gManualCreate.minesPlaced === gManualCreate.mineCount) {
            gManualCreate.isOn = false
            alert('All mines have been placed manually.')
            finalizeManualMines()
        }
    }
}

function finalizeManualMines() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j] = EMPTY
        }
    }

    for (var coord of gManualCreate.mineCoords) {
        gBoard[coord.i][coord.j] = MINE
    }

    addNumbers(gBoard)
    renderBoard(gBoard)
}

function clearBoard() {
    gGame.isFirstMove = true
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j] = EMPTY
            var cellElement = document.getElementById(`cell-${i}-${j}`)
            if (cellElement) {
                cellElement.classList.remove('mine', 'revealed', 'revealed-temp', 'hidden')
                cellElement.classList.add('hidden')
                cellElement.innerHTML = ''
            }
        }
    }
}
