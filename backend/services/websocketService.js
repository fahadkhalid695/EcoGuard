class WebSocketService {
  constructor(io) {
    this.io = io;
  }

  initialize() {
    console.log('✅ WebSocket service initialized');
    
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
}

module.exports = WebSocketService;