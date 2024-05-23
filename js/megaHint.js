var gMegaHint = {
    hintStep: 0,
    hintCoords: {},
    gHoverCells: [],
    used: false,
}

function getMegaHintCellsCoords(fromCellI, fromCellJ, toCellI, toCellJ) {
    var cellsToReveal = []
    for (var i = fromCellI; i <= toCellI; i++) {
        for (var j = fromCellJ; j <= toCellJ; j++) {
            cellsToReveal.push({ i, j })
        }
    }
    return cellsToReveal
}

function onMegaHint() {
    if (gMegaHint.used) {
        alert('Mega Hint can only be used once per game.')
        return
    }
    if (gMegaHint.hintStep === 0) {
        gMegaHint.hintStep = 1
        gGame.activeMegaHint = true
        alert('Select the top-left cell for the Mega Hint.')
    }
}

function handleMegaHintClick(i, j) {
    if (gMegaHint.hintStep === 1) {
        gMegaHint.hintCoords.topLeft = { i, j }
        gMegaHint.hintStep = 2
        alert('Select the bottom-right cell for the Mega Hint.')
    } else if (gMegaHint.hintStep === 2) {
        gMegaHint.hintCoords.bottomRight = { i, j }
        var cellsToReveal = getMegaHintCellsCoords(
            gMegaHint.hintCoords.topLeft.i,
            gMegaHint.hintCoords.topLeft.j,
            gMegaHint.hintCoords.bottomRight.i,
            gMegaHint.hintCoords.bottomRight.j
        )
        showMegaHintCells(cellsToReveal)
        gMegaHint.hintStep = 0
        gMegaHint.used = true
        gGame.activeMegaHint = false
        updateMegaHintButton()
    }
}

function showMegaHintCells(cellsToReveal) {
    cellsToReveal.forEach((coord) => {
        var cellElement = document.getElementById(`cell-${coord.i}-${coord.j}`)
        if (cellElement && cellElement.classList.contains('hidden')) {
            cellElement.classList.remove('hidden')
            cellElement.classList.add('revealed-temp')
        }
    })

    setTimeout(() => {
        cellsToReveal.forEach((coord) => {
            var cellElement = document.getElementById(`cell-${coord.i}-${coord.j}`)
            if (cellElement && cellElement.classList.contains('revealed-temp')) {
                cellElement.classList.add('hidden')
                cellElement.classList.remove('revealed-temp')
            }
        })
    }, 2000)
}

function updateMegaHintButton() {
    const elMegaHintBtn = document.querySelector('.mega-hint-btn')
    elMegaHintBtn.classList.add('used')
}

function resetMegaHintButton() {
    const elMegaHintBtn = document.querySelector('.mega-hint-btn')
    elMegaHintBtn.classList.remove('used')
    gMegaHint.hintStep = 0
    gMegaHint.hintCoords = {}
    gMegaHint.used = false
    gGame.activeMegaHint = false
}
