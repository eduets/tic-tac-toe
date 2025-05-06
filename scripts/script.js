/* Tic Tac Toe script */

const Game = (function () {
    const DEFAULT_NAME_PLAYER_ONE = "Player 1";
    const DEFAULT_NAME_PLAYER_TWO = "Player 2";
    const DEFAULT_MARK_PLAYER_ONE = 'x';
    const DEFAULT_MARK_PLAYER_TWO = 'o';
    
    const players = []
    let currentPlayerIndex = 0;
    addPlayer(DEFAULT_NAME_PLAYER_ONE, DEFAULT_MARK_PLAYER_ONE);
    addPlayer(DEFAULT_NAME_PLAYER_TWO, DEFAULT_MARK_PLAYER_TWO);
    let isGameOver = false;
    let winnerIndex = null;

    const GameBoard = (function () {
        const GAME_BOARD_SIZE = 3**2;
        const EMPTY_SPOT = null;
        const WIN_CONDITIONS = [
            [0,1,2], [3,4,5], [6,7,8], [0,3,6],
            [1,4,7], [2,5,8], [0,4,8], [2,4,6]
        ]

        const gameBoardArray = [];
        for (let i=0; i<GAME_BOARD_SIZE; i++) {
            gameBoardArray.push(EMPTY_SPOT);
        }

        function isSpotAvailable(spotIndex) {
            let spotAvailable = false;
            if (gameBoardArray.length <= spotIndex) {
                return spotAvailable;
            }
            if (gameBoardArray[spotIndex] === EMPTY_SPOT) {
                spotAvailable = true;
            }
            return spotAvailable;
        }

        function reset() {
            for (let i=0; i<GAME_BOARD_SIZE; i++) {
                gameBoardArray[i] = EMPTY_SPOT;
            }
        }

        function markSpot(spotIndex, mark) {
            let markSuccess = false;
            if (isSpotAvailable(spotIndex)) {
                gameBoardArray[spotIndex] = mark;
                markSuccess = true;
            }
            return markSuccess;
        }

        function isWinConditionMet(mark) {
            let winConditionMet = false;
            for (let i=0; i<WIN_CONDITIONS.length; i++) {
                let coincidences = 0;
                for (let j=0; j<WIN_CONDITIONS.length; j++) {
                    if (!(gameBoardArray[WIN_CONDITIONS[i][j]] === mark)) {
                        break;
                    } else {
                        coincidences += 1;
                    }
                }
                if (coincidences === WIN_CONDITIONS[i].length) {
                    winConditionMet = true;
                    break;
                }
            }
            return winConditionMet;
        }

        function isBoardFull() {
            let boardFull = false;
            if (!gameBoardArray.includes(EMPTY_SPOT)) {
                boardFull = true;
            }
            return boardFull;
        }

        function getGameBoardArray() {
            return gameBoardArray;
        }

        return { reset, markSpot, isWinConditionMet, isBoardFull, getGameBoardArray };
    })();

    function createPlayer(name, mark) {
        return { name, mark };
    }

    function addPlayer(name, mark) {
        const newPlayer = createPlayer(name, mark);
        players.push(newPlayer);
    }

    function modifyPlayerName(playerIndex, newPlayerName) {
        if (players.length <= playerIndex) {
            throw Error("Player index doesn't exist");
        }

        players[playerIndex].name = newPlayerName;
    }

    function getCurrentPlayerName() {
        return players[currentPlayerIndex].name;
    }

    function reset() {
        GameBoard.reset();
        isGameOver = false;
        currentPlayerIndex = 0;
        winnerIndex = null;
    }

    function startGame(playerOneName, playerTwoName) {
        reset();
        modifyPlayerName(0, playerOneName);
        modifyPlayerName(1, playerTwoName);
    }

    function setNextCurrentPlayer() {
        currentPlayerIndex += 1;
        if (currentPlayerIndex >= players.length) {
            currentPlayerIndex = 0;
        }
    }

    function getCurrentPlayerMark () {
        return players[currentPlayerIndex].mark;
    }

    function markSpot(spotIndex) {
        const currentPlayerMark = getCurrentPlayerMark();

        if (isGameOver) {
            return;
        }

        const markSuccess = GameBoard.markSpot(spotIndex, currentPlayerMark)
        if (!markSuccess) {
            return
        }

        if (GameBoard.isWinConditionMet(currentPlayerMark)) {
            isGameOver = true;
            winnerIndex = currentPlayerIndex;
        } else if (GameBoard.isBoardFull()) {
            isGameOver = true;
        } else {
            setNextCurrentPlayer();
        }

        return isGameOver;
    }

    function getGameBoardArray() {
        return GameBoard.getGameBoardArray();
    }

    function getWinnerName() {
        let winnerName = null;
        if (winnerIndex !== null) {
            winnerName = players[winnerIndex].name;
        }
        return winnerName;
    }

    return { startGame, markSpot, getCurrentPlayerName, getGameBoardArray, getWinnerName };
})();


const WindowHandler = (function () {
    const DEFAULT_MARK_PLAYER_ONE = 'x';
    const DEFAULT_MARK_PLAYER_TWO = 'o';

    const board = document.querySelector('#board');
    const spotButtons = document.querySelectorAll('.board-spot');

    const buttonStart = document.querySelector('#button-start');
    const playerOneNameInput = document.querySelector('#player-one-name');
    const playerTwoNameInput = document.querySelector('#player-two-name');

    const turnInfo = document.querySelector('.turn-info');
    const results = document.querySelector('.results');

    function setEnableSpotButtons(enable) {
        for (let i=0; i<spotButtons.length; i++) {
            spotButtons[i].disabled = !enable;
        }
    }

    function clearSpots() {
        for (let i=0; i<spotButtons.length; i++) {
            const spotButtonChildren = spotButtons[i].childNodes;
            for (let j=spotButtonChildren.length-1; j>=0; j--) {
                spotButtonChildren[j].remove();
            }
        }
    }

    function renderTurnInfo() {
        turnInfo.textContent = `${Game.getCurrentPlayerName()}, it's your turn!`;
    }

    function clearTurnInfo() {
        turnInfo.textContent = "";
    }

    function renderResults() {
        if (results.childNodes.length === 0) {
            const resultsLabel = document.createElement('div');
            resultsLabel.classList.add('results-label');
            resultsLabel.textContent = "Results:";
            results.appendChild(resultsLabel);
        }

        const winner = Game.getWinnerName();
        const winnerText = document.createElement('div');
        if (winner === null) {
            winnerText.textContent = "It's a tie!";
        } else {
            winnerText.textContent = `${winner} won!`;
        }
        results.appendChild(winnerText);
    }

    function markSpotImg(spot, mark) {
        const markImg = document.createElement('img');
        if (mark === DEFAULT_MARK_PLAYER_ONE) {
            markImg.setAttribute('src', "./images/cross.svg");
        } else {
            markImg.setAttribute('src', "./images/circle.svg");
        }
        spot.appendChild(markImg);
    }

    function renderBoard(gameBoardArray) {
        for (let i=0; i<gameBoardArray.length; i++) {
            if (gameBoardArray[i] !== null) {
                const spotButtonChildren = spotButtons[i].childNodes;
                if (spotButtonChildren.length === 0) {
                    let mark;
                    if (gameBoardArray[i] === DEFAULT_MARK_PLAYER_ONE) {
                        mark = DEFAULT_MARK_PLAYER_ONE;
                    } else {
                        mark = DEFAULT_MARK_PLAYER_TWO;
                    }
                    markSpotImg(spotButtons[i], mark);
                }
            }
        }
    }

    function unblockGame() {
        playerOneNameInput.disabled = true;
        playerTwoNameInput.disabled = true;
        buttonStart.disabled = true;
        setEnableSpotButtons(true);
        Game.startGame(playerOneNameInput.value, playerTwoNameInput.value);
        clearSpots();
        renderTurnInfo();
    }

    function blockGame() {
        setEnableSpotButtons(false);
        playerOneNameInput.disabled = false;
        playerTwoNameInput.disabled = false;
        buttonStart.disabled = false;
        clearTurnInfo();
        renderResults();
        buttonStart.textContent = "Restart";
    }

    buttonStart.addEventListener('click', (event) => {
        event.preventDefault();
        unblockGame();
    });

    board.addEventListener('click', (event) => {
        if (event.target.getAttribute('id') !== "board") {
            const clickedSpotIndex = event.target.getAttribute('data-spot-id');
            const isGameOver = Game.markSpot(clickedSpotIndex);
            renderBoard(Game.getGameBoardArray());
            event.target.disabled = true;
            if (isGameOver) {
                blockGame();
            } else {
                renderTurnInfo();
            }
        }
    }, {capture: true});
})();
