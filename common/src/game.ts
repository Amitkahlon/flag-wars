export enum team {
  black,
  white,
}

export type entityType = 'test1';

export class Entity {
  public type: entityType;
  public team: team;

  protected getPossibleMoves?(x: number, y: number): any[][];

  protected isOutsideBorders(x: number, y: number) {
    return x >= 0 && x <= 7 && y >= 0 && y <= 7;
  }

  protected effectOnEnemyEntity?(x: number, y: number): any[][];
}

export class TestCharacter1 extends Entity {
  constructor(team: team) {
    super();
    this.type = 'test1';
    this.team = team;
  }

  protected override getPossibleMoves(x: number, y: number) {
    const board = initCleanBoard();
    if (this.team === team.black && !this.isOutsideBorders(x, y + 1)) {
      board[y + 1][x] = 1;
    } else if (!this.isOutsideBorders(x, y - 1)) {
      board[y - 1][x] = 1;
    }

    return board;
  }
}

export const initCleanBoard = () => {
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

const tcw = () => {
  return new TestCharacter1(team.white);
};
const tcb = () => {
  return new TestCharacter1(team.black);
};
