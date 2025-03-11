// socket.js
const socketIo = require('socket.io');

const chatService = require('./services/chatService');
const messageService = require('./services/messageService.js');


module.exports = (server) => {
    const io = socketIo(server, {
        cors: {
          origin: "http://localhost:3000", // 클라이언트 URL
          methods: ["GET", "POST"],
          credentials: true, // 쿠키 전송 허용 (필요한 경우)
        }
      });
    io.on('connection', (socket) => {
        console.log('새 클라이언트 접속: ', socket.id);
        // // 백엔드 고칠 떄는 항상 다시 키기!!!!!!!!!!!!!!!!!!!!!!!!
        // // 채팅방 생성 이벤트
        // socket.on('createChat', async ({ requesterId, accepterId }) => {
        //     try {
        //         // 1. 채팅방 생성
        //         const chat = await chatService.createChat({ requesterId, accepterId });
        //         // 2. 채팅방의 ID를 room 이름으로 사용하여 생성된 방에 join
        //         socket.join(chat._id.toString());
        //         // 3. 프론트에 채팅방 완성됐다고 emit
        //         socket.emit('chatCreated', chat);
        //     } catch (err) {
        //         socket.emit('error', { message: err.message });
        //     }
        // });

        // 채팅방 입장 이벤트
        socket.onAny((event, ...args) => {
            console.log(`Received event ${event}:`, args);
          });
        

        socket.on('joinRoom', ({ chatId, userId }) => {
            socket.join(chatId);
            socket.emit('joinedChat', { chatId }); // 프론트에 참여 성공했다고 알리는 소켓통신
        });

        // 메시지 송신 이벤트
        socket.on('sendMessage', async (payload) => {
            console.log("sendMessage payload:", payload);
            const { chatId, senderId, content } = payload;
            try {
                // 실제 생성된 메시지 객체를 반환받습니다.
                const newMessage = await messageService.createMessage({ chatId, senderId, content });
                console.log("New message created:", newMessage);
                const msgData = {
                    _id: newMessage._id,  // 여기서 _id를 포함합니다.
                    chatId,
                    senderId,
                    content,
                    createdAt: newMessage.createdAt || new Date()
                };
                io.to(chatId).emit('message', msgData);
            } catch (err) {
                socket.emit('error', { message: err.message });
            }
        });
        
        // socket.js (서버)
        socket.on('messagesRead', (data) => {
            console.log("Received messagesRead from client for chat:", data.chatId);

            io.to(data.chatId).emit('messagesRead', data);
        });
  

        socket.on('disconnect', () => {
            console.log('클라이언트 연결 종료:', socket.id);
        });
    });
};