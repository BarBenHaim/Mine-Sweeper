const MINE = '✷'
const EMPTY = ''
const FLAG = '🚩'
const HINT = '💡'

var gScores = []
var gBoard
var gGame
var startTime = null
var timerInterval = null
var gLevel = {
    SIZE: 4,
    MINES: 2,
}

function onInit() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 2,
        isFirstMove: true,
        hintsAvailable: 3,
        activeHint: null,
        safeClicksCount: 3,
    }

    updateGame()
    gBoard = buildBoard()
    renderBoard(gBoard)
    createHints()
    // displayTimes()
    closeModal()
}

function buildBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = ''
            board[i][j] = cell
        }
    }
    addMines(board, gLevel.MINES)
    addNumbers(board)
    console.log('board: ', board)
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
                                data-marked="false" onclick="onCellClicked(this,${i},${j})" oncontextmenu="onCellMarked(event,this)">
                              ${cell}
                        </td>`
        }
        strHTML += '</tr>'
    }
    const elMat = document.querySelector('.game-board')
    elMat.innerHTML = strHTML
    updateBoardAndClass(board)
}

function onCellClicked(elCell, i, j) {
    if (!gGame.isOn) return
    if (elCell.dataset.marked === 'true') return

    if (gGame.isFirstMove) {
        startTime = Date.now()
        startTimer()
        gGame.isFirstMove = false
        if (gBoard[i][j] === MINE) {
            moveMine(i, j)
            addNumbers(gBoard)
            renderBoard(gBoard)
            elCell = document.getElementById(`cell-${i}-${j}`)
        }
    }

    if (gGame.activeHint !== null) {
        revealHintCells(i, j)
        gGame.hintsAvailable--
        var elHint = document.querySelector(`.hint-${gGame.activeHint}`)
        elHint.style.backgroundColor = 'black'
        gGame.activeHint = null
        return
    }

    if (elCell.classList.contains('hidden')) {
        if (gBoard[i][j] === MINE) {
            updateLives(-1)
            updateSmileyBtn('😥')
        } else {
            updateRevealed(1)
            updateSmileyBtn('🤩')
        }
        elCell.classList.remove('hidden')
        expandShown(gBoard, elCell, i, j)
        checkGameOver()
    }
}

function moveMine(i, j) {
    var location = getEmptyLocation(gBoard)
    gBoard[location.i][location.j] = MINE
    gBoard[i][j] = ''
}

function expandShown(board, elCell, i, j) {
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
    var minesNum = +elBtn.dataset.mines
    var size = +elBtn.dataset.size
    gLevel.MINES = minesNum
    gLevel.SIZE = size
    onInit()
}

function addMines(board, minesNum) {
    for (var i = 0; i < minesNum; i++) {
        var location = getEmptyLocation(board)
        board[location.i][location.j] = MINE
    }
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

function updateBoardAndClass(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cellId = `cell-${i}-${j}`
            var cellElement = document.getElementById(cellId)

            if (cellElement) {
                if (board[i][j] === 0) {
                    board[i][j] = ''
                    cellElement.innerText = ''
                }
                cellElement.classList.add(board[i][j] === '' ? 'empty' : 'number')
                if (cellElement.classList.contains('mine')) cellElement.classList.remove('number')
                if (typeof board[i][j] === 'number' && board[i][j] >= 1 && board[i][j] <= 8) {
                    var className = sayNum(board[i][j])
                    cellElement.classList.add(className)
                }
            }
        }
    }
}

function onCellMarked(ev, elCell) {
    ev.preventDefault()
    var cellI = elCell.id.split('-')[1]
    var cellJ = elCell.id.split('-')[2]
    if (elCell.dataset.marked === 'false' && elCell.classList.contains('hidden')) {
        renderCell({ i: cellI, j: cellJ }, FLAG)
        elCell.dataset.marked = 'true'
        updateMarked(1)
    } else {
        renderCell({ i: cellI, j: cellJ }, gBoard[cellI][cellJ])
        if (elCell.classList.contains('hidden')) updateMarked(-1)
        elCell.dataset.marked = 'false'
    }
}

function checkGameOver() {
    var totalReveals = gLevel.SIZE ** 2 - gLevel.MINES
    if (gGame.lives > 0 && gGame.shownCount !== totalReveals) return

    var msg
    if (gGame.lives <= 0) {
        msg = 'You Lost!'
        updateSmileyBtn('😢')
        document.querySelectorAll('.mine.hidden').forEach((mine) => {
            mine.classList.remove('hidden')
        })
    } else if (gGame.shownCount === totalReveals) {
        msg = 'You Won!'
        updateSmileyBtn('😎')
    }

    openModal(msg)
    clearInterval(timerInterval)
    gGame.isOn = false

    var endTime = Date.now()
    var elapsedTime = ((endTime - gGame.startTime) / 1000).toFixed(2)

    saveTime(elapsedTime)
    // displayTimes()
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

function renderCell(location, value) {
    const cellSelector = '#' + getIdName(location)
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}

function getIdName(location) {
    const cellId = 'cell-' + location.i + '-' + location.j
    return cellId
}

function updateSafeClicks(diff) {
    gGame.safeClicksCount += diff
    var elSafeClickBtn = document.querySelector('.safe-click-btn span')
    elSafeClickBtn.innerText = gGame.safeClicksCount
}

function updateLives(diff) {
    gGame.lives += diff
    var elLives = document.querySelector('.lives span')
    elLives.innerText = gGame.lives
}

function updateMarked(diff) {
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

function updateGame() {
    updateMarked(0)
    updateRevealed(0)
    updateLives(0)
    updateSafeClicks(0)
    updateSmileyBtn('😄')
    resetTimer()
    gIsHintActive = false
}

function resetTimer() {
    clearInterval(timerInterval)
    var elTimer = document.querySelector('.timer span')
    elTimer.innerText = '00:00'
}

function startTimer() {
    var elTimer = document.querySelector('.timer span')
    startTime = Date.now()
    timerInterval = setInterval(() => {
        var elapsedTime = Math.floor((Date.now() - startTime) / 1000)
        var minutes = Math.floor(elapsedTime / 60)
        var seconds = elapsedTime % 60
        minutes = minutes < 10 ? '0' + minutes : minutes
        seconds = seconds < 10 ? '0' + seconds : seconds
        elTimer.innerText = minutes + ':' + seconds
    }, 100)
}

function saveTime(time) {
    let times = localStorage.getItem('times')

    if (times) {
        times += ',' + time
    } else {
        times = time
    }

    localStorage.setItem('times', times)
}

function getTimes() {
    let times = localStorage.getItem('times')
    return times ? times.split(',') : []
}

function displayTimes() {
    let times = getTimes()

    for (let i = 0; i < times.length; i++) {
        for (let j = i + 1; j < times.length; j++) {
            if (times[j] < times[i]) {
                let temp = times[i]
                times[i] = times[j]
                times[j] = temp
            }
        }
    }

    let elTimesList = document.querySelector('.times-list')

    let timesHTML = ''
    for (let i = 0; i < times.length; i++) {
        timesHTML += `<li>${times[i]} seconds</li>`
    }

    if (times.length === 0) {
        timesHTML = '<li>No times yet.</li>'
    }

    elTimesList.innerHTML = timesHTML
}

function clearTimes() {
    localStorage.removeItem('times')
    displayTimes()
}

function onSafeClick() {
    var toLocation = getSafeLocation()
    var cellSelector = `#cell-${toLocation.i}-${toLocation.j}`
    var elCell = document.querySelector(cellSelector)
    elCell.style.backgroundColor = 'yellow'
    updateSafeClicks(-1)
}

function getSafeLocation() {
    const safeLocations = []

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const currCell = gBoard[i][j]
            var elCurrCell = document.querySelector(`#cell-${i}-${j}`)
            if (currCell !== MINE && elCurrCell.classList.contains('hidden')) {
                safeLocations.push({ i, j })
            }
        }
    }

    if (!safeLocations.length) return null

    const randomIdx = getRandomIntInclusive(0, safeLocations.length - 1)
    return safeLocations[randomIdx]
}
