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

  const makeSmartMove = (board, winConditions) => {
    const moveScores = _startingMoveScores();
    const opponentMark = mark === "X" ? "O" : "X";

    for(let i = 0; i < board.length; i ++) {
      if (board[i] !== "") {
        moveScores.set(i, 0); //unavailable moves have no value
      }
      else {
        const wins = winConditions.get(i);
        for (const w of wins) {
          if (_checkMove(board, w, mark)) {
            //a winning move -- doesn't have to be
            // + infinity, just any number that guarantees it 
            //has the highest score.
            moveScores.set(i, moveScores.get(i) + Infinity);
            break; //can't get a better move
          }
          else if (_checkMove(board, w, opponentMark)) {
            //a forced move -- doesn't matter what we add here.
            //as long as its finite and it will guarantee
            //that a forced move gets a higher score than any 
            //non-forced move.
            moveScores.set(i, moveScores.get(i) + 10);
          }
        }
      }
    }
    //return the move with the highest score
    return [...moveScores.keys()].reduce((a, e) => moveScores.get(e) > moveScores.get(a) ? e : a);
  };

  const _checkMove = (board, winCondition, m) => {
    //helper method to check whether move is forced or winning
    const [p, q] = winCondition;
    
    if (board[p] === m && board[q] === m) {
      return true;
    }
    return false;
  };

  const _startingMoveScores = () => {
    return new Map([
                    [1, 2], [3, 2], [5, 2], [7, 2],
                    [0, 3], [2, 3], [6, 3], [8, 3],
                    [4, 4]
                  ]);
  };
  
  const isHuman = () => {
    return false;
  };

  return {
    ...computer,
    makeMove,
    makeSmartMove,
    isHuman
  }
};

const Board = () => {
  const board = new Array(9);
  board.fill(""); //empty string because we will use this in dom

  const updateBoard = (index, mark) => {
    board[index] = mark;
  };

   const getSquare = (index) => {
     return board[index];
   };

  return {board, updateBoard, getSquare};
};

const gameController = (playerName1, playerName2 = null) => {
  const winConditions = new Map([
                      [0, [[1, 2], [3, 6], [4, 8]]],
                      [1, [[0, 2], [4, 7]]],
                      [2, [[0, 1], [5, 8], [4, 6]]],
                      [3, [[4, 5], [0, 6]]],
                      [4, [[3, 5], [1, 7], [0, 8], [2, 6]]],
                      [5, [[3, 4], [2, 8]]],
                      [6, [[7, 8], [0, 3], [2, 4]]],
                      [7, [[6, 8], [1, 4]]],
                      [8, [[6, 7], [2, 5], [0,4]]]
                    ]);

  const coinFlip = Math.floor(Math.random() * 2);

  const markOne = coinFlip ? "X" : "O";
  const markTwo = coinFlip ? "O" : "X";

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
    return _gameFinished(player, index);
  };

  const _gameFinished = (player, index) => {
    const possibleWins = winConditions.get(parseInt(index));
    let won = false;

    for (const p of possibleWins) {
      if (board.getSquare(p[0]) === board.getSquare(p[1]) && board.getSquare(p[0]) === player.getMark()) {
        won = true;
        winner = player;
        break;
      }
    }
    return won || !board.board.includes("");
  };

  const computerPlayer = () => {
    return hasComputerPlayer ? player2 : null;
  };

  const getWinConditions = () => {
    //computer player needs this
    return winConditions;
  };

  return {
    getCurrPlayer,
    takeTurn,
    getBoard,
    getWinner,
    computerPlayer,
    getWinConditions
  }
};

//called when "player form" has been submitted
const screenController = (one, two) => {
  const game = gameController(one, two);
  const computer = game.computerPlayer();
  const winConditions = game.getWinConditions();

  let gameOver = false;

  //cache dom elements
  const boardDiv = document.getElementById("board");
  const annouceDiv = document.getElementById("annoucement");

  const updateScreen = () => {
    const currPlayer = game.getCurrPlayer();
    const board = game.getBoard();

    //update annoucement
    if (gameOver) {
      _annouceResult();
      boardDiv.removeEventListener("click", clickHandler);
    }
    else {
      annouceDiv.textContent = `${currPlayer.getName()}'s turn.`
    }

    boardDiv.textContent = "";

    //redraw board
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
    const currPlayer = game.getCurrPlayer();

    if (e.target.tagName.toLowerCase() === "button" && currPlayer.isHuman()) {
      gameOver = game.takeTurn(e.target.dataset.index);
      updateScreen();
      if (gameOver) return;

      if (computer) {
        setTimeout(() => {
          const computerTurn = computer.makeSmartMove(game.getBoard(), winConditions); 
          gameOver = game.takeTurn(computerTurn); 
          updateScreen();
        }, 1000);
      }
    }
  }

  const _annouceResult = () => {
    const winner = game.getWinner();
    if (winner) {
      annouceDiv.textContent = `${winner.getName()} wins!`;
    }
    else {
      annouceDiv.textContent = "It is a draw.";
    }
    annouceDiv.classList.add("gameover");
  }

  boardDiv.addEventListener("click", clickHandler);
  updateScreen();

  //is the computer the first player? if so, it needs to move first
  if (computer && computer.getMark() === "X") {
    setTimeout(() => {
      const computerTurn = computer.makeSmartMove(game.getBoard(), winConditions); 
      gameOver = game.takeTurn(computerTurn); 
      updateScreen();
    }, 1000);
  }
};

(function() {
  const startNewGame = document.querySelector('input[type="submit"]');
  const inputs = document.querySelectorAll('input[type="text"]');
  const error = document.querySelector(".error");
  const playerForm = document.querySelector("form");
  const showFormBtn = document.getElementById("play-game");

  showFormBtn.addEventListener("click", () => {
    playerForm.classList.add("show");
    resetBoard();
  });

  startNewGame.addEventListener("click", (e) => {
    e.preventDefault();
    const names = [];

    inputs.forEach((elem) => {
      names.push(elem.value);
    });

    //need at least one human player
    if (!names.some((elem) => elem !== "")) {
      error.classList.add("show");
    }
    else {
      screenController(names[0], (names.length > 1 ? names[1] : null));
      resetForm();
    }
  });

  //if they changed their mind about playing
  const cancelGameBtn = document.getElementById("cancel-game");
  cancelGameBtn.addEventListener("click", () => {
    resetForm();
  })

  function resetForm() {
    inputs.forEach((elem) => {
      elem.value = "";
    });
    error.classList.remove("show");
    playerForm.classList.remove("show");
  }

  function resetBoard() {
    const annouceDiv = document.getElementById("annoucement");
    const boardDiv = document.getElementById("board");

    annouceDiv.textContent = ""; //clear out any message from prev game
    annouceDiv.classList.remove("gameover");
    boardDiv.textContent = ""; //reset the board
  }
})();