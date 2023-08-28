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
            currentFloor: 0,
            direction: null,
            BuildingId: buildingId
        })

        res.status(201).json({ message: 'Elevator created successfully' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const callElevator = async (req: Request, res: Response) => {
    const { elevatorId, targetFloor } = req.body

    try {
        // Find the elevator by ID
        const elevator = await Elevator.findByPk(elevatorId)

        if (!elevator) {
            return res.status(404).json({ message: 'Elevator not found' })
        }

        // Update elevator state, direction, and action in ElevatorLog
        const logEntry = await ElevatorLog.create({
            currentFloor: elevator.currentFloor, // Current floor of the elevator
            state: elevator.currentState,
            direction: elevator.direction,
            action: 'Called',
            details: `Called to target floor ${targetFloor}`,
        })

        // Update elevator properties and save
        elevator.currentState = 'Moving'
        elevator.direction = targetFloor > elevator.currentFloor ? 'Up' : 'Down'
        elevator.currentFloor = targetFloor
        await elevator.save()

        // Log the elevator movement
        await ElevatorLog.create({
            currentFloor: elevator.currentFloor,
            state: elevator.currentState,
            direction: elevator.direction,
            action: 'Moving',
            details: `Moving ${elevator.direction} to target floor ${targetFloor}`,
        })

        res.status(200).json({ message: 'Elevator called and moving' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
}
