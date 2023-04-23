import React from 'react'
import {
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
} from 'firebase/auth'
import { Link } from 'react-router-dom'
import authService from '../../services/authService'

export const LoginPage = () => {
    return (
        <div>
            <h1>Login Page</h1>
            <p>Welcome to flag wars, please sign</p>
            <div className={'alt-login'}>
                <button
                    className={'google'}
                    onClick={() => {
                        const provider = new GoogleAuthProvider()
                        authService.signInWithProvider(provider)
                    }}
                >
                    Sign in with google
                </button>
                <button
                    className={'facebook'}
                    onClick={() => {
                        const provider = new FacebookAuthProvider()
                        authService.signInWithProvider(provider)
                    }}
                >
                    Sign in with Facebook
                </button>
            </div>
            <p>
                Did you not create account?<span> </span>
                <Link to="register">Register</Link>
                <span> </span> now!
            </p>
        </div>
    )
}
