import React from 'react'
import {
    AuthProvider,
    FacebookAuthProvider,
    GoogleAuthProvider,
    signInWithPopup,
} from 'firebase/auth'
import { auth } from '../../firebase/firebase'
import localStorageService from '../../services/localStorageService'
import authService from '../../services/authService'

export const RegisterPage = () => {
    return (
        <div>
            <h1>Register</h1>
            <button
                className={'google'}
                onClick={() => {
                    authService.registerWithProvider(new GoogleAuthProvider())
                }}
            >
                Sign up using google
            </button>
            <button
                className={'facebook'}
                onClick={() => {
                    authService.registerWithProvider(new FacebookAuthProvider())
                }}
            >
                Sign up using Facebook
            </button>
        </div>
    )
}
