'use strict'

var gManualCreate = {
    isOn: false,
    mineCount: 0,
    minesPlaced: 0,
    mineCoords: [],
}

function onManuallyCreate() {
    gGame.isManualCreateMode = true
    gManualCreate.isOn = true
    gManualCreate.mineCount = +prompt('How Many Mines You Want?')
    if (isNaN(gManualCreate.mineCount) || gManualCreate.mineCount <= 0) {
        alert('Invalid number of mines')
        return
    }
    gManualCreate.minesPlaced = 0
    gManualCreate.mineCoords = []
    clearBoard()
    renderBoard(gBoard)
    alert(`Choose ${gManualCreate.mineCount} cells you want to fill with mines`)
}

function placeMineManual(i, j) {
    if (!gManualCreate.isOn) {
        console.log('Manual creation mode is not on.')
        return
    }

    if (gManualCreate.minesPlaced < gManualCreate.mineCount) {
        if (gBoard[i][j] === MINE) {
            alert('Mine already placed in this cell. Choose another cell.')
            return
        }

        gManualCreate.mineCoords.push({ i, j })
        gManualCreate.minesPlaced++
        gBoard[i][j] = MINE
        var cellElement = document.getElementById(`cell-${i}-${j}`)
        cellElement.classList.add('mine', 'newMine')
        if (gManualCreate.minesPlaced === gManualCreate.mineCount) {
            gManualCreate.isOn = false
            alert('All mines have been placed manually.')
            addNumbers(gBoard)
            renderBoard(gBoard)
            gGame.isFirstMove = true
            gGame.shownCount = 0
            updateGameDisplay()
            document.querySelectorAll('.newMine').forEach((cell) => {
                cell.classList.remove('newMine')
            })
        }
    }
}

function clearBoard() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            gBoard[i][j] = EMPTY
            var cellElement = document.getElementById(`cell-${i}-${j}`)
            if (cellElement) {
                cellElement.classList.remove('mine', 'revealed', 'revealed-temp', 'hidden')
                cellElement.classList.add('hidden')
                cellElement.innerHTML = ''
                cellElement.dataset.marked = 'false'
            }
        }
    }
}
