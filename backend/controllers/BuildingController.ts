import { Request, Response } from 'express'
import Bull, { Queue } from "bull"
import Building from '../models/Building'
import Elevator from '../models/Elevator'
import ElevatorLog from '../models/ElevatorLog'
import PendingElevatorCall from '../models/PendingElevatorCall'

export const createBuilding = async (req: Request, res: Response) => {
    const { name, number_of_floors, active, elevators } = req.body

    await Building.sync({ alter: true })
    await Elevator.sync({ alter: true })
    await ElevatorLog.sync({ alter: true })
    await PendingElevatorCall.sync({ alter: true })

    try {
        const building = await Building.create({
            name,
            number_of_floors,
            active
        })

        if (elevators && elevators.length > 0) {
            const createdElevators = await Elevator.bulkCreate(
                elevators.map((elevatorName: string) => ({
                    name: elevatorName,
                    currentState: 'idle',
                    BuildingId: building.id,
                }))
            )

            // Initialize elevator logs for each created elevator
            for (const elevator of createdElevators) {
                await ElevatorLog.create({
                    ElevatorId: elevator.id,
                    currentFloor: 0, // Initial floor
                    state: 'idle', // Initial state
                })
            }
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
            BuildingId: buildingId
        })

        await ElevatorLog.create({
            ElevatorId: elevator.id,
            currentFloor: 0,
            state: 'idle'
        })

        res.status(201).json({ message: 'Elevator created successfully' })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

const elevatorQueue = new Bull('elevatorCalls')

export const callElevator = async (req: Request, res: Response) => {
    const { elevatorId, targetFloor } = req.body

    try {
        // Find the elevator by ID
        const elevator = await Elevator.findByPk(elevatorId)

        if (!elevator) {
            return res.status(404).json({ message: 'Elevator not found' })
        }

        // Find latest Elevator log
        const latestElevatorLog = await ElevatorLog.findOne({
            where: {
                ElevatorId: elevatorId,
            },
            order: [['createdAt', 'DESC']],
        })

        if (latestElevatorLog) {
            const elevatorStatus = latestElevatorLog.state

            if (elevatorStatus !== "idle") {
                // If elevator is not idle, queue the call
                await PendingElevatorCall.create({
                    ElevatorId: elevatorId,
                    targetFloor,
                    executed: false
                })

            } else {
                // Elevator is idle, process the call
                // Log the elevator call with the current elevator state awaiting processing
                const newLogEntry = await ElevatorLog.create({
                    currentFloor: latestElevatorLog.currentFloor,
                    targetFloor: targetFloor,
                    state: latestElevatorLog.state,
                    direction: targetFloor > latestElevatorLog.currentFloor ? "up" : "down",
                    action: "call",
                    details: `Called to floor ${targetFloor}`,
                    ElevatorId: elevatorId,
                })
                // Process elevator call asynchronously in queues
                await elevatorQueue.add(newLogEntry)
            }

            // Return a success response
            res.status(200).json({ message: 'Elevator call processed successfully' })
        } else {
            // Handle case where there are no elevator logs
            // This might be the initial state of the elevator
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
    }
}


