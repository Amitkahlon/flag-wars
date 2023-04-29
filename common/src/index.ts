export enum team {
  black,
  white,
}

export type entityType = 'pawn' | 'king';

export enum printType {
  types,
  visibility,
}
export class Board {
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

export class Cell {
  public entity: Entity | null;

  constructor(public x: number, public y: number) {
    this.entity = null;
  }

  public isEmpty() {
    return this.entity === null;
  }
}

export enum color {
  noColor = 0,
  red = 1,
  redlight = 2,
  green = 3,
  blue = 4,
  yellow = 5,
  grey = 6,
}

export class MarkerBoard {
  public markerBoard: color[][];

  constructor() {
    this.markerBoard = [[], [], [], [], [], [], [], []];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        this.markerBoard[y][x] = 0;
      }
    }
  }

  public setHighlight(x: number, y: number, highlightColor: color = color.green) {
    this.markerBoard[y][x] = highlightColor;
  }

  public isHighlighted(x: number, y: number) {
    return this.markerBoard[y][x] !== color.noColor;
  }

  public returnHighlightType(x: number, y: number) {
    return this.markerBoard[y][x];
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

  public static getImage?(entity: Entity);
}

export class Pawn extends Entity {
  constructor(team: team) {
    super();
    this.type = 'pawn';
    this.team = team;
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

export type IPiecesSetup = {
  [key in entityType]: number;
};

export class Team {
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

export class Position {
  x: number;
  y: number;
}

export class GameManager {
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
