"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCleanBoard = exports.TestCharacter1 = exports.Entity = exports.team = void 0;
var team;
(function (team) {
    team[team["black"] = 0] = "black";
    team[team["white"] = 1] = "white";
})(team = exports.team || (exports.team = {}));
class Entity {
    isOutsideBorders(x, y) {
        return x >= 0 && x <= 7 && y >= 0 && y <= 7;
    }
}
exports.Entity = Entity;
class TestCharacter1 extends Entity {
    constructor(team) {
        super();
        this.type = 'test1';
        this.team = team;
    }
    getPossibleMoves(x, y) {
        const board = (0, exports.initCleanBoard)();
        if (this.team === team.black && !this.isOutsideBorders(x, y + 1)) {
            board[y + 1][x] = 1;
        }
        else if (!this.isOutsideBorders(x, y - 1)) {
            board[y - 1][x] = 1;
        }
        return board;
    }
}
exports.TestCharacter1 = TestCharacter1;
const initCleanBoard = () => {
    return [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ];
    // return [
    //   [tcw(), tcw(), tcw(), tcw(), tcw(), tcw(), tcw(), tcw()],
    //   [0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0],
    //   [tcb(), tcb(), tcb(), tcb(), tcb(), tcb(), tcb(), tcb()],
    // ];
};
exports.initCleanBoard = initCleanBoard;
const tcw = () => {
    return new TestCharacter1(team.white);
};
const tcb = () => {
    return new TestCharacter1(team.black);
};
