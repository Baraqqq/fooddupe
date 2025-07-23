import { Server as SocketServer } from 'socket.io';

export const setupSocketHandlers = (io: SocketServer) => {
  console.log('📡 Setting up Socket.IO handlers...');
  
  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);
    
    // Join tenant room for real-time updates
    socket.on('join-tenant', (tenantId: string) => {
      socket.join(`tenant-${tenantId}`);
      console.log(`🏢 Socket ${socket.id} joined tenant room: ${tenantId}`);
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });
  
  console.log('✅ Socket.IO handlers setup complete');
};