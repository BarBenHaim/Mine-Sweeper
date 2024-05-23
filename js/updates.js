function updateGame() {
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
