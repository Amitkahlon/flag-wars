import { app, auth, firebaseDb, firestoreDb } from '..';
import { authMiddleware } from '../middlewares/auth';
import admin from 'firebase-admin';
import { getDatabase } from 'firebase-admin/database';
import { FieldValue } from 'firebase-admin/firestore';
import { GameManagerFactory, team } from 'common';

import { DbService } from '../services/dbService';
import { rejectGameInvite } from '../services/gameInviteService';

export const gameController = () => {
  app.delete('/game', async (req: any, res) => {
    const gameId = req.body.gameId;
    const game = (await firebaseDb.ref(`games/${gameId}`).get()).val();
    const challenged = game.player1;
    const challenger = game.player2;

    firebaseDb.ref(`games`).update({
      [gameId]: FieldValue.delete(),
    });

    await rejectGameInvite(challenger, challenged);

    res.send(200);
  });
};
