import { Request, Response, NextFunction } from 'express'
import admin from 'firebase-admin'
import { DbService } from '../services/dbService'

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const token = authHeader.split(' ')[1]
        const decodedToken = await admin.auth().verifyIdToken(token)
        ;(req as any)['user'] = decodedToken // attach user object to request for use in downstream middleware

        const dbService = new DbService();
        dbService.ensureUserInDb(decodedToken.uid);

        next()
    } catch (error) {
        console.error('Error verifying token:', error)
        return res.status(401).json({ message: 'Unauthorized' })
    }
}
