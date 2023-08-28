import { Request, Response } from 'express'
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
                    state: latestElevatorLog.state,
                    direction: targetFloor > latestElevatorLog.currentFloor ? "up" : "down",
                    action: "call",
                    details: `Called to floor ${targetFloor}`,
                    ElevatorId: elevatorId,
                })
                // Process elevator call
                await moveElevatorToFloor(newLogEntry, targetFloor)
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

const moveElevatorToFloor = async (logEntry: ElevatorLog, targetFloor: number) => {
    try {
        const elevator = await Elevator.findByPk(logEntry.ElevatorId)

        if (!elevator) {
            console.error('Elevator not found')
            return
        }

        const currentFloor = logEntry.currentFloor
        const direction = currentFloor < targetFloor ? 'up' : 'down'
        const movementStep = currentFloor < targetFloor ? 1 : -1

        // Simulate elevator movement
        await simulateMovement(elevator.id, currentFloor, targetFloor, direction, movementStep)

        // Elevator reached the target floor, log and perform actions
        await simulateAction(elevator.id, targetFloor, 'Stopped', 'stop', `Elevator reached target floor ${targetFloor}`)

        // Simulate door actions
        const doorActions = [
            ['doorsOpening', 'open_doors', 'Doors opening'],
            ['doorsOpen', 'doors_opened', 'Doors opened'],
            ['doorsClosing', 'close_doors', 'Doors closing'],
            ['doorsClosed', 'doors_closed', 'Doors closed']
        ]

        for (const [state, action, details] of doorActions) {
            await simulateAction(elevator.id, targetFloor, state, action, details, 2000)
        }

        // Elevator returns to idle state
        await simulateAction(elevator.id, targetFloor, 'idle', 'idle', 'Elevator returned to idle state')
    } catch (error) {
        console.error('Error moving elevator:', error)
    }
}

const simulateMovement = async (elevatorId: number, currentFloor: number, targetFloor: number, direction: string, movementStep: number) => {
    while (currentFloor !== targetFloor) {
        await sleep(5000) // Simulate 5 seconds of movement time

        await ElevatorLog.create({
            ElevatorId: elevatorId,
            currentFloor,
            state: direction === 'up' ? 'MovingUp' : 'MovingDown',
            direction,
            action: 'move',
            details: `Moving ${direction} to floor ${currentFloor + movementStep}`,
        })

        currentFloor += movementStep
    }
}

const simulateAction = async (elevatorId: number, currentFloor: number, state: string, action: string, details: string, delay = 0) => {
    if (delay > 0) {
        await sleep(delay)
    }

    await ElevatorLog.create({
        ElevatorId: elevatorId,
        currentFloor,
        state,
        direction: null,
        action,
        details,
    })
}

// Simulate sleep using promises
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))


