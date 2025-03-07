const messageService = require('../services/messageService');
const BaseResponse = require("../utils/BaseResponse");

// 📌 메시지 생성
const createMessage = async (req, res) => {
    try {
        const { chatId, senderId, content } = req.body;
        // 필수 데이터 validation
        if (!chatId || !senderId || !content) {
            return res.json(new BaseResponse(status="fail", code=400, message='입력값이 누락됐습니다.'));
        }
        const newMessage = await messageService.createMessage({ chatId, senderId, content });
        res.json(new BaseResponse(status="success", code=201, message='메시지가 생성됐습니다.', data=newMessage));
    } catch (err) {
        res.json(new BaseResponse(status="error", code=500, message=err.message));
    }
};

// 📌 채팅방별 메시지 조회
const getMessagesByChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        // chatId 검증
        if (!chatId) {
            return res.json(
                new BaseResponse(status="fail", code=400, message="chatId가 필요합니다.")
            );
        }
        const messages = await messageService.getMessagesByChat(chatId);
        res.json(
            new BaseResponse(status="success", code=200, message=`chatRoom ${chatId}의 메시지 조회 성공`, data=messages)
        );
    } catch (err) {
        res.json(
            new BaseResponse(status="error", code=500, message=err.message)
        );
    }
};

// 📌 메시지 읽음 표시
const markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        if(!messageId){
            return res.json(
                new BaseResponse(status="fail", code=400, message="messageId가 누락됐습니다.")
            )
        }
        const result = await messageService.markMessageAsRead(messageId);
        res.json(
            new BaseResponse(status="success", code=200, message=result)
        );
    } catch (err) {
        res.json(new BaseResponse(status="error", code=500, message=err.message));
    }
};

module.exports = {
    createMessage,
    getMessagesByChat,
    markMessageAsRead
};