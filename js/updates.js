'use strict'

function updateGame() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        lives: 2,
        isFirstMove: true,
        hintsAvailable: 3,
        activeHint: null,
        safeClicksCount: 3,
        activeMegaHint: false,
        minesSteppedOn: 0,
        isManualCreateMode: false,
    }

    updateRevealed(0)
    updateLives(0)
    updateMarked(0)
    updateSafeClicks(0)
    updateSmileyBtn('😄')
    resetTimer()
    resetMegaHintButton()
    createHints()
    updateGameDisplay()
}

function updateGameDisplay() {
    document.querySelector('.lives span').innerText = gGame.lives
    document.querySelector('.revealed span').innerText = gGame.shownCount
    document.querySelector('.marked span').innerText = gGame.markedCount

    if (gGame.lives > 0) {
        gGame.isOn = true
        closeModal()
    }
}

function updateSafeClicks(diff) {
    gGame.safeClicksCount += diff
    var elSafeClickBtn = document.querySelector('.safe-btn-container span')
    elSafeClickBtn.innerText = gGame.safeClicksCount
}

function updateLives(diff) {
    gGame.lives += diff
    var elLives = document.querySelector('.lives span')
    elLives.innerText = gGame.lives
}

function updateMarked(diff) {
    if (gGame.isFirstMove) return
    gGame.markedCount += diff
    var elMarkedCount = document.querySelector('.marked span')
    elMarkedCount.innerText = gGame.markedCount
}

function updateRevealed(diff) {
    gGame.shownCount += diff
    var elShownCount = document.querySelector('.revealed span')
    elShownCount.innerText = gGame.shownCount
}

function updateSmileyBtn(value) {
    var elSmileyBtn = document.querySelector('.smiley-btn')
    elSmileyBtn.innerText = value
}

function updateMegaHintButton() {
    const elMegaHintBtn = document.querySelector('.mega-hint-btn')
    elMegaHintBtn.classList.add('used')
}

function updateBoardAndClass(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cellId = `cell-${i}-${j}`
            var cellElement = document.getElementById(cellId)

            if (cellElement) {
                if (board[i][j] === 0) {
                    board[i][j] = EMPTY
                    cellElement.innerText = EMPTY
                }
                cellElement.classList.add(board[i][j] === EMPTY ? 'empty' : 'number')
                if (cellElement.classList.contains('mine')) cellElement.classList.remove('number')
                if (typeof board[i][j] === 'number' && board[i][j] >= 1 && board[i][j] <= 8) {
                    var className = sayNum(board[i][j])
                    cellElement.classList.add(className)
                }
            }
        }
    }
}

function updateNeighborsAfterMineRemoval(removeMinesCoords) {
    removeMinesCoords.forEach((coord) => {
        const { i, j } = coord
        const neighbors = getNegsCoords(i, j, gBoard)
        neighbors.forEach((neighbor) => updateSingleCell(neighbor.i, neighbor.j))
        updateSingleCell(i, j)
    })
}

function updateSingleCell(i, j) {
    const cellElement = document.getElementById(`cell-${i}-${j}`)
    if (gBoard[i][j] !== MINE) {
        gBoard[i][j] = setMinesNegsCount(i, j, gBoard)
        cellElement.innerHTML = gBoard[i][j] === 0 ? '' : gBoard[i][j]

        cellElement.className = 'cell hidden'
        if (gBoard[i][j] === 0) {
            cellElement.classList.add('empty')
        } else if (typeof gBoard[i][j] === 'number') {
            cellElement.classList.add('number')
            cellElement.classList.add(sayNum(gBoard[i][j]))
        }

        if (cellElement.dataset.marked === 'true') {
            cellElement.dataset.marked = 'false'
            updateMarked(-1)
        }
    }
}
