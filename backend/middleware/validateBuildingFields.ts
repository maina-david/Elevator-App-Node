import { Request, Response, NextFunction } from 'express'

export const validateBuildingFields = (req: Request, res: Response, next: NextFunction) => {
    const requiredFields = ['name', 'number_of_floors', 'elevators']

    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).json({ message: `${field} is a required field` })
        }
    }

    const { elevators } = req.body

    if (!Array.isArray(elevators)) {
        return res.status(400).json({ message: 'elevators must be an array' })
    }

    for (const elevator of elevators) {
        if (typeof elevator !== 'string') {
            return res.status(400).json({ message: 'Each elevator must be a string' })
        }
    }

    next()
}
