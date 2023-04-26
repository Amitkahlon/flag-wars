import classNames from 'classnames';
import '../../css/game.css';
import { useState } from 'react';
const pawnImage = require('../../assets/pawn.png');
const kingImage = require('../../assets/king.png');

export enum team {
  black,
  white,
}

export type entityType = 'pawn' | 'king';

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
}

class Cell {
  public entity: Entity | null;

  constructor(private x: number, private y: number) {
    this.entity = null;
  }
}

class MarkerBoard {
  public markerBoard: number[][];

  constructor() {
    this.markerBoard = [[], [], [], [], [], [], [], []];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        this.markerBoard[y][x] = 0;
      }
    }
  }
}

export class Entity {
  public type: entityType;
  public team: team;
  public image: string;
  public isVisible: boolean;

  public getPossibleMoves?(x: number, y: number, board: Board): MarkerBoard;

  protected isOutsideBorders(x: number, y: number) {
    return x >= 0 && x <= 7 && y >= 0 && y <= 7;
  }

  public effectOnEntity?(enemyEntity: Entity, board: Board): void;
}

export class Pawn extends Entity {
  constructor(team: team) {
    super();
    this.type = 'pawn';
    this.team = team;
    this.image = pawnImage;
  }

  public override getPossibleMoves(x: number, y: number, board: Board): MarkerBoard {
    const markerBoard = new MarkerBoard();
    if (this.team === team.black && !this.isOutsideBorders(x, y + 1)) {
      markerBoard.markerBoard[y + 1][x] = 1;
    } else if (!this.isOutsideBorders(x, y - 1)) {
      markerBoard.markerBoard[y - 1][x] = 1;
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
    this.image = kingImage;
  }

  public override getPossibleMoves(x: number, y: number, board: Board): MarkerBoard {
    const markerBoard = new MarkerBoard();
    if (this.team === team.black && !this.isOutsideBorders(x, y + 1)) {
      markerBoard.markerBoard[y + 1][x] = 1;
    } else if (!this.isOutsideBorders(x, y - 1)) {
      markerBoard.markerBoard[y - 1][x] = 1;
    }

    return markerBoard;
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

  constructor(public team: team) {
    this.piecesSetup = { king: 8, pawn: 0 };
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

  public setPiece(entity: Entity, pos: Position) {
    const { x, y } = pos;
    const t = entity.team;
    let currentTeam: Team;
    let allowedYColumn: 7 | 0;
    if (t === team.black) {
      currentTeam = this.blackTeam;
      allowedYColumn = 7;
    } else {
      currentTeam = this.whiteTeam;
      allowedYColumn = 0;
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

  public move(entity: Entity, newPos: Position, currPos: Position) {
    if(!this.setupFinished) {
      throw new Error("Setup is not finished")
    }
    
    const isMovePossible = entity.getPossibleMoves?.(currPos.x, currPos.y, this.board).markerBoard[newPos.y][newPos.x];
    if (!isMovePossible) {
      throw new Error('Move is not possible');
    }

    if (this.board.getCell(newPos.x, newPos.y).entity !== null) {
      entity.effectOnEntity?.(entity, this.board);
      return;
    }

    this.board.getCell(newPos.x, newPos.y).entity = entity;
  }

  constructor() {
    this.board = new Board();
    this.setupFinished = false;
    this.blackTeam = new Team(team.black);
    this.whiteTeam = new Team(team.white);

    for (let i = 0; i < 8; i++) {
      this.board.getCell(i, 1).entity = new Pawn(team.white);
    }

    for (let i = 0; i < 8; i++) {
      this.board.getCell(i, 6).entity = new Pawn(team.black);
    }
  }
}

const OfflineGamePage = () => {
  const [gameManager, setGameManager] = useState(new GameManager());

  return (
    <div>
      <h1>Offline Game</h1>
      {!gameManager.setupFinished ? <p>Place your pieces</p> : <p>Game started</p>}

      <div className="board">
        {gameManager.board.board?.map((row, x) => (
          <div key={x} className="row">
            {row.map((cell, y) => (
              <button key={y} className={classNames('cell')}>
                {cell?.entity ? <img src={cell.entity.image} width={60} height={30} /> : null}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OfflineGamePage;
