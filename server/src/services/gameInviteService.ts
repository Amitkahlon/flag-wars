import { FieldValue } from 'firebase-admin/firestore';
import { firebaseDb } from '..';
import { GameManagerFactory } from 'common';

export const rejectGameInvite = async (challenger: string, challenged: string) => {
  const currentGameInvitesSentRef = firebaseDb.ref(`game_invites/${challenged}/received`);

  await currentGameInvitesSentRef.update({
    [challenger]: FieldValue.delete(),
  });

  const friendGameInvitesReceived = firebaseDb.ref(`game_invites/${challenger}/sent`);

  await friendGameInvitesReceived.update({
    [challenged]: FieldValue.delete(),
  });
};

export const acceptGameInvite = async (currentUid: string, friendUid: string) => {
  const newGameData = GameManagerFactory.getData(GameManagerFactory.initGameManager());

  const newGameRef = firebaseDb.ref(`games`).push({
    player1: currentUid,
    player2: friendUid,
    white_player: 2,
    game_data: newGameData,
  });

  const gameId = newGameRef.key;

  const currentGameInvitesSentRef = firebaseDb.ref(`game_invites/${currentUid}/received/${friendUid}`);
  await currentGameInvitesSentRef.set({
    status: 'ongoing',
    gameId: gameId,
  });

  const friendGameInvitesReceived = firebaseDb.ref(`game_invites/${friendUid}/sent/${currentUid}`);
  await friendGameInvitesReceived.set({
    status: 'ongoing',
    gameId: gameId,
  });
};

export const inviteToGame = async (currentUid: string, friendUid: string) => {
  const currentGameInvitesSentRef = firebaseDb.ref(`${getGameInviteRefPath(currentUid)}/sent/${friendUid}`);
  await currentGameInvitesSentRef.set({
    status: 'pending',
    gameId: null,
  });

  const friendGameInvitesReceived = firebaseDb.ref(`${getGameInviteRefPath(friendUid)}/received/${currentUid}`);
  await friendGameInvitesReceived.set({
    status: 'pending',
    gameId: null,
  });
};

export const getGameInviteRefPath = (userId: string) => {
  return `game_invites/${userId}`;
};
