export declare enum team {
    black = 0,
    white = 1
}
export declare type entityType = 'pawn' | 'king';
export declare enum printType {
    types = 0,
    visibility = 1
}
export declare class Board {
    board: Cell[][];
    constructor();
    getCell(x: number, y: number): Cell;
    getEntity(x: number, y: number): Entity;
    getClone(): Board;
    /**
     * helper function
     */
    printBoard(pt?: printType): void;
}
export declare class Cell {
    x: number;
    y: number;
    entity: Entity | null;
    constructor(x: number, y: number);
    isEmpty(): boolean;
}
export declare enum color {
    noColor = 0,
    red = 1,
    redlight = 2,
    green = 3,
    blue = 4,
    yellow = 5,
    grey = 6
}
export declare class MarkerBoard {
    markerBoard: color[][];
    constructor();
    setHighlight(x: number, y: number, highlightColor?: color): void;
    isHighlighted(x: number, y: number): boolean;
    returnHighlightType(x: number, y: number): color;
    /**
     * Returns true if the board has at least 1 highlight
     */
    hasAnyHighlight(): boolean;
}
export declare class Entity {
    type: entityType;
    team: team;
    image: {
        black: string;
        white: string;
    };
    isVisible: boolean;
    constructor();
    getPossibleMoves?(x: number, y: number, board: Board): MarkerBoard;
    protected isInsideBorders(x: number, y: number): boolean;
    effectOnEntity?(enemyEntity: Entity, board: Board): void;
    static getImage?(entity: Entity): any;
}
export declare class Pawn extends Entity {
    constructor(team: team);
    getPossibleMoves(x: number, y: number, board: Board): MarkerBoard;
    effectOnEntity(enemyEntity: Entity, board: Board): void;
}
export declare class King extends Entity {
    constructor(team: team);
    getPossibleMoves(x: number, y: number, board: Board): MarkerBoard;
    effectOnEntity(entity: Entity, board: Board): void;
}
export declare type IPiecesSetup = {
    [key in entityType]: number;
};
export declare class Team {
    team: team;
    piecesSetup: IPiecesSetup;
    isReady: boolean;
    readonly FIRST_COLUMN: any;
    readonly SECOND_COLUMN: any;
    constructor(team: team, firstColumn: number, secondColumn: number);
}
export declare class Position {
    x: number;
    y: number;
}
export declare class GameManager {
    board: Board;
    setupFinished: boolean;
    blackTeam: Team;
    whiteTeam: Team;
    private _teamTurn;
    get teamTurn(): Team;
    set teamTurn(value: Team);
    turnCount: number;
    setup_setPiece(entity: Entity, pos: Position): void;
    setPiece(entity: Entity, pos: Position): void;
    move(entity: Entity, newPos: Position, currPos: Position): void;
    setReady(t: Team): void;
    getOppositeTeam(oppositeTeam: Team): Team;
    getClone(): GameManager;
    passTurn(): void;
    constructor(init?: boolean);
}
