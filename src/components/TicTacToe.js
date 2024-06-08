/* eslint-disable no-useless-constructor */
import React, { Component } from "react";
import "./styles.css";
import { AI, Game } from "./AI";

class TicTacToe extends Component {
  state = {
    fields: [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ],
    compMove: false, //if current move belongs to comp
    compSymbol: "0",
    playerSymbol: "x",
    winner: null, //detects who is the winner (comp, player or draft)
    winLine: null, //sets winning line coordinates to highlight them
    isGameProcess: false, //shows if game is in process
    playerFirstMove: true, //mark for player first move
    ai: null,
    isSmartCPU: true,
  };

  componentDidUpdate = (prevProps, prevState) => {
    const winLineArr = this.checkWin();
    if (winLineArr) {
      //detecting if winner is either comp or player
      if (!this.state.winner) {
        this.setState({ winner: this.getWinner(), winLine: this.getWinLine(winLineArr), isGameProcess: false });
      }
    } else {
      // detecting draft
      let flatFields = this.state.fields.flat();
      let newStatus = !flatFields.includes(null); //if all fields are engaged
      if (newStatus && !this.state.winner) {
        //and there is no winner
        this.setState({ winner: "draft", isGameProcess: false });
      }
    }
  };
  //gets winning line to highlight
  getWinLine = obj => {
    const winLine = [];
    if ("row" in obj) {
      const y = obj.row;
      for (let i = 0; i < this.state.fields.length; i++) {
        winLine.push({ y, x: i });
      }
    } else if ("col" in obj) {
      const x = obj.col;
      for (let i = 0; i < this.state.fields.length; i++) {
        winLine.push({ x, y: i });
      }
    } else {
      if (obj.diagonal === 0) {
        for (let i = 0; i < this.state.fields.length; i++) {
          winLine.push({ x: i, y: i });
        }
      } else {
        for (let i = 0, j = obj.diagonal; i < this.state.fields.length; i++) {
          winLine.push({ y: i, x: j });
          j--;
        }
      }
    }
    return winLine;
  };
  //detects the winner
  getWinner = () => {
    return this.state.compMove ? "player" : "comp";
  };
  //checks the winning line
  checkWin = () => {
    return this.checkColumns() || this.checkRows() || this.checkMainDiagonal() || this.checkSecondDiagonal();
  };

  checkRows = () => {
    for (let i = 0; i < this.state.fields.length; i++) {
      let row = this.state.fields[i];
      if (row.every(s => s === "0") || row.every(s => s === "x")) {
        return { row: i };
      }
    }
    return false;
  };

  checkColumns = () => {
    for (let i = 0; i < this.state.fields.length; i++) {
      const column = this.state.fields.map(row => row[i]);
      if (column.every(s => s === "0") || column.every(s => s === "x")) {
        return { col: i };
      }
    }
    return false;
  };

  checkMainDiagonal = () => {
    const diagonal = [];
    for (let i = 0; i < this.state.fields.length; i++) {
      diagonal.push(this.state.fields[i][i]);
    }
    if (diagonal.every(s => s === "0") || diagonal.every(s => s === "x")) {
      return { diagonal: 0 };
    }
    return false;
  };

  checkSecondDiagonal = () => {
    const diagonal = [];
    for (let i = 0; i < this.state.fields.length; i++) {
      const j = this.state.fields.length - 1 - i;
      diagonal.push(this.state.fields[j][i]);
    }
    if (diagonal.every(s => s === "0") || diagonal.every(s => s === "x")) {
      return { diagonal: 2 };
    }
    return false;
  };
  //detects if the sell should be matched by color because it is in the winning line
  getIsMatched = obj => {
    const { x, y } = obj;
    if (this.state.winLine) {
      return this.state.winLine.find(w => w.x === x && w.y === y);
    }
    return false;
  };
  //comp logic
  computerMove = () => {
    //comp logic - simple random move
    if (this.state.compMove && this.state.isGameProcess && !this.state.winner && !this.state.isSmartCPU) {
      let x;
      let y;
      do {
        y = Math.floor(Math.random() * this.state.fields.length);
        x = Math.floor(Math.random() * this.state.fields.length);
      } while (this.state.fields[y][x]);
      const newFields = [...this.state.fields];
      newFields[y][x] = this.state.compSymbol;
      this.setState({ fields: newFields, compMove: !this.state.compMove });
    }
    //AI feature
    if (this.state.compMove && this.state.isGameProcess && !this.state.winner && this.state.isSmartCPU) {
      const game = new Game(this.state.fields, this.state.compSymbol, this.state.playerSymbol);
      const bestMove = this.state.ai.getBestMove(game);
      const newFields = [...this.state.fields];
      newFields[bestMove.y][bestMove.x] = this.state.compSymbol;
      this.setState({ fields: newFields, compMove: false });
    }
  };
  //player move
  move = coords => {
    if (this.state.compMove || !this.state.isGameProcess) {
      return;
    }
    const { x, y } = coords;
    if (!this.state.fields[y][x]) {
      const newFields = [...this.state.fields];
      newFields[y][x] = this.state.playerSymbol;
      this.setState({ fields: newFields, compMove: !this.state.compMove });
      if (this.state.isGameProcess) {
        setTimeout(this.computerMove, 1000);
      }
    }
  };
  //starts new game
  startGame = () => {
    const compSymbol = this.state.compSymbol;
    const playerSymbol = this.state.playerSymbol;

    const ai = new AI(compSymbol, playerSymbol);
    this.setState(
      {
        fields: [
          [null, null, null],
          [null, null, null],
          [null, null, null],
        ],
        winner: null,
        winLine: null,
        isGameProcess: true,
        compMove: !this.state.playerFirstMove,
        compSymbol: compSymbol,
        playerSymbol: playerSymbol,
        ai: ai,
      },
      () => {
        if (this.state.compMove) {
          this.computerMove();
        }
      }
    );
  };
  //changes player symbol
  changePlayerSymbol = symbol => {
    const cSymbol = symbol === "0" ? "x" : "0";
    if (!this.state.isGameProcess) {
      this.setState({ playerSymbol: symbol, compSymbol: cSymbol });
    }
  };
  //changes first move
  setFirstMove = value => {
    this.setState({ playerFirstMove: value, compMove: !value });
  };
  //toggles smart cpu game
  setSmartCPU = () => {
    this.setState({ isSmartCPU: !this.state.isSmartCPU });
  };

  render() {
    return (
      <div className="TicTacToe">
        <Controls
          changePlayerSymbol={this.changePlayerSymbol}
          startGame={this.startGame}
          setFirstMove={this.setFirstMove}
          setSmartCPU={this.setSmartCPU}
          playerFirstMove={this.state.playerFirstMove}
          isSmartCPU={this.state.isSmartCPU}
        />
        <table>
          <tbody>
            {this.state.fields.map((f, i) => {
              return (
                <tr key={Date.now() + i}>
                  {f.map((c, j) => (
                    <Cell
                      symbol={c}
                      coords={{ y: i, x: j }}
                      matched={this.getIsMatched({ y: i, x: j })}
                      handlerClickCell={this.move}
                      compMove={this.state.compMove}
                      key={Date.now() + j}
                    />
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {this.state.winner ? (this.state.winner === "draft" ? `Draft` : `Winner: ${this.state.winner}`) : ""}
      </div>
    );
  }
}

class Controls extends Component {
  // constructor(props) {
  //   super(props);
  // }

  handlerChangeSymbol = e => {
    const { value } = e.target;
    this.props.changePlayerSymbol(value);
  };

  handlerChangeFirstMove = e => {
    this.props.setFirstMove(e.target.checked);
  };

  handlerChangeSmartCpu = e => {
    this.props.setSmartCPU(e.target.checked);
  };

  render() {
    return (
      <header className="gameControls">
        <h1 className="logo">TicTacToe</h1>
        <nav>
          <div className="settings">
            <p>
              <input type="radio" name="player symbol" id="x" value={"x"} defaultChecked onChange={this.handlerChangeSymbol} />
              <label htmlFor="x">symbol 'X'</label>
            </p>
            <p>
              <input type="radio" name="player symbol" id="0" value={"0"} onChange={this.handlerChangeSymbol} />
              <label htmlFor="0">symbol 'O'</label>
            </p>
          </div>
          <div className="settings">
            <p>
              <input type="checkbox" name="playerFirst" id="playerFirst" checked={this.props.playerFirstMove} onChange={this.handlerChangeFirstMove} />
              <label htmlFor="0">player first</label>
            </p>
            <p>
              <input type="checkbox" name="ai" id="ai" checked={this.props.isSmartCPU} onChange={this.handlerChangeSmartCpu} />
              <label htmlFor="0">smart CPU</label>
            </p>
          </div>
          <button
            onClick={() => {
              this.props.startGame();
            }}
          >
            Start New Game
          </button>
        </nav>
      </header>
    );
  }
}

class Cell extends Component {
  // constructor(props) {
  //   super(props);
  // }
  handlerClick = () => {
    if (!this.props.compMove) {
      this.props.handlerClickCell(this.props.coords);
    }
  };
  render() {
    return (
      <td onClick={this.handlerClick} className={this.props.matched ? "matched" : ""}>
        {this.props.symbol ? this.props.symbol === "x" ? <i className="fa-solid fa-xmark"></i> : <i className="fa-solid fa-o"></i> : ""}
      </td>
    );
  }
}

export default TicTacToe;
