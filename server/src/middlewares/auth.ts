import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { DbService } from '../services/dbService';
import { DecodedIdToken } from 'firebase-admin/auth';
import * as core from 'express-serve-static-core';

export interface RequestWithUser<
  P = core.ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = core.Query,
  Locals extends Record<string, any> = Record<string, any>,
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
  user?: DecodedIdToken;
}

export const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // attach user object to request for use in downstream middleware

    const dbService = new DbService();
    dbService.ensureUserInDb(decodedToken.uid);

    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
