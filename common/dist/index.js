export var team;
(function (team) {
    team[team["black"] = 0] = "black";
    team[team["white"] = 1] = "white";
})(team || (team = {}));
export var printType;
(function (printType) {
    printType[printType["types"] = 0] = "types";
    printType[printType["visibility"] = 1] = "visibility";
})(printType || (printType = {}));
export class Board {
    constructor() {
        this.board = [[], [], [], [], [], [], [], []];
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                this.board[y][x] = new Cell(x, y);
            }
        }
    }
    getCell(x, y) {
        return this.board[y][x];
    }
    getEntity(x, y) {
        return this.board[y][x].entity;
    }
    getClone() {
        const clone = new Board();
        clone.board = [...this.board];
        return clone;
    }
    /**
     * helper function
     */
    printBoard(pt = printType.types) {
        var _a, _b, _c;
        let str = '';
        if (pt === printType.types) {
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    str += this.board[i][j].isEmpty() ? '0'.padStart(4, ' ').padEnd(4, ' ') : (_a = this.board[i][j].entity) === null || _a === void 0 ? void 0 : _a.type;
                    str += ', ';
                }
                str += '\n';
            }
        }
        else if (pt === printType.visibility) {
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    str += this.board[i][j].isEmpty()
                        ? '0'.padStart(4, ' ').padEnd(4, ' ')
                        : (_c = (_b = this.board[i][j].entity) === null || _b === void 0 ? void 0 : _b.isVisible) === null || _c === void 0 ? void 0 : _c.toString();
                    str += ', ';
                }
                str += '\n';
            }
        }
        console.log(str);
    }
}
export class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.entity = null;
    }
    isEmpty() {
        return this.entity === null;
    }
}
export var color;
(function (color) {
    color[color["noColor"] = 0] = "noColor";
    color[color["red"] = 1] = "red";
    color[color["redlight"] = 2] = "redlight";
    color[color["green"] = 3] = "green";
    color[color["blue"] = 4] = "blue";
    color[color["yellow"] = 5] = "yellow";
    color[color["grey"] = 6] = "grey";
})(color || (color = {}));
export class MarkerBoard {
    constructor() {
        this.markerBoard = [[], [], [], [], [], [], [], []];
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                this.markerBoard[y][x] = 0;
            }
        }
    }
    setHighlight(x, y, highlightColor = color.green) {
        this.markerBoard[y][x] = highlightColor;
    }
    isHighlighted(x, y) {
        return this.markerBoard[y][x] !== color.noColor;
    }
    returnHighlightType(x, y) {
        return this.markerBoard[y][x];
    }
    /**
     * Returns true if the board has at least 1 highlight
     */
    hasAnyHighlight() {
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
    constructor() {
        this.isVisible = false;
    }
    isInsideBorders(x, y) {
        return x >= 0 && x <= 7 && y >= 0 && y <= 7;
    }
}
export class Pawn extends Entity {
    constructor(team) {
        super();
        this.type = 'pawn';
        this.team = team;
    }
    getPossibleMoves(x, y, board) {
        var _a, _b;
        const markerBoard = new MarkerBoard();
        if (this.team === team.black &&
            this.isInsideBorders(x, y + 1) &&
            (board.getCell(x, y + 1).isEmpty() || ((_a = board.getEntity(x, y + 1)) === null || _a === void 0 ? void 0 : _a.team) !== this.team)) {
            markerBoard.setHighlight(x, y + 1);
        }
        else if (this.isInsideBorders(x, y - 1) &&
            (board.getCell(x, y - 1).isEmpty() || ((_b = board.getEntity(x, y - 1)) === null || _b === void 0 ? void 0 : _b.team) !== this.team)) {
            markerBoard.setHighlight(x, y - 1);
        }
        return markerBoard;
    }
    effectOnEntity(enemyEntity, board) {
        enemyEntity.isVisible = true;
        // if(enemyEntity.type === "bomb") {
        //handle bomb
        // }
    }
}
export class King extends Entity {
    constructor(team) {
        super();
        this.type = 'king';
        this.team = team;
    }
    getPossibleMoves(x, y, board) {
        return new MarkerBoard();
    }
    effectOnEntity(entity, board) {
        entity.isVisible = true;
        // if(enemyEntity.type === "bomb") {
        //handle bomb
        // }
    }
}
export class Team {
    constructor(team, firstColumn, secondColumn) {
        this.team = team;
        this.piecesSetup = { king: 2, pawn: 0 };
        this.isReady = false;
        this.FIRST_COLUMN = firstColumn;
        this.SECOND_COLUMN = secondColumn;
    }
}
export class Position {
}
export class GameManager {
    constructor(init = true) {
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
    get teamTurn() {
        return this._teamTurn;
    }
    set teamTurn(value) {
        console.log(value.team);
        this._teamTurn = value;
    }
    setup_setPiece(entity, pos) {
        if (this.setupFinished)
            throw new Error('Setup is finished');
        const { x, y } = pos;
        const t = entity.team;
        let currentTeam;
        let allowedYColumn;
        if (t === team.black) {
            currentTeam = this.blackTeam;
            allowedYColumn = this.blackTeam.FIRST_COLUMN;
        }
        else {
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
    setPiece(entity, pos) {
        if (this.setupFinished)
            throw new Error('Setup is finished');
        const { x, y } = pos;
        const t = entity.team;
        let currentTeam;
        if (t === team.black) {
            currentTeam = this.blackTeam;
        }
        else {
            currentTeam = this.whiteTeam;
        }
        if (this.board.getCell(x, y).entity !== null) {
            throw new Error('Cannot place pieces where a piece is already placed');
        }
        this.board.getCell(x, y).entity = entity;
    }
    move(entity, newPos, currPos) {
        var _a, _b;
        if (entity.team !== this.teamTurn.team) {
            throw new Error('Its not the turn of team: ' + entity.team.toString());
        }
        if (!this.setupFinished) {
            throw new Error('Setup is not finished');
        }
        const isMovePossible = (_a = entity
            .getPossibleMoves) === null || _a === void 0 ? void 0 : _a.call(entity, currPos.x, currPos.y, this.board).isHighlighted(newPos.x, newPos.y);
        if (!isMovePossible) {
            console.error('new Pos: ', newPos);
            console.error('curr Pos: ', currPos);
            console.error('entity Pos: ', entity);
            throw new Error('Move is not possible');
        }
        if (this.board.getCell(newPos.x, newPos.y).entity !== null) {
            (_b = entity.effectOnEntity) === null || _b === void 0 ? void 0 : _b.call(entity, this.board.getCell(newPos.x, newPos.y).entity, this.board);
        }
        else {
            this.board.getCell(newPos.x, newPos.y).entity = entity;
            this.board.getCell(currPos.x, currPos.y).entity = null;
        }
        this.passTurn();
    }
    setReady(t) {
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
    getOppositeTeam(oppositeTeam) {
        return oppositeTeam.team === team.white ? this.blackTeam : this.whiteTeam;
    }
    getClone() {
        const clone = new GameManager(false);
        clone.blackTeam = this.blackTeam;
        clone.whiteTeam = this.whiteTeam;
        clone.board = this.board;
        clone.setupFinished = this.setupFinished;
        clone.turnCount = this.turnCount;
        clone.teamTurn = this.teamTurn;
        return clone;
    }
    passTurn() {
        this.teamTurn = this.getOppositeTeam(this.teamTurn);
        this.turnCount++;
    }
}
