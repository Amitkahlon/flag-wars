import React from 'react'
import '../../css/LoginPage.css';
import {
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
} from 'firebase/auth'
import { Link } from 'react-router-dom'
import authService from '../../services/authService'
// @ts-ignore
import board from '../../icons/board.png';

export const LoginPage = () => {
    return (
        <div className={"background"}>
            <img className={"background"} src={board} alt={"background"}/>
            <div className={"cover"}>
            <h1 className="title">Login</h1>
            <div className={'alt-login'}>
                <button
                    className={'google'}
                    onClick={() => {
                        const provider = new GoogleAuthProvider()
                        authService.signInWithProvider(provider)
                    }}
                >
                </button>
                <button
                    className={'facebook'}
                    onClick={() => {
                        const provider = new FacebookAuthProvider()
                        authService.signInWithProvider(provider)
                    }}
                >
                </button>
            </div>
            <p className="registerMessage">
                Did you not create account?<span> </span>
                <Link to="/register">Register</Link>
                <span> </span> now!
            </p>
        </div>
        </div>
    )
}
