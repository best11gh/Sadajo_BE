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

        // 1. 데이터 검증
        if (!userEmail || !password) {
            return res.status(400).json({ message: 'userEmail and password are required.' });
        }

        passport.authenticate('local', (err, user, info) => {
            if (err) return res.status(500).json({ message: err.message });
            if (!user) return res.status(401).json({ message: info.message });
            
            req.logIn(user, (err) => {
                if (err) return next(err);

                // BaseResponse 클래스는 상태, 코드, 메시지, 데이터를 인자로 받습니다.
                // return res.json(
                //     new BaseResponse("Success", 200, 'User logged in successfully', 
                    //     { 
                    //         id: user._id, 
                    //         email: user.userEmail, 
                    //         name: user.userName 
                    //     }
                    // )
                // );

                return res.json(
                    new BaseResponse(status="success", code = 200, message = "로그인이 성공했습니다", 
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
        console.log("로그인 처리 과정에서 오류");
        res.status(500).json({ message: err.message });
    }
};

// 📌 로그아웃
const logout = (req, res) => {
    try {
        req.logout((err) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }
            res.json({ message: 'User logged out successfully' });
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// 📌 회원가입 
const register = async (req, res) => {
    try {
        const { userName, userEmail, password } = req.body;
        if (!userName || !userEmail || !password) {
            return res.status(400).json({ message: 'userName, userEmail, password are required.' });
        }

        await registerUser({ userName, userEmail, password });
        res.json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 📌 회원탈퇴 (userService의 deleteUser 사용)
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await deleteUserService(userId);

        req.logout((err) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }
            res.json({ message: 'User deleted and logged out successfully' });
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports = { login, logout, register, deleteUser };
