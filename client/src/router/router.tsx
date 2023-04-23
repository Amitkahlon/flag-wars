import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../components/pages/loginPage';
import { HomePage } from '../components/pages/homePage';
import { RegisterPage } from '../components/pages/registerPage';
import { auth } from '../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { FriendsPage } from '../components/pages/friendsPage';
import GamePage from '../components/pages/gamePage';

export const AppRouter = () => {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);

  onAuthStateChanged(auth, (user) => {
    setCurrentUser(user);
  });

  return (
    <BrowserRouter>
      <Routes>
        {!currentUser ? (
          <>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </>
        ) : (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/game/:id" element={<GamePage />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
};
