import React, { useEffect, useState } from 'react';
import { auth, realTimeDb } from '../../firebase/firebase';
import axios from 'axios';
import { send } from '../../services/httpContext';
import { ref, onValue } from 'firebase/database';

// received: {
//   fromEmail: string;
//   status: string;
//   fromName: string;
// }[];
// sent: {
//   toEmail: string;
//   status: string;
//   toName: string;
// }[];

export const FriendsPage = () => {
  const [users, setUsersList] = useState<{ email: string; uid: string }[]>([]);
  const [friendListLoaded, setFriendListLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [gameInvites, setGameInvites] = useState<{
    received: any;
    sent: any;
  }>({
    received: {},
    sent: {},
  });

  const listenToGameInvites = () => {
    const starCountRef = ref(realTimeDb, 'game_invites/' + auth.currentUser?.uid);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
      const sentInvites = data?.sent;
      const receivedInvites = data?.received;
      setGameInvites({
        received: receivedInvites,
        sent: sentInvites,
      });
    });
  };

  const generateTotalGameInvites = () => {
    const totalGameInvites = [];
    debugger;

    for (const key in gameInvites.received) {
      console.log(`${key}: ${gameInvites.received[key]}`);
      totalGameInvites.push({
        status: gameInvites.received[key].status,
        // email: gameInvites.received[i].fromEmail,
        id: key,
        sentByYou: false,
      });
    }

    for (const key in gameInvites.sent) {
      console.log(`${key}: ${gameInvites.sent[key]}`);
      totalGameInvites.push({
        status: gameInvites.sent[key].status,
        // email: gameInvites.received[i].fromEmail,
        id: key,
        sentByYou: false,
      });
    }

    return totalGameInvites;
  };

  const renderGameInvites = () => {
    return generateTotalGameInvites().map((game) => {
      return (
        <li>
          {game.sentByYou ? <p>You sent a game invite to: </p> : <p>You received game invite from:</p>}
          <p>Uid: {game.id}</p>
          <p>Status: {game.status}</p>
        </li>
      );
    });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await send({ method: 'GET', route: '/friends' });
        setUsersList(res.data);
        console.log(res.data);
      } catch (error: any) {
        console.error(error);
        setError(error.response.data.message);
      }

      setFriendListLoaded(true);
    };

    fetchUsers().catch(console.error);
    listenToGameInvites();
  }, []);

  const addNewUserHandler = async (newFriendId: string) => {
    try {
      const res = await send({ method: 'POST', route: '/friends', data: { newFriendId: newFriendId } });
      setUsersList(res.data);
    } catch (error: any) {
      console.error(error);

      if (error.response.status === 400) {
        console.error(error);
        setError(error.response.data.message);
      }

      if (error.response.status === 409) {
        console.error(error);
        setError(error.response.data.message);
      }
    }
  };

  const inviteToGameHandler = async (invitedFriendId: string) => {
    try {
      const res = await send({ method: 'POST', route: '/friends/gameinvite/' + invitedFriendId });
    } catch (error) {
      console.error(error);
    }
  };

  const gameInvitesPostRender = renderGameInvites();

  return (
    <>
      <h1>Friends List</h1>

      {friendListLoaded ? (
        <ul>
          {users.map((user, i) => {
            return (
              <li key={i}>
                {user.email}{' '}
                <button
                  onClick={() => {
                    inviteToGameHandler(user.uid);
                  }}
                >
                  Invite to game
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>Loading..</p>
      )}

      <label htmlFor="newFriendIdInput">Add new friend</label>
      <input id="newFriendIdInput" type="text" />
      <button
        onClick={() => {
          addNewUserHandler((document.querySelector('#newFriendIdInput') as any)?.value);
        }}
      >
        Add
      </button>

      <p>
        Your Uid: <b>{auth.currentUser?.uid}</b>
      </p>

      <div>
        <h2>Game Invites</h2>
        {!gameInvitesPostRender.length ? (
          <p>You do not have game invites, send your friends a invite or wait to get invited :)</p>
        ) : (
          <ul>{gameInvitesPostRender}</ul>
        )}
      </div>

      {error ? <p>Error: {error}</p> : null}
    </>
  );
};
