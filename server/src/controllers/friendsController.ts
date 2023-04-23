import * as core from 'express-serve-static-core';
import { app, auth, firebaseDb, firestoreDb } from '..';
import { authMiddleware } from '../middlewares/auth';
import admin from 'firebase-admin';
import { getDatabase } from 'firebase-admin/database';
import { FieldValue } from 'firebase-admin/firestore';

import { DbService } from '../services/dbService';

export const friendsController = () => {
  app.get('/friends', authMiddleware, async (req: any, res) => {
    const uid = req.user.uid;

    const dbService = new DbService();

    const currentUserRef = dbService.getUserDoc(uid);
    const currentUser = (await currentUserRef.get()) as any;

    const friendList = currentUser.data().friends;
    const fullFriendList = await dbService.getUsers(friendList);

    res.send(fullFriendList);
  });

  app.post('/friends', authMiddleware, async (req: any, res) => {
    const uid = req.user.uid;
    const friendId = req.body?.newFriendId;

    if (!friendId) {
      return res.status(400).send({ message: 'No friend id was sent' });
    }

    const dbService = new DbService();

    const currentUserRef = dbService.getUserDoc(uid);
    try {
      const currentUser = await currentUserRef.get();

      if ((currentUser as any).data().friends.includes(friendId)) {
        return res.status(409).send({ message: 'User is already on your friends list' });
      }

      const friend = await dbService.getUser(friendId);
      if (!friend?.exists) {
        return res.status(400).send({ message: 'User with the given Id was not found' });
      }

      currentUserRef.update({ friends: FieldValue.arrayUnion(friendId) });

      const newFriendListIds = [...(currentUser as any).data().friends, friendId];
      const fullFriendList = await dbService.getUsers(newFriendListIds);

      res.send(fullFriendList);
      res.status(200);
    } catch (error) {
      console.log(error);
    }
  });

  app.post('/friends/gameinvite/:uId', authMiddleware, async (req: any, res) => {
    const friendUid = req.params?.uId;
    const currentUid = req.user.uid;

    if (friendUid == null) {
      return res.status(400).send({ message: 'uId is missing' });
    }

    const dbService = new DbService();

    const current = await dbService.getUser(req.user.uid);

    if (!(current?.data() as any).friends.includes(friendUid)) {
      return res.status(400).send({ message: 'User is not your friend' });
    }

    const invitedFriend = await dbService.getUser(friendUid);

    if (!(invitedFriend?.data() as any).friends.includes(currentUid)) {
      return res.status(400).send({ message: 'The invited user did not accept your friend request' });
    }

    const currentGameInvitesSentRef = firebaseDb.ref(`game_invites/${currentUid}/sent/${friendUid}`);
    currentGameInvitesSentRef.set({
      status: 'pending',
      gameId: null,
    });

    const friendGameInvitesReceived = firebaseDb.ref(`game_invites/${friendUid}/received/${currentUid}`);
    friendGameInvitesReceived.set({
      status: 'pending',
      gameId: null,
    });

    res.send(200)
  });
};
