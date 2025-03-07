const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

const createMessage = async ({ chatId, senderId, content }) => {
    console.log("messageService.createMessage 호출됨. content:", content); // 디버깅 로그 추가

    const db = getDb();

    // 채팅방이 존재하는지 확인
    const chat = await db.collection('chats').findOne({ _id: new ObjectId(chatId) });
    if (!chat) {
        throw new Error(`${chatId} 채팅방을 찾을 수 없습니다.`);
    }

    // 채팅방에 참여하고 있는 사용자 여부 확인
    if (chat.requesterId !== senderId && chat.accepterId !== senderId) {
        throw new Error(`채팅 메시지를 보낸 사람이 현재 채팅방에 속해있지 않습니다.`);
    }

    const newMessage = {
        chatId: new ObjectId(chatId),
        senderId,
        content,
        createdAt: new Date(),
        read: false
    };

    const result = await db.collection('messages').insertOne(newMessage);

    // 채팅방의 업데이트 시간 갱신
    await db.collection('chats').updateOne(
        { _id: new ObjectId(chatId) },
        { $set: { updatedAt: new Date() } }
    );

    return { _id: result.insertedId, ...newMessage };
};

const getMessagesByChat = async (chatId) => {
    const db = getDb();

    // 채팅방 존재 여부 확인
    const chat = await db.collection('chats').findOne({ _id: new ObjectId(chatId) });
    if (!chat) {
        throw new Error(`${chatId} 채팅방을 찾을 수 없습니다.`);
    }

    const messages = await db.collection('messages')
        .find({ chatId: new ObjectId(chatId) })
        .sort({ createdAt: 1 })
        .toArray();

    return messages;
};

const markMessageAsRead = async (messageId) => {
    const db = getDb();

    const result = await db.collection('messages').updateOne(
        { _id: new ObjectId(messageId) },
        { $set: { read: true } }
    );

    if (result.matchedCount === 0) {
        throw new Error(`${messageId} 메시지를 찾을 수 없습니다.`);
    }

    return `Message ${messageId}가 읽음으로 표시됐습니다.`;
};

module.exports = {
    createMessage,
    getMessagesByChat,
    markMessageAsRead
};