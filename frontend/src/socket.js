import { io } from 'socket.io-client'

// Connect to the backend server
const socket = io(window.location.origin)

export default socket