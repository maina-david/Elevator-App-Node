import bodyParser from 'body-parser'
import authRoutes from './routes/auth'
import buildingRoutes from './routes/building'
import express, { Application } from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app: Application = express()
const port = 3000

// Middleware
app.use(bodyParser.json())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Create HTTP server
const httpServer = createServer(app)

// Initialize Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:8080', // Replace with the allowed origin
    },
})

// WebSocket Connection Handling
io.on('connection', (socket) => {
    console.log('WebSocket client connected')

    socket.on('disconnect', () => {
        console.log('WebSocket client disconnected')
    })
})

// Routes
app.use('/auth', authRoutes)
app.use('/building', buildingRoutes)

// Start the HTTP server
httpServer.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})
