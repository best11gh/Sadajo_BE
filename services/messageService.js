const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

const createMessage = async ({ chatId, senderId, content }) => {
    const db = getDb();

    // 채팅방이 존재하는지 확인
    const chat = await db.collection('chats').findOne({ _id: new ObjectId(chatId) });
    if (!chat) {
        throw new Error(`The chat with ID ${chatId} could not be found.`);
    }

    // 채팅방에 참여하고 있는 사용자 여부 확인
    if (chat.requesterId !== senderId && chat.accepterId !== senderId) {
        throw new Error(`Sender is not a participant in this chat.`);
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
        throw new Error(`The chat with ID ${chatId} could not be found.`);
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
        throw new Error(`The message with ID ${messageId} could not be found`);
    }

    return `Message ${messageId} marked as read`;
};

module.exports = {
    createMessage,
    getMessagesByChat,
    markMessageAsRead
};