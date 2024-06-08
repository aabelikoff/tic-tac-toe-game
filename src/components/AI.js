export class AI {
  constructor(compSymbol, playerSymbol) {
    this.compSymbol = compSymbol;
    this.playerSymbol = playerSymbol;
  }

  // Evaluating current game
  score(game) {
    if (game.checkWinForSymbol(this.compSymbol)) {
      return 10;
    } else if (game.checkWinForSymbol(this.playerSymbol)) {
      return -10;
    } else {
      return 0;
    }
  }

  // Getting opponent's symbol
  opponent(symbol) {
    return symbol === "0" ? "x" : "0";
  }

  // Algorithm minmax
  minimax(game, symbol) {
    if (game.isGameOver()) {
      return { choice: null, score: this.score(game) };
    }

    const scores = [];
    const moves = [];

    game.getAvailableMoves().forEach(move => {
      const possibleGame = game.getNewState(move, symbol);
      const result = this.minimax(possibleGame, this.opponent(symbol));
      scores.push(result.score);
      moves.push(move);
    });

    if (scores.length === 0) {
      return { choice: null, score: 0 };
    }

    if (symbol === this.compSymbol) {
      const maxScoreIndex = scores.reduce((maxIndex, currentScore, currentIndex, scoresArray) => {
        return currentScore > scoresArray[maxIndex] ? currentIndex : maxIndex;
      }, 0);
      return { choice: moves[maxScoreIndex], score: scores[maxScoreIndex] };
    } else {
      const minScoreIndex = scores.reduce((minIndex, currentScore, currentIndex, scoresArray) => {
        return currentScore < scoresArray[minIndex] ? currentIndex : minIndex;
      }, 0);
      return { choice: moves[minScoreIndex], score: scores[minScoreIndex] };
    }
  }

  getBestMove(game) {
    const result = this.minimax(game, this.compSymbol);
    return result.choice;
  }
}

export class Game {
  constructor(fields, compSymbol, playerSymbol) {
    this.fields = fields.map(row => [...row]);
    this.compSymbol = compSymbol;
    this.playerSymbol = playerSymbol;
  }

  checkWinForSymbol(symbol) {
    const checkLine = line => line.every(cell => cell === symbol);

    for (let row of this.fields) {
      if (checkLine(row)) {
        return true;
      }
    }

    for (let col = 0; col < this.fields.length; col++) {
      let column = this.fields.map(row => row[col]);
      if (checkLine(column)) {
        return true;
      }
    }

    let mainDiagonal = this.fields.map((row, i) => row[i]);
    if (checkLine(mainDiagonal)) {
      return true;
    }

    let secondDiagonal = this.fields.map((row, i) => row[this.fields.length - 1 - i]);
    if (checkLine(secondDiagonal)) {
      return true;
    }

    return false;
  }

  // Checking if game over
  isGameOver() {
    return this.checkWinForSymbol(this.compSymbol) || this.checkWinForSymbol(this.playerSymbol) || this.getAvailableMoves().length === 0;
  }

  // Getting available moves
  getAvailableMoves() {
    let moves = [];
    for (let y = 0; y < this.fields.length; y++) {
      for (let x = 0; x < this.fields.length; x++) {
        if (!this.fields[y][x]) {
          moves.push({ x, y });
        }
      }
    }
    return moves;
  }

  // Getting new game state
  getNewState(move, symbol) {
    let newFields = this.fields.map(row => [...row]); // Creating a copy of each row
    newFields[move.y][move.x] = symbol;
    return new Game(newFields, this.compSymbol, this.playerSymbol);
  }
}
