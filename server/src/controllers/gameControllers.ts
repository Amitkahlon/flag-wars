import { app, auth, firebaseDb, firestoreDb } from '..';
import { RequestWithUser, authMiddleware } from '../middlewares/auth';
import admin from 'firebase-admin';
import { getDatabase } from 'firebase-admin/database';
import { FieldValue } from 'firebase-admin/firestore';
import { Entity, GameManagerFactory, IGameDetails, Position, Team, team } from 'common';

import { DbService } from '../services/dbService';
import { rejectGameInvite } from '../services/gameInviteService';
import { Response } from 'express';
import { updateGameData } from '../services/gameService';

type moveType = 'set_ready' | 'exec_move';

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

  app.post(
    '/game/move',
    authMiddleware,
    async (
      req: RequestWithUser<
        never,
        never,
        {
          gameId: string;
          type: moveType;
          payload: {
            setupEntities?: {
              entity: Entity;
              pos: Position;
            }[];
            move?: {
              from: Position;
              to: Position;
            };
          };
        }
      >,
      res: Response,
    ) => {
      const gameId = req.body.gameId;
      const currId = req.user?.uid;
      const moveType = req.body.type;

      const game = (await firebaseDb.ref(`games/${gameId}`).get()).val() as IGameDetails;
      const gm = GameManagerFactory.restoreGame(game.game_data);
      let t: team;

      if (game.player1.id === currId) {
        t = game.player1.team;
      } else if (game.player2.id === currId) {
        t = game.player2.team;
      } else {
        //handle user is not part of the game error
        throw new Error('user is not part of the game error');
      }

      let currTeam: Team = t === team.black ? gm.blackTeam : gm.whiteTeam;

      switch (moveType) {
        case 'set_ready':
          //handle game is on setup mode.
          //handle validation that all pieces placed

          req.body.payload.setupEntities?.map(({ entity, pos }) => {
            gm.setPiece(entity, pos);
          });

          gm.setReady(currTeam);
          break;
        case 'exec_move':
          // handle current team turn
          if (!req.body.payload.move) {
            throw new Error('Payload is missing to exec the moves');
          }

          try {
            gm.move(req.body.payload.move.to, req.body.payload.move.from);
          } catch (error) {
            return res.send(error);
          }
          break;
      }

      const game_data = GameManagerFactory.getData(gm);
      updateGameData(gameId, game_data);

      res.send(200);
    },
  );
};
