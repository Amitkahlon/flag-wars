import React from 'react'
import '../../css/RegisterPage.css';
import {
    FacebookAuthProvider,
    GoogleAuthProvider,
} from 'firebase/auth'
import authService from '../../services/authService'
// @ts-ignore
import board from '../../icons/board.png';

export const RegisterPage = () => {
    return (
      <div className={"background"}>
        <img className={"background"} src={board} alt={"background"}/>
        <div className={"cover"}>
          <h1 className="title">Register</h1>
          <div className={'alt-register'}>
          <button
                className={'google'}
                onClick={() => {
                    authService.registerWithProvider(new GoogleAuthProvider())
                }}
            >
            </button>
            <button
                className={'facebook'}
                onClick={() => {
                    authService.registerWithProvider(new FacebookAuthProvider())
                }}
            >
            </button>
        </div>
        </div>
        </div>
    )
}
