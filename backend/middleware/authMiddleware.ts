import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User'

declare global {
    namespace Express {
        interface Request {
            user?: any
        }
    }
}

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
        return res.status(401).json({ message: 'Authorization token missing' })
    }

    try {
        const decoded = jwt.verify(token, 'secret_key') as { userId: number }
        const user = await User.findByPk(decoded.userId)

        if (!user) {
            return res.status(401).json({ message: 'User not found' })
        }

        req.user = user
        next()
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' })
    }
}
