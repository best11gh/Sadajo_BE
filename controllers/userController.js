const { ObjectId } = require('mongodb');
const { getDb } = require('../db');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const passport = require('../passport');
const LocalStrategy = require('passport-local')
const { findUserByEmail, registerUser, deleteUser: deleteUserService } = require('../services/userService');
const BaseResponse = require("../utils/BaseResponse");

// 📌 로그인
const login = async (req, res, next) => {
    try {
        const { userEmail, password } = req.body;

        if (!userEmail || !password) {
            return res.json(
                new BaseResponse(status = "fail", code = 400, message = "이메일이나 비밀번호가 입력되지 않았습니다.")
            )
        }

        passport.authenticate('local', (err, user, info) => {
            if (err) return new BaseResponse(status = "error", code = 500, message = err.message);
            if (!user) return new BaseResponse(status = "fail", code = 401, message = info.message);

            req.logIn(user, (err) => {
                if (err) return new BaseResponse(status = "error", code = 500, message = err.message);

                return res.json(
                    new BaseResponse(status = "success", code = 200, message = "로그인이 성공했습니다",
                        data = {
                            id: user._id,
                            email: user.userEmail,
                            name: user.userName
                        }
                    )
                )

            });

        })(req, res, next);

    } catch (err) {
        console.log("로그인 처리 과정에서 오류 발생", err);
        return res.json(
            new BaseResponse(status = "error", code = 500, message = err.message)
        )


    }
};

// 📌 로그아웃
const logout = (req, res) => {
    try {
        req.logout((err) => {
            if (err) {
                return res.json(
                    new BaseResponse(status = "error", code = 500, message = err.message)
                )
            }
            return res.json(
                new BaseResponse(status = "success", code = 200, message = "로그아웃이 성공했습니다")
            )
        });
    } catch (err) {
        console.log("로그아웃 처리 과정에서 오류 발생", err);
        return res.json(
            new BaseResponse(status = "error", code = 500, message = err.message)
        )
    }
};


// 📌 회원가입 
const register = async (req, res) => {
    try {
        const { userName, userEmail, password } = req.body;
        if (!userName || !userEmail || !password) {
            return res.json(new BaseResponse(status = "fail", code = 400, message = "이름, 이메일, 비밀번호 중 하나라도 입력되지 않았습니다."))
        }

        await registerUser({ userName, userEmail, password });

        return res.json(new BaseResponse(status = "success", code = 200, message = "회원가입이 완료되었습니다."))
    } catch (err) {
        return res.json(new BaseResponse(status = "error", code = 500, message = err.message))
    }
};

// 📌 회원탈퇴 
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await deleteUserService(userId);

        req.logout((err) => {
            if (err) {
                return res.json(new BaseResponse(status = "error", code = 500, message = err.message));
            }
            return res.json(new BaseResponse(status = "success", code = 200, message = "회원 탈퇴가 완료되었습니다."));
        });
    } catch (err) {
        return res.json(new BaseResponse(status = "error", code = 500, message = err.message))
    }
};


module.exports = { login, logout, register, deleteUser };
