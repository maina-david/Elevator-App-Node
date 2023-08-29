import Bull from "bull"
import ElevatorLog from "../models/ElevatorLog"
import Elevator from "../models/Elevator"

const elevatorQueue = new Bull('elevatorCalls')

elevatorQueue.process(async (job) => {
    let newLogEntry = job.data
    return moveElevatorToFloor(newLogEntry)
})

const moveElevatorToFloor = async (logEntry: ElevatorLog) => {
    try {
        const elevator = await Elevator.findByPk(logEntry.ElevatorId)

        if (!elevator) {
            console.error('Elevator not found')
            return
        }

        let currentFloor = logEntry.currentFloor
        const targetFloor = logEntry.targetFloor as number

        const direction = currentFloor < targetFloor ? 'up' : 'down'
        const movementStep = currentFloor < targetFloor ? 1 : -1

        if (currentFloor !== targetFloor) {
            // Simulate elevator movement
            await simulateMovement(elevator.id, currentFloor, targetFloor, direction, movementStep)

            // Elevator reached the target floor, log and perform actions
            await simulateAction(elevator.id, targetFloor, 'Stopped', 'stop', `Elevator reached target floor ${targetFloor}`)
        }

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

// Helper function to simulate movement
const simulateMovement = async (elevatorId: number, currentFloor: number, targetFloor: number, direction: string, movementStep: number) => {
    while (currentFloor !== targetFloor) {
        await sleep(5000) // Simulate 5 seconds of movement time

        await ElevatorLog.create({
            ElevatorId: elevatorId,
            currentFloor,
            targetFloor,
            state: direction === 'up' ? 'MovingUp' : 'MovingDown',
            direction,
            action: 'move',
            details: `Moving ${direction} to floor ${currentFloor + movementStep}`,
        })

        currentFloor += movementStep
    }
}

// Helper function to simulate actions
const simulateAction = async (elevatorId: number, currentFloor: number, state: string, action: string, details: string, delay = 0) => {
    if (delay > 0) {
        await sleep(delay)
    }

    await ElevatorLog.create({
        ElevatorId: elevatorId,
        currentFloor,
        targetFloor: currentFloor,
        state,
        direction: null,
        action,
        details,
    })
}

// Helper function to simulate sleep using promises
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))