import express from 'express'
import { validateBuildingFields } from '../middleware/validateBuildingFields'
import { callElevator, createBuilding, createElevatorForBuilding } from '../controllers/BuildingController'
import { authenticateJWT } from '../middleware/authMiddleware'
import { validateElevatorFields } from '../middleware/validateElevatorFields'
import { validateCallElevatorFields } from '../middleware/validateCallElevatorFields'

const router = express.Router()

router.post('/create-building', authenticateJWT, validateBuildingFields, createBuilding)
router.post('/create-elevator', authenticateJWT, validateElevatorFields, createElevatorForBuilding)

router.post('/call-elevator', authenticateJWT, validateCallElevatorFields, callElevator)

export default router
