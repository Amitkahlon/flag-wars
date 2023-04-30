import { FieldValue } from 'firebase-admin/firestore';
import { DbService } from './dbService';

export const addFriend = async (friendId: string, currentUserId: string) => {
  const dbService = new DbService();

  const currentUserRef = dbService.getUserDoc(currentUserId);

  currentUserRef.update({ friends: FieldValue.arrayUnion(friendId) });

  return getFriends(currentUserId);
};

export const getFriends = async (userId: string) => {
  const dbService = new DbService();

  const currentUserRef = dbService.getUserDoc(userId);
  const currentUser = await currentUserRef.get();

  const fullFriendList = await dbService.getUsers((currentUser as any).data().friends);
  return fullFriendList;
};
