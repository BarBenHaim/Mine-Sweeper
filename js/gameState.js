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
        })
    })
    return boardState
}

function restoreBoardState(boardState) {
    boardState.forEach((state) => {
        const cell = document.getElementById(state.id)
        cell.className = state.classList.join(' ')
        cell.innerHTML = state.innerHTML
    })
}
