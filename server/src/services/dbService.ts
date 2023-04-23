import { Firestore } from '@google-cloud/firestore';
import { firestoreDb } from '..';
import admin from 'firebase-admin';
import { FieldPath } from 'firebase-admin/firestore';

interface User {
  name?: string;
  email?: string;
  friends?: string[];
}

interface UserWithId extends User {
  uid?: string;
}

export class DbService {
  private firestoreDb: Firestore;

  constructor() {
    this.firestoreDb = firestoreDb;
  }

  public getUsersCollection() {
    return this.firestoreDb.collection('users');
  }

  public getUserDoc(docKey: string) {
    return this.getUsersCollection().doc(docKey);
  }

  public async getUser(userKey: string) {
    try {
      return await this.getUserDoc(userKey).get();
    } catch (error) {
      console.warn(error);
    }
  }

  public async getAuthUsers() {
    const authUsers = await admin.auth().listUsers();

    return authUsers;
  }

  public async getAuthUser(uid: string) {
    const snapshot = await this.getAuthUsers();
    const user = snapshot.users.find((u) => u.uid === uid);
    return user;
  }

  public async setUser(uid: string, user: User) {
    try {
      return await this.getUsersCollection().doc(uid).set(user);
    } catch (error) {
      console.warn(error);
    }
  }

  public async ensureUserInDb(uid: string) {
    const user = await this.getUser(uid);

    if (!user?.exists) {
      const authUser = await this.getAuthUser(uid);
      const newFirestoreUser: User = { email: authUser?.email, friends: [], name: authUser?.displayName };

      await this.setUser(uid, newFirestoreUser);
    }
  }

  public async getUsers(usersIds: string[]) {
    if (!usersIds.length) return [];

    const usersSnapshot = await this.getUsersCollection().where(FieldPath.documentId(), 'in', usersIds).get();
    const users: UserWithId[] = [];
    usersSnapshot.forEach((u: any) => users.push({ email: u.data().email }));

    for (let i = 0; i < usersIds.length; i++) {
      users[i].uid = usersIds[i];
    }

    return users;
  }
}

// const a = {
//   game_invites: {
//     aaabbb: {
//       sent: {
//         toUid: "bbbccc", 
//         status: "rejected | pending | ongoing" | "finished",
//         gameId: null
//       },
//       received: {
//         fromUid: "",
//         status: "rejected | pending | ongoing" | "finished",
//         gameId: null
//       },
//     },
//   },
// };
