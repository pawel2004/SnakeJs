// TODO: Preload grafik. Div na hidden i onload i dopiero jak się załadują to main().

/* 
    Zmienne globalne.
*/
const body = document.querySelector('body');
const width = 30;
const height = 30;
const tick = 100;
const promptTick = 500;
const startPoint = {
    x: 20,
    y: 20
};
const images = [
    'bonus.png',
    'downLeft.png',
    'downRight.png',
    'grass.png',
    'leftUp.png',
    'rightUp.png',
    'rock.png',
    'sbody.png',
    'sheadd.png',
    'sheadl.png',
    'sheadr.png',
    'sheadt.png',
    'taild.png',
    'taill.png',
    'tailr.png',
    'tailt.png'
];
let fieldTable = [];
let board = null;
let snakeTable = [];
let isReady = true;
let prevDirection = 0;
let snakeDirection = 0;
let tailDirection = 2;
let tailImg = 'url("img/tailr.png")';
let isTurn = false;
let gameLoop = null;
let bonusPosition = null;
let isChangePossible = false;
let gamePrompt = null;
let resultPrompt = null;
let promptAnimation = null;

/* 
    Ładowanie grafik do cache.
*/

preload();

function preload() {
    let cacheDiv = document.createElement('div');
    cacheDiv.classList.add('cacheDiv');
    body.appendChild(cacheDiv);
    images.forEach(function (image) {
        let imgDiv = document.createElement('div');
        imgDiv.classList.add('imgDiv');
        imgDiv.style.backgroundImage = `url("img/${image}")`;
        cacheDiv.appendChild(imgDiv);
    });
    /*
        Punkt startowy programu.
    */
    main();
}

/* 
    Funkcja startowa.
*/
function main() {
    generatePrompt();
    generateBoard();
    window.addEventListener('keydown', function (e) {
        switch (e.key) {
            case ' ': {
                if (isReady) {
                    gameLoop = window.setInterval(gameLoopHandler, tick);
                    if (resultPrompt != null)
                        resultPrompt.remove();
                    window.clearInterval(promptAnimation);
                    gamePrompt.innerHTML = 'Snaking...';
                    gamePrompt.classList.remove('yellow');
                    initSnake();
                    generateBonus(true);
                    isReady = false;
                }
                break;
            }
            case 'ArrowLeft': {
                if (snakeDirection != 2 && isChangePossible) {
                    prevDirection = snakeDirection;
                    snakeDirection = 0;
                    isTurn = true;
                    isChangePossible = false;
                }
                break;
            }
            case 'ArrowUp': {
                if (snakeDirection != 3 && isChangePossible) {
                    prevDirection = snakeDirection;
                    snakeDirection = 1;
                    isTurn = true;
                    isChangePossible = false;
                }
                break;
            }
            case 'ArrowRight': {
                if (snakeDirection != 0 && isChangePossible) {
                    prevDirection = snakeDirection;
                    snakeDirection = 2;
                    isTurn = true;
                    isChangePossible = false;
                }
                break;
            }
            case 'ArrowDown': {
                if (snakeDirection != 1 && isChangePossible) {
                    prevDirection = snakeDirection;
                    snakeDirection = 3;
                    isTurn = true;
                    isChangePossible = false;
                }
                break;
            }
        }
    });
}

/* 
    Funkcja generująca kontrolkę.
*/
function generatePrompt() {
    gamePrompt = document.createElement('div');
    gamePrompt.classList.add('gamePrompt');
    gamePrompt.innerHTML = 'Press SPACE to start!';
    promptAnimation = window.setInterval(function () {
        gamePrompt.classList.toggle('yellow');
    }, promptTick);
    body.appendChild(gamePrompt);
}

/* 
    Funkcja generująca kontrolkę o wygranej i przegranej.
*/
function generateResult(win) {
    resultPrompt = document.createElement('div');
    resultPrompt.classList.add('resultPrompt');
    if (win) {
        resultPrompt.classList.add('bgGreen');
        resultPrompt.innerHTML = 'You win!';
    } else {
        resultPrompt.classList.add('bgRed');
        resultPrompt.innerHTML = 'You lose!';
    }
    body.appendChild(resultPrompt);
}

/* 
    Funkcja generująca planszę.
*/
function generateBoard() {
    board = document.createElement('table');
    let tdRule = document.styleSheets[0].cssRules[2];
    let tdWidth = parseInt(tdRule.style.width);
    let tdHeight = parseInt(tdRule.style.height);
    // TODO: Bardziej dynamiczne
    board.style.width = tdWidth * (width + 2) + 'px';
    board.style.height = tdHeight * (height + 2) + 'px';
    board.classList.add('board');
    for (let i = 0; i < height + 2; i++) {
        let tr = document.createElement('tr');
        if (i == 0 || i == height + 1) {
            for (let j = 0; j < width + 2; j++) {
                let td = document.createElement('td');
                td.classList.add('cell');
                td.style.backgroundImage = 'url(img/rock.png)';
                tr.appendChild(td);
            }
        } else {
            let fieldRow = [];
            for (let j = 0; j < width + 2; j++) {
                let td = document.createElement('td');
                td.classList.add('cell');
                if (j == 0 || j == width + 1) {
                    td.style.backgroundImage = 'url(img/rock.png)';
                } else {
                    td.style.backgroundImage = 'url(img/grass.png)';
                    fieldRow.push(td);
                }
                tr.appendChild(td);
            }
            fieldTable.push(fieldRow);
        }
        board.appendChild(tr);
    }
    body.appendChild(board);
}

/*
    Funkcja obsługująca snake'a.
*/
function initSnake() {
    snakeTable.forEach(function (snakeElement) {
        fieldTable[snakeElement.y][snakeElement.x].style.backgroundImage = 'url(img/grass.png)';
    });
    snakeTable = [];
    snakeDirection = 0;
    tailDirection = 2;
    tailImg = 'url("img/tailr.png")';
    generateHead(startPoint);
    snakeTable.push(startPoint);
}

/* 
    Funkcja losująca bonus.
*/
function generateBonus(isFirst) {
    if (!isFirst) {
        generateHead(bonusPosition);
    } else {
        if (bonusPosition != null) {
            fieldTable[bonusPosition.y][bonusPosition.x].style.backgroundImage = 'url(img/grass.png)';
        }
    }
    /* 
        Losujemy dopóki nie trafimy na taki bonus, żeby nie pojawił się w wężu.
    */
    do {
        bonusPosition = {
            x: Math.floor(Math.random() * width),
            y: Math.floor(Math.random() * height)
        };
    } while (checkBody(bonusPosition));
    fieldTable[bonusPosition.y][bonusPosition.x].style.backgroundImage = 'url(img/bonus.png)';
}

/* 
    Funkcja obsługująca pętlę gry.
*/
function gameLoopHandler() {
    let snakeHead = snakeTable[0];
    switch (snakeDirection) {
        case 0: {
            if (snakeHead.x < 1) {
                finish(false);
                break;
            }
            let newPos = {
                x: snakeHead.x - 1,
                y: snakeHead.y
            };
            moveSnake(newPos);
            break;
        }
        case 1: {
            if (snakeHead.y < 1) {
                finish(false);
                break;
            }
            let newPos = {
                x: snakeHead.x,
                y: snakeHead.y - 1
            };
            moveSnake(newPos);
            break;
        }
        case 2: {
            if (snakeHead.x > width - 2) {
                finish(false);
                break;
            }
            let newPos = {
                x: snakeHead.x + 1,
                y: snakeHead.y
            };
            moveSnake(newPos);
            break;
        }
        case 3: {
            if (snakeHead.y > height - 2) {
                finish(false);
                break;
            }
            let newPos = {
                x: snakeHead.x,
                y: snakeHead.y + 1
            };
            moveSnake(newPos);
            break;
        }
    }
    isChangePossible = true;
}

/* 
    Funkcja szukająca w tablicy węża, czy dana pozycja nie istnieje.
*/
function checkBody(checkPos) {
    for (let i = 0; i < snakeTable.length; i++) {
        if (snakeTable[i].x == checkPos.x && snakeTable[i].y == checkPos.y)
            return true;
    }
    return false;
}

/*
    Funkcja przesuwająca węża i obsługująca zdarzenia z nim związane.
*/
function moveSnake(newHeadPos) {
    /* 
        Sprawdzenie, czy nie wjechaliśmy jakby w siebie.
    */
    if (checkBody(newHeadPos)) {
        finish(false);
        return;
    }
    snakeTable.unshift(newHeadPos);
    generateHead(newHeadPos);
    if (snakeTable.length > 1) {
        if (!isTurn)
            fieldTable[snakeTable[1].y][snakeTable[1].x].style.backgroundImage = 'url(img/sbody.png)';
        else
            createTurn();
        updateTail();
    }
    if (newHeadPos.x == bonusPosition.x && newHeadPos.y == bonusPosition.y) {
        /* 
            Jeżeli po zebraniu bonusu okaże się, że wąż zajmuje już całą planszę, to wygrywamy.
        */
        if (snakeTable.length == width * height)
            finish(true);
        generateBonus(false);
    } else {
        let droppedPos = snakeTable.pop();
        updateTail();
        fieldTable[droppedPos.y][droppedPos.x].style.backgroundImage = 'url(img/grass.png)';
    }
}

/* 
    Funkcja końca gry.
*/
function finish(win) {
    clearInterval(gameLoop);
    gamePrompt.innerHTML = 'Press SPACE to start again!';
    promptAnimation = window.setInterval(function () {
        gamePrompt.classList.toggle('yellow');
    }, promptTick);
    generateResult(win);
    isReady = true;
}

/*
    Funkcja do rysowania głowy w odpowiednią stronę.
*/
function generateHead(headPos) {
    switch (snakeDirection) {
        case 0: {
            fieldTable[headPos.y][headPos.x].style.backgroundImage = 'url(img/sheadl.png)';
            break;
        }
        case 1: {
            fieldTable[headPos.y][headPos.x].style.backgroundImage = 'url(img/sheadt.png)';
            break;
        }
        case 2: {
            fieldTable[headPos.y][headPos.x].style.backgroundImage = 'url(img/sheadr.png)';
            break;
        }
        case 3: {
            fieldTable[headPos.y][headPos.x].style.backgroundImage = 'url(img/sheadd.png)';
            break;
        }
    }
}

/* 
    Funkcja do generowania skrętu węża.
*/
function createTurn() {
    if (prevDirection != snakeDirection) {
        if ((prevDirection == 2 && snakeDirection == 3) || (prevDirection == 1 && snakeDirection == 0))
            fieldTable[snakeTable[1].y][snakeTable[1].x].style.backgroundImage = 'url(img/downLeft.png)';
        else if ((prevDirection == 1 && snakeDirection == 2) || (prevDirection == 0 && snakeDirection == 3))
            fieldTable[snakeTable[1].y][snakeTable[1].x].style.backgroundImage = 'url(img/downRight.png)';
        else if ((prevDirection == 2 && snakeDirection == 1) || (prevDirection == 3 && snakeDirection == 0))
            fieldTable[snakeTable[1].y][snakeTable[1].x].style.backgroundImage = 'url(img/leftUp.png)';
        else
            fieldTable[snakeTable[1].y][snakeTable[1].x].style.backgroundImage = 'url(img/rightUp.png)';
    } else
        fieldTable[snakeTable[1].y][snakeTable[1].x].style.backgroundImage = 'url(img/sbody.png)';
    isTurn = false;
}

/* 
    Funkcja do obsługi końcówki ogona.
*/
function updateTail() {
    if (snakeTable.length > 1) {
        switch (fieldTable[snakeTable[snakeTable.length - 1].y][snakeTable[snakeTable.length - 1].x].style.backgroundImage) {
            case 'url("img/downLeft.png")': {
                if (tailDirection == 0) {
                    tailImg = 'url("img/tailt.png")';
                    tailDirection = 1;
                } else if (tailDirection == 3) {
                    tailImg = 'url("img/tailr.png")';
                    tailDirection = 2;
                }
                break;
            }
            case 'url("img/downRight.png")': {
                if (tailDirection == 2) {
                    tailImg = 'url("img/tailt.png")';
                    tailDirection = 1;
                } else if (tailDirection == 3) {
                    tailImg = 'url("img/taill.png")';
                    tailDirection = 0;
                }
                break;
            }
            case 'url("img/leftUp.png")': {
                if (tailDirection == 0) {
                    tailImg = 'url("img/taild.png")';
                    tailDirection = 3;
                } else if (tailDirection == 1) {
                    tailImg = 'url("img/tailr.png")';
                    tailDirection = 2;
                }
                break;
            }
            case 'url("img/rightUp.png")': {
                if (tailDirection == 2) {
                    tailImg = 'url("img/taild.png")';
                    tailDirection = 3;
                } else if (tailDirection == 1) {
                    tailImg = 'url("img/taill.png")';
                    tailDirection = 0;
                }
                break;
            }
        }
        fieldTable[snakeTable[snakeTable.length - 1].y][snakeTable[snakeTable.length - 1].x].style.backgroundImage = tailImg;
    } else {
        switch (snakeDirection) {
            case 0: {
                tailDirection = 2;
                tailImg = 'url("img/tailr.png")';
                break;
            }
            case 1: {
                tailDirection = 3;
                tailImg = 'url("img/taild.png")';
                break;
            }
            case 2: {
                tailDirection = 0;
                tailImg = 'url("img/taill.png")';
                break;
            }
            case 3: {
                tailDirection = 1;
                tailImg = 'url("img/tailt.png")';
                break;
            }
        }
    }
}