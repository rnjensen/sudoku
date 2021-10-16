//helper functions
const encodeBoard = (board) => board.reduce((result, row, i) => result + `%5B${encodeURIComponent(row)}%5D${i === board.length -1 ? '' : '%2C'}`, '')

const encodeParams = (params) => 
  Object.keys(params)
  .map(key => key + '=' + `%5B${encodeBoard(params[key])}%5D`)
  .join('&');


let board = []
let solution = []
let currentNumber = 1

const checkVictory = () => {
    let victory = !board.some((row, rowId) => {
        return row.some((cell, cellId) => cell !== solution[rowId][cellId])
    })

    if(victory) {
        let ol = document.getElementById("overlay")
        ol.style.display = "block"
    }
}

const updateCurrentNumber = (num) => {
    currentNumber = num

    const btns = document.getElementsByClassName("numBtn")
    for(btn of btns) {
        if(btn.id === "numBtn"+num)
            btn.style.background = "#78efff"
        else {
            btn.style.background = null
        }
    }
}

const makeBoard = () => {
    let htmlBoard = ""
    board.forEach((row, rowId) => {
        htmlBoard += '<div class="row">'
        row.forEach((cell, cellId) => {
            let yShadow = 0
            let xShadow = 0
            htmlBoard += `<div class="cell" id="${rowId}${cellId}" style="`
            if((cellId + 1) % 3 === 0)
                xShadow = 2
            else if(cellId % 3 === 0)
                xShadow = -2

            if((rowId + 1) % 3 === 0)
                yShadow = 2
            else if(rowId % 3 === 0)
                yShadow = -2

            htmlBoard += `box-shadow: ${xShadow}px ${yShadow}px 0 1px black">`
            if(board[rowId][cellId])
                htmlBoard += `<div class="cellVal">${board[rowId][cellId]}</div>`
            htmlBoard += "</div>"
        })
        htmlBoard += '</div>'
    })
    document.getElementById("board").innerHTML = htmlBoard
}

const handleCellClick = (event) => {
    event.preventDefault()
    const cell = event.currentTarget
    cell.innerHTML = `<div class="cellVal">${currentNumber}</div>`
    board[cell.id[0]][cell.id[1]] = currentNumber

    if(solution[cell.id[0]][cell.id[1]] === currentNumber) {
        cell.removeEventListener("click", handleCellClick)
        cell.style.color = null
        cell.style['font-weight'] = null
        checkVictory()
    }
    else {
        cell.style.color = "#e82323"
        cell.style['font-weight'] = "bold"
    }
}

const addListeners = () => {
    cells = document.getElementsByClassName("cell")

    for(const cell of cells) {
        if(!cell.children.length) {
            cell.addEventListener("click", handleCellClick)
        }
    }
}

const getBoard = (difficulty) => {
    let ol = document.getElementById("overlay")
    ol.style.display = "none"
    fetch('https://sugoku.herokuapp.com/board?difficulty=' + difficulty)
    .then(response => response.json())
    .then(response => {
        board = response.board
        getSolution()
        makeBoard()
        addListeners()
    })
    .catch(console.warn)
}


const getSolution = () => {
    fetch('https://sugoku.herokuapp.com/solve', {
    method: 'POST',
    body: encodeParams({board}),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    .then(response => response.json())
    .then(response => solution = response.solution)
    .catch(console.warn)
}

getBoard('easy')