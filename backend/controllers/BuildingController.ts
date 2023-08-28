import { Request, Response } from 'express'
import Building from '../models/Building'
import Elevator from '../models/Elevator'
import ElevatorLog from '../models/ElevatorLog'

export const createBuilding = async (req: Request, res: Response) => {
    const { name, number_of_floors, active, elevators } = req.body

    await Building.sync()
    await Elevator.sync()
    await ElevatorLog.sync()

    try {
        const building = await Building.create({
            name,
            number_of_floors,
            active
        })

        if (elevators && elevators.length > 0) {
            await Elevator.bulkCreate(
                elevators.map((elevatorName: string) => ({
                    name: elevatorName,
                    currentState: 'idle',
                    BuildingId: building.id,
                }))
            )
        }

        res.status(201).json({ message: 'Building and elevators created successfully' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const createElevatorForBuilding = async (req: Request, res: Response) => {
    const { buildingId, name } = req.body

    try {
        const existingBuilding = await Building.findByPk(buildingId)

        if (!existingBuilding) {
            return res.status(400).json({ message: 'Building does not exist' })
        }

        const elevator = await Elevator.create({
            name,
            currentState: 'idle',
            BuildingId: buildingId
        })

        res.status(201).json({ message: 'Elevator created successfully' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
}
