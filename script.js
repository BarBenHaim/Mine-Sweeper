const MINE = '*'
const EMPTY = ''

var gBoard

var gLevel = {
    SIZE: 4,
    MINES: 2,
}

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3,
}
function onInit() {
    gBoard = buildBoard()
    renderBoard(gBoard)
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
         onclick="onCellClicked(this,${i},${j})" oncontextmenu="onCellMarked(event,this)"  >
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
    if (elCell.classList.contains('marked')) return
    elCell.classList.remove('hidden')
    if (elCell.classList.contains('mine')) gGame.lives--

    expandShown(gBoard, elCell, i, j)
}

function expandShown(board, elCell, i, j) {
    var negsCoords = getNegsCoords(i, j, board)
    for (var i = 0; i < negsCoords.length; i++) {
        var negCellId = `cell-${negsCoords[i].i}-${negsCoords[i].j}`
        var negCellElement = document.getElementById(negCellId)
        if (elCell.classList.contains('empty')) negCellElement.classList.remove('hidden')
    }
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

            if (board[i][j] === 0) {
                board[i][j] = ''
                cellElement.innerText = ''
            }
            cellElement.classList.add(board[i][j] === '' ? 'empty' : 'number')
            if (typeof board[i][j] === 'number' && board[i][j] >= 1 && board[i][j] <= 8) {
                cellElement.classList.add(board[i][j].toString())
            }
        }
    }
}

function onCellMarked(ev, elCell) {
    ev.preventDefault()

    elCell.classList.add('marked')
}

function checkGameOver() {}
