import { app } from '..';
import { authMiddleware } from '../middlewares/auth';
import { DbService } from '../services/dbService';
import { acceptGameInvite, inviteToGame, rejectGameInvite } from '../services/gameInviteService';
import { addFriend, getFriends } from '../services/friendsService';

export const friendsController = () => {
  app.get('/friends', authMiddleware, async (req: any, res) => {
    const uid = req.user.uid;

    const friends = await getFriends(uid);
    res.send(friends);
  });

  app.post('/friends', authMiddleware, async (req: any, res) => {
    const uid = req.user.uid;
    const friendId = req.body?.newFriendId;

    if (uid === friendId) {
      return res.status(400).send({ message: 'Cannot add yourself as a friend' });
    }

    if (!friendId) {
      return res.status(400).send({ message: 'No friend id was sent' });
    }

    const dbService = new DbService();

    const currentUserRef = dbService.getUserDoc(uid);
    const currentUser = await currentUserRef.get();

    if ((currentUser as any).data().friends.includes(friendId)) {
      return res.status(409).send({ message: 'User is already on your friends list' });
    }

    const friend = await dbService.getUser(friendId);
    if (!friend?.exists) {
      return res.status(400).send({ message: 'User with the given Id was not found' });
    }

    try {
      const friendList = await addFriend(friendId, uid);
      res.status(200).send(friendList);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  });

  app.post('/friends/gameinvite', authMiddleware, async (req: any, res) => {
    const friendUid = req.body.friendId;
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

    try {
      inviteToGame(currentUid, friendUid);
      res.send(200);
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  });

  app.post('/friends/gameinvite/answer', authMiddleware, async (req: any, res) => {
    const answerVal = req.body?.answer as boolean;
    const friendUid = req.body?.friendUid as string;
    const currentUid = req.user.uid as string;

    //TODO:
    // handle body validation
    // handle invite validation
    // handle pending invite

    if (answerVal) {
      acceptGameInvite(currentUid, friendUid);
    } else {
      try {
        rejectGameInvite(friendUid, currentUid);
      } catch (error) {
        console.error(error);
        res.status(500).send(error);
      }
    }
  });
};
