import { Server, Socket } from 'socket.io';
import { Message, Project } from '../models/Schemas';

export const handleSockets = (io: Server) => {
  // Namespace or root IO connection
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected to Socket.IO: ${socket.id}`);

    // Join user's individual room for private notifications/messages
    socket.on('join_user', (userId: string) => {
      socket.join(userId);
      console.log(`👤 User joined room: ${userId}`);
    });

    // Join specific chat room (group chat or project context)
    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log(`🚪 Socket ${socket.id} joined room: ${roomId}`);
    });

    // Handle incoming chat messages
    socket.on('send_message', async (data: {
      senderId: string;
      senderName: string;
      receiverId?: string;
      groupId?: string;
      encryptedContent: string;
      iv: string;
      isGroup: boolean;
      attachments?: any[];
    }) => {
      try {
        const { senderId, senderName, receiverId, groupId, encryptedContent, iv, isGroup, attachments } = data;

        const newMsg = await Message.create({
          senderId,
          senderName,
          receiverId,
          groupId,
          encryptedContent,
          iv,
          isGroup,
          attachments: attachments || [],
          readBy: [senderId]
        });

        const targetRoom = isGroup ? groupId : receiverId;
        if (targetRoom) {
          // Broadcast to target recipient room (if 1-1) or group room
          socket.to(targetRoom).emit('receive_message', newMsg);
        }

        // Echo back to sender so they get the DB ID confirmation
        socket.emit('message_sent', newMsg);
      } catch (error) {
        console.error('Socket send_message error:', error);
      }
    });

    // Typing Indicators
    socket.on('typing', (data: { roomId: string; userId: string; userName: string; isTyping: boolean }) => {
      socket.to(data.roomId).emit('typing_status', data);
    });

    // Read Receipts
    socket.on('read_message', async (data: { messageId: string; userId: string; roomId: string }) => {
      try {
        const updated = await Message.findByIdAndUpdate(
          data.messageId,
          { $push: { readBy: data.userId } },
          { new: true }
        );
        if (updated) {
          socket.to(data.roomId).emit('message_read', { messageId: data.messageId, userId: data.userId });
        }
      } catch (error) {
        console.error('Socket read_message error:', error);
      }
    });

    // Real-Time Collaborative Document Editing Sockets
    socket.on('doc_join', (projectId: string) => {
      socket.join(`doc-${projectId}`);
      console.log(`📝 User joined collaborative editor for project: ${projectId}`);
    });

    socket.on('doc_edit', (data: { projectId: string; content: string; userName: string }) => {
      // Broadcast character additions to other users in the doc room
      socket.to(`doc-${data.projectId}`).emit('doc_update', {
        content: data.content,
        userName: data.userName
      });
    });

    socket.on('doc_leave', (projectId: string) => {
      socket.leave(`doc-${projectId}`);
      console.log(`📝 User left collaborative editor: ${projectId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};
