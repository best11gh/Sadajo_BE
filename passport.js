// passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const { getDb } = require('./db');
const { findUserByEmail } = require('./services/userService');

passport.use(new LocalStrategy(
    { usernameField: 'userEmail', passwordField: 'password' },
    async (userEmail, password, done) => {
        try {
            const db = getDb();
            const result = await findUserByEmail(userEmail);
            if (!result) {
                return done(null, false, { message: '존재하지 않는 이메일입니다.' });
            }
            const isMatch = await bcrypt.compare(password, result.password);
            if (isMatch) {
                return done(null, result);
            } else {
                return done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
            }
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => {
    process.nextTick(() => {
        done(null, { id: user._id, email: user.userEmail, name: user.userName });
    });
});

passport.deserializeUser(async (user, done) => {
    try {
        const db = getDb();
        const result = await db.collection('users').findOne({ _id: new ObjectId(user.id) });
        if (result) {
            delete result.password;
        }
        process.nextTick(() => {
            done(null, user);
        });
    } catch (err) {
        done(err);
    }
});

module.exports = passport;