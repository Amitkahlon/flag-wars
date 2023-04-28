import classNames from 'classnames';
import '../../css/game.css';
import React, { useReducer, useState } from 'react';
const whitePawnImage = require('../../assets/whitePawn.png');
const blackPawnImage = require('../../assets/blackPawn.png');
const whiteKingImage = require('../../assets/whiteKing.png');
const blackKingImage = require('../../assets/blackKing.png');

export enum team {
  black,
  white,
}

export type entityType = 'pawn' | 'king';

export enum printType {
  types,
  visibility,
}
class Board {
  public board: Cell[][];

  constructor() {
    this.board = [[], [], [], [], [], [], [], []];

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        this.board[y][x] = new Cell(x, y);
      }
    }
  }

  public getCell(x: number, y: number) {
    return this.board[y][x];
  }

  public getEntity(x: number, y: number) {
    return this.board[y][x].entity;
  }

  public getClone() {
    const clone = new Board();
    clone.board = [...this.board];

    return clone;
  }

  /**
   * helper function
   */
  public printBoard(pt: printType = printType.types) {
    let str = '';

    if (pt === printType.types) {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          str += this.board[i][j].isEmpty() ? '0'.padStart(4, ' ').padEnd(4, ' ') : this.board[i][j].entity?.type;
          str += ', ';
        }
        str += '\n';
      }
    } else if (pt === printType.visibility) {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          str += this.board[i][j].isEmpty()
            ? '0'.padStart(4, ' ').padEnd(4, ' ')
            : this.board[i][j].entity?.isVisible?.toString();
          str += ', ';
        }
        str += '\n';
      }
    }

    console.log(str);
  }
}

class Cell {
  public entity: Entity | null;

  constructor(public x: number, public y: number) {
    this.entity = null;
  }

  public isEmpty() {
    return this.entity === null;
  }
}

class MarkerBoard {
  public markerBoard: number[][];
  public readonly HIGHLIGHT_INDICATOR = 1;

  constructor() {
    this.markerBoard = [[], [], [], [], [], [], [], []];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        this.markerBoard[y][x] = 0;
      }
    }
  }

  public setHighlight(x: number, y: number) {
    this.markerBoard[y][x] = this.HIGHLIGHT_INDICATOR;
  }

  public isHighlighted(x: number, y: number) {
    return this.markerBoard[y][x] === this.HIGHLIGHT_INDICATOR;
  }

  /**
   * Returns true if the board has at least 1 highlight
   */
  public hasAnyHighlight() {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if (this.isHighlighted(x, y)) {
          return true;
        }
      }
    }

    return false;
  }
}

export class Entity {
  public type: entityType;
  public team: team;
  public image: {
    black: string;
    white: string;
  };
  public isVisible: boolean;

  constructor() {
    this.isVisible = false;
  }

  public getPossibleMoves?(x: number, y: number, board: Board): MarkerBoard;

  protected isInsideBorders(x: number, y: number) {
    return x >= 0 && x <= 7 && y >= 0 && y <= 7;
  }

  public effectOnEntity?(enemyEntity: Entity, board: Board): void;
}

export class Pawn extends Entity {
  constructor(team: team) {
    super();
    this.type = 'pawn';
    this.team = team;
    this.image = {
      black: blackPawnImage,
      white: whitePawnImage,
    };
  }

  public override getPossibleMoves(x: number, y: number, board: Board): MarkerBoard {
    const markerBoard = new MarkerBoard();
    if (
      this.team === team.black &&
      this.isInsideBorders(x, y + 1) &&
      (board.getCell(x, y + 1).isEmpty() || board.getEntity(x, y + 1)?.team !== this.team)
    ) {
      markerBoard.setHighlight(x, y + 1);
    } else if (
      this.isInsideBorders(x, y - 1) &&
      (board.getCell(x, y - 1).isEmpty() || board.getEntity(x, y - 1)?.team !== this.team)
    ) {
      markerBoard.setHighlight(x, y - 1);
    }

    return markerBoard;
  }

  public override effectOnEntity(enemyEntity: Entity, board: Board) {
    enemyEntity.isVisible = true;
    // if(enemyEntity.type === "bomb") {
    //handle bomb
    // }
  }
}

export class King extends Entity {
  constructor(team: team) {
    super();
    this.type = 'king';
    this.team = team;
    this.image = {
      black: blackKingImage,
      white: whiteKingImage,
    };
  }

  public override getPossibleMoves(x: number, y: number, board: Board): MarkerBoard {
    return new MarkerBoard();
  }

  public override effectOnEntity(entity: Entity, board: Board) {
    entity.isVisible = true;
    // if(enemyEntity.type === "bomb") {
    //handle bomb
    // }
  }
}

type IPiecesSetup = {
  [key in entityType]: number;
};

class Team {
  piecesSetup: IPiecesSetup;
  isReady: boolean;
  readonly FIRST_COLUMN;
  readonly SECOND_COLUMN;

  constructor(public team: team, firstColumn: number, secondColumn: number) {
    this.piecesSetup = { king: 2, pawn: 0 };
    this.isReady = false;
    this.FIRST_COLUMN = firstColumn;
    this.SECOND_COLUMN = secondColumn;
  }
}

class Position {
  x: number;
  y: number;
}

class GameManager {
  public board: Board;
  public setupFinished: boolean;
  public blackTeam: Team;
  public whiteTeam: Team;
  private _teamTurn: Team;
  public get teamTurn(): Team {
    return this._teamTurn;
  }
  public set teamTurn(value: Team) {
    console.log(value.team);
    this._teamTurn = value;
  }
  public turnCount: number;

  public setup_setPiece(entity: Entity, pos: Position) {
    if (this.setupFinished) throw new Error('Setup is finished');

    const { x, y } = pos;
    const t = entity.team;
    let currentTeam: Team;
    let allowedYColumn: number;
    if (t === team.black) {
      currentTeam = this.blackTeam;
      allowedYColumn = this.blackTeam.FIRST_COLUMN;
    } else {
      currentTeam = this.whiteTeam;
      allowedYColumn = this.whiteTeam.FIRST_COLUMN;
    }

    const leftSetupCount = currentTeam.piecesSetup[entity.type];
    if (leftSetupCount <= 0) {
      throw new Error('Reached max pieces that are allowed.');
    }

    if (y !== allowedYColumn) {
      throw new Error('Position is not allowed for setup.');
    }

    if (this.board.getCell(x, y).entity !== null) {
      throw new Error('Cannot place pieces where a piece is already placed');
    }

    this.board.getCell(x, y).entity = entity;
    currentTeam.piecesSetup[entity.type] -= 1;
  }

  public setPiece(entity: Entity, pos: Position) {
    if (this.setupFinished) throw new Error('Setup is finished');
    const { x, y } = pos;
    const t = entity.team;
    let currentTeam: Team;
    if (t === team.black) {
      currentTeam = this.blackTeam;
    } else {
      currentTeam = this.whiteTeam;
    }

    if (this.board.getCell(x, y).entity !== null) {
      throw new Error('Cannot place pieces where a piece is already placed');
    }

    this.board.getCell(x, y).entity = entity;
  }

  public move(entity: Entity, newPos: Position, currPos: Position) {
    if (entity.team !== this.teamTurn.team) {
      throw new Error('Its not the turn of team: ' + entity.team.toString());
    }

    if (!this.setupFinished) {
      throw new Error('Setup is not finished');
    }

    const isMovePossible = entity
      .getPossibleMoves?.(currPos.x, currPos.y, this.board)
      .isHighlighted(newPos.x, newPos.y);

    if (!isMovePossible) {
      console.error('new Pos: ', newPos);
      console.error('curr Pos: ', currPos);
      console.error('entity Pos: ', entity);

      throw new Error('Move is not possible');
    }
    if (this.board.getCell(newPos.x, newPos.y).entity !== null) {
      entity.effectOnEntity?.(this.board.getCell(newPos.x, newPos.y).entity as Entity, this.board);
    } else {
      this.board.getCell(newPos.x, newPos.y).entity = entity;
      this.board.getCell(currPos.x, currPos.y).entity = null;
    }

    this.passTurn();
  }

  public setReady(t: Team) {
    t.isReady = true;

    if (this.blackTeam.isReady && this.whiteTeam.isReady) {
      for (let i = 0; i < 8; i++) {
        if (this.board.getCell(i, this.blackTeam.FIRST_COLUMN).entity == null) {
          this.setPiece(new Pawn(team.black), { x: i, y: this.blackTeam.FIRST_COLUMN });
        }
      }

      for (let i = 0; i < 8; i++) {
        if (this.board.getCell(i, this.whiteTeam.FIRST_COLUMN).entity == null) {
          this.setPiece(new Pawn(team.white), { x: i, y: this.whiteTeam.FIRST_COLUMN });
        }
      }

      this.setupFinished = true;
    }
  }

  public getOppositeTeam(oppositeTeam: Team) {
    return oppositeTeam.team === team.white ? this.blackTeam : this.whiteTeam;
  }

  public getClone() {
    const clone = new GameManager(false);

    clone.blackTeam = this.blackTeam;
    clone.whiteTeam = this.whiteTeam;
    clone.board = this.board;
    clone.setupFinished = this.setupFinished;
    clone.turnCount = this.turnCount;
    clone.teamTurn = this.teamTurn;
    return clone;
  }

  public passTurn() {
    this.teamTurn = this.getOppositeTeam(this.teamTurn);
    this.turnCount++;
  }

  constructor(init: boolean = true) {
    if (init) {
      this.board = new Board();
      this.setupFinished = false;
      this.blackTeam = new Team(team.black, 0, 1);
      this.whiteTeam = new Team(team.white, 7, 6);
      this.turnCount = 0;
      this.teamTurn = this.whiteTeam;

      for (let i = 0; i < 8; i++) {
        this.board.getCell(i, 6).entity = new Pawn(team.white);
      }

      for (let i = 0; i < 8; i++) {
        this.board.getCell(i, 1).entity = new Pawn(team.black);
      }
    }
  }
}

function reducer(state: GameManager, action: { type: string; payload?: any }) {
  switch (action.type) {
    case 'boardUpdate':
      return;

    default:
      throw new Error('No action found');
  }
}

interface selectedEntity {
  x: number;
  y: number;
  entity: Entity;
}

const OfflineGamePage = () => {
  const [gameManager, setGameManager] = useState(new GameManager());
  const [currentTeam, setCurrentTeam] = useState(gameManager.whiteTeam);
  const [selectedEntity, setSelectedEntity] = useState<selectedEntity | null>(null);
  const [highlightBoard, setHighlightBoard] = useState<MarkerBoard>(new MarkerBoard());

  const renderPieceImage = (entity: Entity) => {
    if (entity == null) return null;
    const image = entity.team === team.black ? entity.image.black : entity.image.white;

    if (entity.team !== currentTeam.team && !entity.isVisible) {
      return <p>?</p>;
    }

    return <img width={60} height={30} src={image} />;
  };

  const handleCellClick = (cell: Cell) => {
    // handle setup clicks
    if (!gameManager.setupFinished) {
      if (selectedEntity && !cell.entity) {
        try {
          gameManager.setup_setPiece(selectedEntity.entity, { x: cell.x, y: cell.y });
          cell.entity = selectedEntity.entity;
          setSelectedEntity(null);
          setHighlightBoard(new MarkerBoard());
        } catch (error) {
          console.error(error);
        }
      }
    }
    // handle game clicks
    else if (gameManager.setupFinished) {
      if (cell.entity?.team === currentTeam.team) {
        setSelectedEntity({ entity: cell.entity, x: cell.x, y: cell.y });
        const highlightBoard = cell.entity.getPossibleMoves?.(cell.x, cell.y, gameManager.board) as MarkerBoard;
        highlightBoard.setHighlight(cell.x, cell.y);

        setHighlightBoard(highlightBoard);
      } else if (selectedEntity) {
        try {
          gameManager.move(
            selectedEntity.entity,
            { x: cell.x, y: cell.y },
            { x: selectedEntity.x, y: selectedEntity.y },
          );

          setSelectedEntity(null);
          const gmClone = gameManager.getClone();
          setGameManager(gmClone);
          setHighlightBoard(new MarkerBoard());

          doRandomMove(gameManager.teamTurn);
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  const renderGameSetup = () => {
    if (gameManager.setupFinished) {
      return null;
    }

    const currentTeamPiecesSetup = currentTeam.piecesSetup;
    const pawnImage = currentTeam.team === team.white ? whitePawnImage : blackPawnImage;
    const kingImage = currentTeam.team === team.white ? whiteKingImage : blackKingImage;

    let isFinished: boolean = true;
    for (const k in currentTeamPiecesSetup) {
      let key = k as entityType;
      if (currentTeamPiecesSetup[key] !== 0) {
        isFinished = false;
        break;
      }
    }

    return (
      <div>
        <div>
          <img
            src={kingImage}
            width={100}
            height={100}
            onClick={() => {
              if (currentTeamPiecesSetup.king === 0) {
                return;
                //show error
              }
              setSelectedEntity({ entity: new King(currentTeam.team), x: -1, y: -1 });
              const highlightBoard = new MarkerBoard();
              for (let i = 0; i < 8; i++) {
                if (!gameManager.board.getCell(i, 7).entity) {
                  highlightBoard.setHighlight(i, 7);
                }
              }

              setHighlightBoard(highlightBoard);
            }}
          />
          <p>Count: {currentTeamPiecesSetup.king}</p>
        </div>
        {isFinished ? (
          <div>
            <button onClick={handleReadyClick}>Ready</button>
          </div>
        ) : null}
      </div>
    );
  };

  const handleReadyClick = () => {
    gameManager.setReady(currentTeam);
    const oppositeTeam = gameManager.getOppositeTeam(currentTeam);

    let num1, num2;
    do {
      num1 = Math.floor(Math.random() * 8);
      num2 = Math.floor(Math.random() * 8);
    } while (num1 === num2);

    gameManager.setup_setPiece(new King(oppositeTeam.team), { x: num1, y: oppositeTeam.FIRST_COLUMN });
    gameManager.setup_setPiece(new King(oppositeTeam.team), { x: num2, y: oppositeTeam.FIRST_COLUMN });
    gameManager.setReady(oppositeTeam);

    setGameManager(gameManager.getClone()); //hack to update the ui..
    setSelectedEntity(null);
  };

  /**
   * MEGA CODE
   * @param t
   */
  const doRandomMove = (t: Team) => {
    const currentTeamOnBoardEntities: { entity: Entity; pos: { x: number; y: number } }[] = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const currEntity = gameManager.board.getEntity(j, i);
        if (
          currEntity &&
          currEntity.team === t.team &&
          currEntity.getPossibleMoves?.(j, i, gameManager.board).hasAnyHighlight()
        ) {
          currentTeamOnBoardEntities.push({ entity: currEntity, pos: { x: j, y: i } });
        }
      }
    }
    const randomEntity = currentTeamOnBoardEntities[Math.floor(Math.random() * currentTeamOnBoardEntities.length)];
    const possibleMovesBoard = randomEntity.entity.getPossibleMoves?.(
      randomEntity.pos.x,
      randomEntity.pos.y,
      gameManager.board,
    );

    const possibleMovesArr: { x: number; y: number }[] = [];

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (possibleMovesBoard?.isHighlighted(j, i)) {
          possibleMovesArr.push({ x: j, y: i });
        }
      }
    }

    const randomMove = possibleMovesArr[Math.floor(Math.random() * possibleMovesArr.length)];

    gameManager.move(randomEntity.entity, randomMove, randomEntity.pos);

    // gameManager.board.printBoard();
  };

  return (
    <div>
      <h1>Offline Game</h1>
      {!gameManager.setupFinished ? <p>Place your pieces</p> : <p>Game started</p>}

      <div className="board">
        {gameManager.board.board?.map((row: Cell[], y: number) => (
          <div key={y} className="row">
            {row.map((cell, x) => (
              <button
                key={x}
                className={classNames('cell', { selected: highlightBoard.isHighlighted(x, y) })}
                onClick={() => handleCellClick(cell)}
              >
                {renderPieceImage(cell?.entity as Entity)}
              </button>
            ))}
          </div>
        ))}
      </div>

      {renderGameSetup()}
    </div>
  );
};

export default OfflineGamePage;
