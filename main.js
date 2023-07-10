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
    const possibleMoves = board.map((elem, i) => (elem) === "" ? i : -1).filter(elem => elem !== -1);
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

const Board = () => {
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
  let player2 = ComputerPlayer("Hal", markTwo);

  let hasComputerPlayer = true;

  if (playerName2) {
    player2 = Player(playerName2, markTwo);
    hasComputerPlayer = false;
  }

  const board = Board();

  let winner = null;

  let currPlayer = player1.getMark() === "X" ? player1 : player2; 

  console.log("player1", player1, "player2", player2, "curr player", currPlayer);
  console.log(player1.getMark(), player2.getMark());

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

    board.updateBoard(index, player.getMark()); 
    _updatePlayer();

    //check for winners
    return _gameFinished(player);
  }

  const _gameFinished = (player) => {
    //want to check if mark is winning mark 
    const indices = board.board.map((elem, i) => (elem) === player.getMark() ? i : -1).filter(elem => elem !== -1);
    
    let won = false;
    for (let i = 0; i < winConditions.length; i ++) {
      won = winConditions[i].every(v => indices.includes(v));
      if (won) {
        console.log("a winner");

        winner = player; //not ideal to do this here....
        break;
      }
    }
    return won || !board.board.includes("");
  }

  const computerPlayer = () => {
    return hasComputerPlayer ? player2 : null;
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
  console.log("one", one, "two,", two);

  const game = gameController(one, two);
  const computer = game.computerPlayer();

  let gameOver = false;

  //cache dom
  const boardDiv = document.getElementById("board");
  const annouceDiv = document.getElementById("annoucement");

  console.log(boardDiv, annouceDiv);

  const updateScreen = () => {
    const currPlayer = game.getCurrPlayer();
    const board = game.getBoard();
    console.log("the current board is", board);

    //update annoucement
    if (gameOver) {
      //want to annoucewinner, else draw -- NEEDS TO BE FINISHED
      annouceDiv.textContent = "The game is finished";
    }
    else {
      annouceDiv.textContent = `${currPlayer.getName()}'s turn.`
    }

    boardDiv.textContent = "";

    //update board
    for(let i = 0; i < board.length; i ++){
      const elem = board[i];
      const cellButton = document.createElement("button");
      cellButton.dataset.index = i;
      cellButton.textContent = elem;

      if (elem !== "" || gameOver) { 
        cellButton.disabled = true;
      }
      boardDiv.appendChild(cellButton);
    }
  };

  const clickHandler = (e) => {
    //might need a check for is the curr player human. 
    console.log("in click handler");

    const currPlayer = game.getCurrPlayer();

    if (e.target.tagName.toLowerCase() === "button" && currPlayer.isHuman()) {
      console.log("taking a human turn");

      gameOver = game.takeTurn(e.target.dataset.index);
      updateScreen();

      if (computer) {
        console.log("computer takes a turn");

        const computerTurn = computer.makeMove(game.getBoard());
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

    const computerTurn = computer.makeMove(game.getBoard()); //NOT DEFINED
    gameOver = game.takeTurn(computerTurn);
    updateScreen();
  }
};

//WRAP THIS IN ITS OWN IFFE
const newGame = document.querySelector('input[type="submit"]');
newGame.addEventListener("click", (e) => {
  //need to check that at least one name has been entered
  e.preventDefault();
  const inputs = document.querySelectorAll('input[type="text"]');
  const names = [];
  const error = document.querySelector(".error");

  inputs.forEach((elem) => {
    names.push(elem.value);
  });
  console.log(names);

  if (!names.some((elem) => elem !== "")) {
    //need to show errors and other wise do nothing
    error.classList.add("show");
  }
  else {
    screenController(names[0], (names.length > 1 ? names[1] : null));

    //plus reset the form and hide it, which should happen first
    inputs.forEach((elem) => {
      elem.value = "";
    });
    error.classList.remove("show");
  }
});