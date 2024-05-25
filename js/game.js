'use strict'

const MINE = '✷'
const EMPTY = ''
const FLAG = '🚩'
const HINT = '💡'

var gBoard
var gGame
var gStartTime = null
var gTimerInterval = null

var gLevel = {
    SIZE: 12,
    MINES: 32,
}

function onInit() {
    updateGame()
    gBoard = buildBoard()
    renderBoard(gBoard)
    closeModal()
    saveGameState()
    saveInitialState()
    displayTimes()
}

function handleCellClick(elCell, i, j) {
    if (gManualCreate.isOn) {
        placeMineManual(i, j)
    } else {
        onCellClicked(elCell, i, j)
    }
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn || elCell.dataset.marked === 'true') return

    if (gGame.isFirstMove) {
        if (!gGame.isManualCreateMode) placeMines(gBoard, gLevel.MINES, { i, j })
        gStartTime = Date.now()
        startTimer()
        addNumbers(gBoard)
        renderBoard(gBoard)
        elCell = document.querySelector(getIdSelector({ i, j }))
        gGame.isFirstMove = false
    }

    if (gGame.activeHint !== null) {
        revealHintCells(i, j)
        gGame.hintsAvailable--
        var elHint = document.querySelector(`.hint-${gGame.activeHint}`)
        elHint.style.opacity = '0'
        gGame.activeHint = null
        return
    }

    if (gMegaHint.hintStep > 0) {
        handleMegaHintClick(i, j)
        return
    }

    if (elCell.classList.contains('hidden')) {
        if (gBoard[i][j] === MINE) {
            updateLives(-1)
            updateSmileyBtn('😥')
            gGame.minesSteppedOn++
            elCell.classList.remove('hidden')
            saveGameState()

            checkGameOver()
            return
        } else {
            updateRevealed(1)
            updateSmileyBtn('🤩')
        }
        elCell.classList.remove('hidden')
        expandShown(gBoard, elCell, i, j)
        checkGameOver()
    }
    saveGameState()
}

function expandShown(board, elCell, i, j) {
    if (typeof board[i][j] === 'number' && board[i][j] !== 0) {
        elCell.classList.remove('hidden')
        return
    }

    var negsCoords = getNegsCoords(i, j, board)

    for (var k = 0; k < negsCoords.length; k++) {
        var ni = negsCoords[k].i
        var nj = negsCoords[k].j
        var negCellId = `cell-${ni}-${nj}`
        var negCellElement = document.getElementById(negCellId)

        if (
            negCellElement.dataset.marked === 'true' ||
            !negCellElement.classList.contains('hidden') ||
            board[ni][nj] === MINE
        ) {
            continue
        }

        negCellElement.classList.remove('hidden')
        updateRevealed(1)

        if (board[ni][nj] === EMPTY) {
            expandShown(board, negCellElement, ni, nj)
        }
    }
}

function onLevelHandler(elBtn) {
    gLevel.MINES = +elBtn.dataset.mines
    gLevel.SIZE = +elBtn.dataset.size
    onInit()
}

function addNumbers(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (board[i][j] !== MINE) {
                board[i][j] = setMinesNegsCount(i, j, board)
            }
        }
    }
}

function onCellMarked(ev, elCell) {
    ev.preventDefault()
    if (!gGame.isOn) return

    var cellI = elCell.id.split('-')[1]
    var cellJ = elCell.id.split('-')[2]

    if (elCell.dataset.marked === 'false' && elCell.classList.contains('hidden') && !gGame.isFirstMove) {
        renderCell({ i: cellI, j: cellJ }, FLAG)
        elCell.dataset.marked = 'true'
        updateMarked(1)
    } else if (elCell.dataset.marked === 'true') {
        renderCell({ i: cellI, j: cellJ }, gBoard[cellI][cellJ])
        elCell.dataset.marked = 'false'
        updateMarked(-1)
    }

    saveGameState()
    checkGameOver()
}

function checkGameOver() {
    var totalMinesNum = gGame.isManualCreateMode ? gManualCreate.minesPlaced : gLevel.MINES
    var totalReveals = gLevel.SIZE ** 2 - totalMinesNum
    if (gGame.lives <= 0) {
        var msg = 'You Lost!'
        updateSmileyBtn('😢')
        document.querySelectorAll('.mine.hidden').forEach((mine) => {
            mine.classList.remove('hidden')
        })
        openModal(msg)
        clearInterval(gTimerInterval)
        gGame.isOn = false
        return
    }
    if (gGame.shownCount === totalReveals && gGame.markedCount === totalMinesNum - gGame.minesSteppedOn) {
        var msg = 'You Won!'
        updateSmileyBtn('😎')
        var elapsedTime = Math.floor((Date.now() - gStartTime) / 1000)
        saveTime(elapsedTime)
        displayTimes()
        openModal(msg)
        clearInterval(gTimerInterval)
        gGame.isOn = false
        return
    }
}

function closeModal() {
    var modal = document.querySelector('.game-over-modal')
    modal.hidden = true
}

function openModal(msg) {
    var elModal = document.querySelector('.game-over-modal')
    var elModalTxt = elModal.querySelector('h2')
    elModalTxt.innerText = msg
    elModal.hidden = false
}

function revealHintCells(i, j) {
    var cellsToReveal = getNegsCoords(i, j, gBoard)
    cellsToReveal.push({ i: i, j: j })

    cellsToReveal.forEach((coord) => {
        var cellElement = document.getElementById(`cell-${coord.i}-${coord.j}`)
        if (cellElement.classList.contains('hidden')) {
            cellElement.classList.remove('hidden')
            cellElement.classList.add('revealed-temp')
        }
    })

    setTimeout(() => {
        cellsToReveal.forEach((coord) => {
            var cellElement = document.getElementById(`cell-${coord.i}-${coord.j}`)
            if (cellElement.classList.contains('revealed-temp')) {
                cellElement.classList.add('hidden')
                cellElement.classList.remove('revealed-temp')
            }
        })
    }, 1000)
}

function createHints() {
    var strHTML = '<div>'
    for (var i = 0; i < gGame.hintsAvailable; i++) {
        strHTML += `<button class="hint hint-${i}" onclick="useHint(${i})">${HINT}</button>`
    }
    strHTML += '</div>'
    var elHintContainer = document.querySelector('.hint-container')
    elHintContainer.innerHTML = strHTML
}

function useHint(hintIndex) {
    if (gGame.hintsAvailable > 0 && !gGame.activeHint) {
        gGame.activeHint = hintIndex
        var elHint = document.querySelectorAll('.hint')[hintIndex]
        elHint.classList.add('active')
    }
}

function onSafeClick() {
    if (gGame.safeClicksCount > 0) {
        var toLocation = getSafeLocation()
        if (!toLocation) {
            alert('No Empty Spots!')
            return
        }
        var elCell = document.querySelector(getIdSelector(toLocation))
        elCell.classList.add('safe-cell')
        updateSafeClicks(-1)

        setTimeout(() => {
            elCell.classList.remove('safe-cell')
        }, 1500)
    } else alert('No More Safe Clicks')
}

function getSafeLocation() {
    const safeLocations = []

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const currCell = gBoard[i][j]
            var elCurrCell = document.querySelector(getIdSelector({ i, j }))
            if (currCell !== MINE && elCurrCell.classList.contains('hidden')) {
                safeLocations.push({ i, j })
            }
        }
    }

    if (!safeLocations.length) return null

    const randomIdx = getRandomIntInclusive(0, safeLocations.length - 1)
    return safeLocations[randomIdx]
}

function onToggleDarkMode(elBtn) {
    document.body.classList.toggle('dark-mode')

    var isDark = elBtn.dataset.dark === 'true'
    var elBtnTxt = elBtn.querySelector('span')

    if (isDark) {
        elBtnTxt.innerText = 'Dark'
        elBtn.dataset.dark = 'false'
    } else {
        elBtnTxt.innerText = 'Classic'
        elBtn.dataset.dark = 'true'
    }
}

function placeMines(board, minesNum, firstClickCellCoords) {
    var emptyLocations = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (
                !(i === firstClickCellCoords.i && j === firstClickCellCoords.j) &&
                !isNeighboringCell(i, j, firstClickCellCoords.i, firstClickCellCoords.j)
            ) {
                emptyLocations.push({ i, j })
            }
        }
    }
    for (var i = 0; i < minesNum; i++) {
        var randIdx = getRandomIntInclusive(0, emptyLocations.length - 1)
        var location = emptyLocations.splice(randIdx, 1)[0]
        board[location.i][location.j] = MINE
    }
}

function isNeighboringCell(cellI, cellJ, firstClickI, firstClickJ) {
    return Math.abs(cellI - firstClickI) <= 1 && Math.abs(cellJ - firstClickJ) <= 1
}

function onExterminator() {
    removeMines(3)
}

function removeMines(removeNum) {
    const minesLocations = getNonAffectingMinesLocations()
    if (minesLocations.length < removeNum) {
        alert('Not enough mines to remove.')
        return
    }

    const removeMinesCoords = getRandMinesLocations(minesLocations, removeNum)
    removeMinesFromBoard(removeMinesCoords)
    alert(`${removeNum} Mines Removed!`)
    updateNeighborsAfterMineRemoval(removeMinesCoords)
}

function getNonAffectingMinesLocations() {
    const minesLocations = getMinesLocations()
    return minesLocations.filter((coord) => !isMineAffectingGameState(coord.i, coord.j))
}

function isMineAffectingGameState(mineI, mineJ) {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (
                !document.querySelector(getIdSelector({ i, j })).classList.contains('hidden') &&
                isNeighboringCell(i, j, mineI, mineJ)
            ) {
                return true
            }
        }
    }
    return false
}

function removeMinesFromBoard(removeMinesCoords) {
    removeMinesCoords.forEach((coord) => {
        const { i, j } = coord
        gBoard[i][j] = EMPTY
        gGame.isManualCreateMode ? gManualCreate.minesPlaced-- : gLevel.MINES--

        const cellElement = document.querySelector(getIdSelector({ i, j }))
        if (cellElement.dataset.marked === 'true') {
            cellElement.dataset.marked = 'false'
            updateMarked(-1)
        }

        cellElement.classList.remove('mine')
        cellElement.innerHTML = ''
        cellElement.classList.add('hidden')
    })
}

function getRandMinesLocations(minesLocations, removeNum) {
    const removeMinesCoords = []
    for (var i = 0; i < removeNum; i++) {
        const randomIdx = getRandomIntInclusive(0, minesLocations.length - 1)
        removeMinesCoords.push(minesLocations[randomIdx])
        minesLocations.splice(randomIdx, 1)
    }
    return removeMinesCoords
}

function getMinesLocations() {
    const minesLocations = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j] === MINE) {
                minesLocations.push({ i, j })
            }
        }
    }
    return minesLocations
}

function buildBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = EMPTY
        }
    }
    return board
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        const row = board[i]
        strHTML += '<tr>'
        for (var j = 0; j < row.length; j++) {
            const cell = row[j]
            var className = cell === MINE ? 'mine' : ''
            const tdId = `cell-${i}-${j}`
            strHTML += `<td id="${tdId}" class="${className} cell hidden"
                                data-marked="false" onclick="handleCellClick(this,${i},${j})" oncontextmenu="onCellMarked(event,this)">
                              ${cell}
                        </td>`
        }
        strHTML += '</tr>'
    }
    const elMat = document.querySelector('.game-board')
    elMat.innerHTML = strHTML
    updateBoardAndClass(board)
}

function renderCell(location, value) {
    const elCell = document.querySelector(getIdSelector(location))
    elCell.innerHTML = value
}

function getIdSelector(location) {
    const cellId = '#cell-' + location.i + '-' + location.j
    return cellId
}
