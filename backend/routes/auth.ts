import express from 'express'
import { registerUser, loginUser } from '../controllers/AuthController'
import { validateFields } from '../middleware/validateFields'

const router = express.Router()

router.post('/register', validateFields(['name', 'email', 'password']), registerUser)
router.post('/login', validateFields(['email', 'password']), loginUser)

export default router;
