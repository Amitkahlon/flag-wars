export declare enum team {
    black = 0,
    white = 1
}
export declare type entityType = 'test1';
export declare class Entity {
    type: entityType;
    team: team;
    protected getPossibleMoves?(x: number, y: number): any[][];
    protected isOutsideBorders(x: number, y: number): boolean;
    protected effectOnEnemyEntity?(x: number, y: number): any[][];
}
export declare class TestCharacter1 extends Entity {
    constructor(team: team);
    protected getPossibleMoves(x: number, y: number): number[][];
}
export declare const initCleanBoard: () => number[][];
