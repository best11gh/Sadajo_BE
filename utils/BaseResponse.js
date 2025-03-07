class BaseResponse {
    constructor(status, code, message = "", data = null) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.data = data;
    }
}

module.exports = BaseResponse;