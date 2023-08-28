import bodyParser from 'body-parser'
import authRoutes from './routes/auth'
import buildingRoutes from './routes/building'

import express, { Application } from 'express'

const app: Application = express()

const port = 3000

app.use(bodyParser.json())

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/auth', authRoutes)
app.use('/building', buildingRoutes)

try {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`)
    })
} catch (error: unknown) {
    if (error instanceof Error) {
        console.error(error.message)
    } else {
        console.error('Unknown error occurred');
    }
}
