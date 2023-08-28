import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

declare global {
    namespace Express {
        interface Request {
            user?: any
        }
    }
}

const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' })
    }

    jwt.verify(token, 'secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' })
        }

        req.user = user // Attach the user object to the request for further use
        next()
    })
}

export default authenticateJWT
