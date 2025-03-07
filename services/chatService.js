const { ObjectId } = require('mongodb');
const { getDb } = require('../db');

const createChat = async ({ requesterId, accepterId }) => {
    const db = getDb();

    // 중복 채팅방 존재 여부 확인
    const existingChat = await db.collection('chats').findOne({
        $or: [
            { requesterId: requesterId, accepterId: accepterId },
            { requesterId: accepterId, accepterId: requesterId }
        ]
    });

    if (existingChat) {
        throw new Error(`Chat already exists between ${requesterId} and ${accepterId}.`);
    }

    const newChat = {
        requesterId,
        accepterId,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const result = await db.collection('chats').insertOne(newChat);
    return { _id: result.insertedId, ...newChat };
};

const getChatsByUser = async (userId) => {
    const db = getDb();

    const chats = await db.collection('chats').find({
        $or: [{ requesterId: userId }, { accepterId: userId }]
    })
        .sort({ updatedAt: -1 })
        .toArray();

    return chats;
};

const deleteChat = async (chatId) => {
    const db = getDb();

    const result = await db.collection('chats').deleteOne({ _id: new ObjectId(chatId) });
    if (result.deletedCount === 0) {
        throw new Error(`The chat with ID ${chatId} could not be found.`);
    }

    return `Chat with ID ${chatId} has been successfully deleted.`;
};

module.exports = {
    createChat,
    getChatsByUser,
    deleteChat
};