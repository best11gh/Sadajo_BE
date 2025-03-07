const chatService = require('../services/chatService');
const BaseResponse = require("../utils/BaseResponse");


// 📌 채팅방 생성
const createChat = async (req, res) => {
    try {
        const { requesterId, accepterId } = req.body;

        // 필수 필드 유효성 검사
        if (!requesterId || !accepterId) {
            return res.json(
            new BaseResponse(status="fail", code=400, message="채팅방을 만들기 위해 요청자, 수용자 id가 둘다 필요합니다.")
            );
        }
        if (requesterId === accepterId) {
            return res.json(
                new BaseResponse(status="fail", code=400,  message="요청자와 수용자가 동일인입니다."));
        }

        const newChat = await chatService.createChat({ requesterId, accepterId });
        res.json(
            new BaseResponse(status="success", code=201, message="채팅방이 생성됐습니다.", data = newChat)
        );
    } catch (err) {
        res.json(
            new BaseResponse(status="error", code=500, message=err.message)
        );
    }
};

// 📌 특정 사용자의 채팅방 조회
const getChatsByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // userId 검증
        if (!userId) {
            return res.json(
                new BaseResponse(status="fail", code=400, message="userId가 필요합니다.")
            );
        }
        const chats = await chatService.getChatsByUser(userId);
        res.json(
            new BaseResponse(status="success", code=200, message="채팅방 조회 성공", data=chats)
        );
    } catch (err) {
        res.json(
            new BaseResponse(status="error", code=500, message=err.message)
        );
    }
};

// 📌 채팅방 삭제
const deleteChat = async (req, res) => {
    try {
        const { chatId } = req.params;

        // chatId 검증
        if (!chatId) {
            return res.json(
                new BaseResponse(status="fail", code=400, message="chatId가 필요합니다.")
            );
        }

        const result = await chatService.deleteChat(chatId);
        res.json(
            new BaseResponse(status="success", code=200, message="채팅방이 삭제됐습니다.", data=result)
        );
    } catch (err) {
        res.json(
            new BaseResponse(status="error", code=500, message=err.message)
        );
    }
};

module.exports = {
    createChat,
    getChatsByUser,
    deleteChat
};