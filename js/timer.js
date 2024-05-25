'use strict'

function resetTimer() {
    clearInterval(gTimerInterval)
    var elTimer = document.querySelector('.timer span')
    elTimer.innerText = '00:00'
}

function startTimer() {
    var elTimer = document.querySelector('.timer span')
    gStartTime = Date.now()
    gTimerInterval = setInterval(() => {
        var elapsedTime = Math.floor((Date.now() - gStartTime) / 1000)
        var minutes = Math.floor(elapsedTime / 60)
        var seconds = elapsedTime % 60
        minutes = minutes < 10 ? '0' + minutes : minutes
        seconds = seconds < 10 ? '0' + seconds : seconds
        elTimer.innerText = minutes + ':' + seconds
    }, 100)
}

function saveTime(time) {
    if (gGame.isManualCreateMode) return
    const level = getLevelName(gLevel.SIZE)
    let times = localStorage.getItem('times' + level)

    if (times) {
        times += ',' + time
    } else {
        times = time
    }

    localStorage.setItem('times' + level, times)
}

function getTimes(level) {
    let times = localStorage.getItem('times' + level)
    return times ? times.split(',') : []
}

function displayTimes() {
    const levels = ['easy', 'medium', 'hard']

    levels.forEach((level) => {
        let times = getTimes(level)

        times.sort((a, b) => a - b)

        let elTimesList = document.querySelector('.times-list-' + level)
        let timesHTML = ''

        for (let i = 0; i < times.length; i++) {
            timesHTML += `<li>${times[i]} seconds</li>`
        }

        if (times.length === 0) {
            timesHTML = '<li>No times yet.</li>'
        }

        elTimesList.innerHTML = timesHTML
    })
}

function clearTimes() {
    const levels = ['easy', 'medium', 'hard']
    levels.forEach((level) => {
        localStorage.removeItem('times' + level)
    })
    displayTimes()
}

function getLevelName(size) {
    switch (size) {
        case 4:
            return 'easy'
        case 8:
            return 'medium'
        case 12:
            return 'hard'
        default:
            return 'easy'
    }
}
