const orderService = require('../services/orderService');
const BaseResponse = require("../utils/BaseResponse");


// 거래 조회 (전체)
const getAllOrders = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders();
        res.json(new BaseResponse(status="success", code=200, message="모든 거래 조회 성공", data=orders));
    } catch (err) {
        res.json(new BaseResponse(status="error", code=500, message=err.message));
    }
};

// 거래 생성
const createOrder = async (req, res) => {
    try {
        const { requesterId, accepterId, orderState, items, fee } = req.body;

        // 필수 데이터 validation
        if (!requesterId || !accepterId || !orderState || !items || !fee) {
            return res.json(new BaseResponse(status="fail", code=400, message='입력값이 누락됐습니다.'));
        }

        const result = await orderService.createOrder({ requesterId, accepterId, orderState, items, fee });
        res.json(new BaseResponse(status="success", code=201, message='거래가 생성됐습니다.', data=result));
    } catch (err) {
        res.json(new BaseResponse(status="error", code=500, message=err.message));
    }
};

// 거래 삭제
const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const result = await orderService.deleteOrder(orderId);
        res.json(new BaseResponse(status="success", code=200, message=result));
    } catch (err) {
        res.json(new BaseResponse(status="error", code=500, message=err.message));
    }
};

// 거래 상태 업데이트
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderState } = req.body;
        const result = await orderService.updateOrderStatus(orderId, { orderState });
        res.json(new BaseResponse(status="success", code=200, message=result));
    } catch (err) {
        res.json(new BaseResponse(status="error", code=500, message=err.message));
    }
};

// 거래 수정
const updateOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const updateData = req.body;
        // 필수 데이터 validation
        if (!orderId || !updateData) {
            return res.json(new BaseResponse(status="fail", code=400, message='입력값이 누락됐습니다.'));
        }
        const result = await orderService.updateOrder(orderId, updateData);
        res.json(new BaseResponse(status="success", code=200, message=result));
    } catch (err) {
            res.json(new BaseResponse(status="error", code=500, message=err.message));
        }
};

module.exports = {
    getAllOrders,
    createOrder,
    deleteOrder,
    updateOrderStatus,
    updateOrder
};