import { Entity, Position } from 'common';
import { send } from './httpContext';

interface IPos {
  x: number;
  y: number;
}

export const setReady = async (gameId: string, setupEntities: { entity: Entity; pos: IPos }[]) => {
  await send({ method: 'POST', route: '/game/move', data: { type: 'set_ready', gameId, payload: setupEntities } });
};

export const move = async (gameId: string, from: IPos, to: IPos) => {
  await send({
    method: 'POST',
    route: '/game/move',
    data: { type: 'exec_move', gameId, payload: { move: { from, to } } },
  });
};
