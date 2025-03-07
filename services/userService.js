// services/userService.js
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const { getDb } = require('../db');
const User = require('../models/User');

// 이메일로 사용자 조회
const findUserByEmail = async (email) => {
    const db = getDb();
    return await db.collection('users').findOne({ userEmail: email });
};

// 회원가입 비즈니스 로직
const registerUser = async ({ userName, userEmail, password }) => {
    // 1. 이메일 중복 체크
    if (await findUserByEmail(userEmail)) {
        throw new Error('이미 존재하는 이메일입니다.');
    }
    // 2. 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);
    // 3. 입력정보 바탕으로 객체 생성 후 DB에 저장
    const newUser = new User(
        userEmail,
        userName,
        hashedPassword,
        new Date()
    );
    const db = getDb();
    await db.collection('users').insertOne(newUser);
    return newUser;
};

// 회원탈퇴 비즈니스 로직
const deleteUser = async (userId) => {
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user) {
        throw new Error('존재하지 않는 회원입니다.');
    }
    await db.collection('users').deleteOne({ _id: new ObjectId(userId) });
};

module.exports = {
    findUserByEmail,
    registerUser,
    deleteUser
};