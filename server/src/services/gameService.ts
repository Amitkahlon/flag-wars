import { firebaseDb } from '..';
import { IGameManagerData } from 'common';

export const updateGameData = async (gameId: string, gameData: IGameManagerData) => {
  await firebaseDb.ref(`games`).child(gameId).update({
    game_data: gameData,
  });
};

