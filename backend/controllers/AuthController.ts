import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User'

export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password } = req.body

    await User.sync()

    try {
        const existingUser = await User.findOne({ where: { email } })

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with that email' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        })

        res.status(201).json({ message: 'User registered successfully' })

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' })
    }
}

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ where: { email } })

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const passwordMatch = await bcrypt.compare(password, user.password)

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const token = jwt.sign({ userId: user.id }, 'secret_key', {
            expiresIn: '1h',
        })

        res.json({ token })

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' })
    }
}
