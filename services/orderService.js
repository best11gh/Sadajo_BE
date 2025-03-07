const { ObjectId } = require('mongodb');
const { getDb } = require('../db');
const Order = require('../models/Order');

// 거래 조회 (전체)
const getAllOrders = async () => {
    const db = getDb();
    const orders = await db.collection('orders').find({}).toArray();
    return orders;
};

// 거래 생성
const createOrder = async ({ requesterId, accepterId, orderState, items, fee }) => {
    const db = getDb();
    const newOrder = new Order(requesterId, accepterId, orderState, items, fee);
    const result = await db.collection('orders').insertOne(newOrder);
    return {order: { ...newOrder, _id: result.insertedId } };
};

// 거래 삭제
const deleteOrder = async (orderId) => {
    const db = getDb();
    const result = await db.collection('orders').deleteOne({ _id: new ObjectId(orderId) });
    if (result.deletedCount === 0) {
        throw new Error(`Order with id ${orderId} not found`);
    }
    return `Order ${orderId}가 삭제됐습니다.`;
};

// 거래 상태 업데이트
const updateOrderStatus = async (orderId, { orderState }) => {
    const db = getDb();
    const result = await db.collection('orders').updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { orderState } }
    );
    if (result.matchedCount === 0) {
        throw new Error(`Order with id ${orderId} not found`);
    }
    return `Order ${orderId}가 ${orderState} 상태로 업데이트됐습니다.`;
};

// 거래 수정
const updateOrder = async (orderId, updateData) => {
    const db = getDb();
    const result = await db.collection('orders').updateOne(
        { _id: new ObjectId(orderId) },
        { $set: updateData }
    );
    if (result.matchedCount === 0) {
        throw new Error(`Order ${orderId}를 찾을 수 없습니다.`);
    }
    return "수정이 완료됐습니다.";
};

module.exports = {
    getAllOrders,
    createOrder,
    deleteOrder,
    updateOrderStatus,
    updateOrder
};