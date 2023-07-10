const Player = (name, mark) => {
  const getName = () => {
    return name;
  }
  const getMark = () => {
    return mark;
  }
  const isHuman = () => {
    return true;
  }
  return {getName, getMark, isHuman};
};

const ComputerPlayer = (name, mark) => {
  const computer = Player(name, mark);
  const makeMove = (board) => {
    //grab any random empty square for now
    const possibleMoves = board.board.map((elem, i) => (elem) === "" ? i : -1).filter(elem => elem !== -1);
    const index = Math.floor(Math.random() * possibleMoves.length);
    return possibleMoves[index];
  };
  const isHuman = () => {
    return false;
  };
  return {
    ...computer,
    makeMove,
    isHuman
  }
};

const boardFactory = () => {
  const board = new Array(9);
  board.fill(""); //empty string because we will use this in dom

  const updateBoard = (index, mark) => {
    board[index] = mark;
  };
  return {board, updateBoard};
};

const gameController = (playerName1, playerName2 = null) => {
  const winConditions = [
                          [0, 1, 2], 
                          [3, 4, 5], 
                          [6, 7, 8],
                          [0, 3, 6],
                          [1, 4, 7],
                          [2, 5, 8],
                          [0, 4, 8],
                          [2, 4, 6]
                        ];

  const coinFlip = Math.floor(Math.random() * 2);

  const markOne = coinFlip ? "X" : "0";
  const markTwo = coinFlip ? "0" : "X";
  const player1 = Player(playerName1, markOne);
  const player2 = ComputerPlayer("Hal", markTwo);

  if (playerName2) {
    player2 = Player(playerName2, markTwo);
  }

  const board = boardFactory();

  let winner = null;

  let currPlayer = player1.mark === "X" ? player1 : player2; 

  const getBoard = () => {
    return board.board;
  };

  const getWinner = () => {
    return winner
  };

  const _updatePlayer = () => {
    currPlayer = currPlayer === player1 ? player2 : player1;
  };

  const getCurrPlayer = () => {
    return currPlayer;
  };

  const takeTurn = (index) => {
    const player = getCurrPlayer();

    board.updateBoard(index, player.mark); 
    _updatePlayer();

    //check for winners
    return _gameFinished(player);
  }

  const _gameFinished = (player) => {
    //want to check if mark is winning mark 
    const indices = board.board.map((elem, i) => (elem) === player.mark ? i : -1).filter(elem => elem !== -1);
    let won = false;
    for (let i = 0; i < winConditions.length; i ++) {
      won = winConditions[i].every(v => indices.includes(v));
      if (won) {
        winner = player; //not ideal to do this here....
        break;
      }
    }
    return won || !board.board.includes("");
  }

  const computerPlayer = () => {
    if (playerName2 === null) {
      return null;
    }
    else {
      return player2;
    }
  }

  return {
    getCurrPlayer,
    takeTurn,
    getBoard,
    getWinner,
    computerPlayer
  }
};

//for screen controller - pass bool to updateScreen() that denotes end of game. redraws but accounces
//winner or draw instead of player's turn.

//want to call this when "player form" has been submitted
const screenController = (one, two) => {
  const game = gameController(one, two);
  const computer = game.computerPlayer();

  let gameOver = false;

  //cache dom
  const boardDiv = document.getElementById("board");
  const annouceDiv = document.getElementById("announcement");

  const updateScreen = () => {
    const currPlayer = game.getCurrPlayer();
    const board = game.getBoard();

    //update annoucement
    if (gameOver) {
      //want to annoucewinner, else draw -- NEEDS TO BE FINISHED
      annouceDiv.textContent = "The game is finished";
    }
    else {
      annouceDiv.textContent = `${currPlayer.name}'s turn.`
    }

    //update board
    for(let i = 0; i < board.length; i ++){
      const elem = board[i];
      const cellButton = document.createElement("button");
      cellButton.dataset.index = i;
      cellButton.textContent = elem;

      if (elem === "" || gameOver) { 
        cellButton.disabled = true;
      }
      boardDiv.appendChild(cellButton);
    }
  };

  const clickHandler = (e) => {
    //might need a check for is the curr player human. 
    const currPlayer = game.getCurrPlayer();

    if (e.target.tagName.toLowerCase() === "button" && currPlayer.isHuman()) {
      gameOver = game.takeTurn(e.target.dataset.index);
      updateScreen();

      if (computer) {
        console.log("computer takes a turn");

        const computerTurn = computer.makeMove();
        gameOver = game.takeTurn(computerTurn);
        updateScreen();
      }
    }
  }

  //add the click listener
  boardDiv.addEventListener("click", clickHandler);

  /* for a computer game, 
    will want: for every human turn, take a computer turn
    so every click, then add computer turn
    + an inital turn if computer goes first...
  */

  //do the initial render
  updateScreen();

  if (computer) {
    console.log("computer takes first turn");

    const computerTurn = computer.makeMove();
    gameOver = game.takeTurn(computerTurn);
    updateScreen();
  }
};

//need form input to start...

//testing
