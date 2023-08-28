import { Request, Response, NextFunction } from 'express'

export const validateElevatorFields = (req: Request, res: Response, next: NextFunction) => {
    const requiredFields = ['buildingId', 'name']

    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({ message: `${field} is a required field` })
        }
    }

    next()
}
