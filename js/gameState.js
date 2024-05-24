'use strict'

var gGameStateHistory = []

function saveGameState() {
    const gameState = {
        board: copyBoard(gBoard),
        game: {
            ...gGame,
            boardState: saveBoardState(),
        },
    }
    gGameStateHistory.push(gameState)
}

function saveInitialState() {
    const initialState = {
        board: copyBoard(gBoard),
        game: {
            ...gGame,
            boardState: saveBoardState(),
        },
    }
    gGameStateHistory = [initialState]
}

function onUndo() {
    if (gGameStateHistory.length > 1) {
        gGameStateHistory.pop()
        const lastState = gGameStateHistory[gGameStateHistory.length - 1]

        gBoard = copyBoard(lastState.board)
        gGame = { ...lastState.game }

        restoreBoardState(lastState.game.boardState)
        updateGameDisplay()
    } else {
        alert('No more steps to undo.')
    }
}

function saveBoardState() {
    const boardState = []
    const cells = document.querySelectorAll('.cell')
    cells.forEach((cell) => {
        boardState.push({
            id: cell.id,
            classList: [...cell.classList],
            innerHTML: cell.innerHTML,
            dataMarked: cell.dataset.marked,
            dataHidden: cell.classList.contains('hidden') ? 'true' : 'false',
        })
    })
    return boardState
}

function restoreBoardState(boardState) {
    boardState.forEach((state) => {
        const cell = document.getElementById(state.id)
        cell.className = state.classList.join(' ')
        cell.innerHTML = state.innerHTML
        cell.dataset.marked = state.dataMarked
        if (state.dataHidden === 'true') {
            cell.classList.add('hidden')
        } else {
            cell.classList.remove('hidden')
        }
    })
}

function updateGameDisplay() {
    document.querySelector('.marked-count').innerText = gGame.markedCount
    document.querySelector('.lives-count').innerText = gGame.lives
    document.querySelector('.shown-count').innerText = gGame.shownCount
}
