import React, { useEffect, useState } from 'react'
import authService from '../../services/authService'
import { useNavigate } from 'react-router-dom'



export const HomePage = () => {
    const navigate = useNavigate()

    return (
        <>
            <h1>Home</h1>
            <button
                onClick={() => {
                    authService.signOut()
                }}
            >
                Sign out
            </button>

            <button
                onClick={() => {
                    navigate('/friends')
                }}
            >
                Friends
            </button>
        </>
    )
}
