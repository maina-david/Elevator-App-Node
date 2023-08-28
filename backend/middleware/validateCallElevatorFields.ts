import { Request, Response, NextFunction } from 'express'

export const validateCallElevatorFields = (req: Request, res: Response, next: NextFunction) => {
    const { elevatorId, targetFloor } = req.body

    if (!elevatorId || !targetFloor || typeof elevatorId !== 'number' || typeof targetFloor !== 'number') {
        return res.status(400).json({ message: 'Invalid or missing elevatorId or targetFloor' })
    }

    next()
}
