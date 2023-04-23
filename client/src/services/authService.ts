import { AuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../firebase/firebase'

const registerWithProvider = async (provider: AuthProvider) => {
    try {
        const userCredentials = await signInWithPopup(auth, provider)
        console.log('Register Successfully')
        console.log(userCredentials)
    } catch (error) {
        console.log('Register Failed')
        console.warn(error)
    }
}

const signInWithProvider = async (provider: any) => {
    try {
        const userCredentials = await signInWithPopup(auth, provider)
        console.log(userCredentials)
    } catch (error) {
        console.warn(error)
    }
}

const signOut = async () => {
    await auth.signOut()
}

export default { registerWithProvider, signInWithProvider, signOut }
