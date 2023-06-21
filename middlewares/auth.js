require('dotenv').config();

const { SESSION_SECRET_KEY } = process.env;
const jwt = require('jsonwebtoken');
const { db } = require('../database/library');

module.exports = async (req, res, next) => {
  const { auth } = req.cookies;
  const [authType, authToken] = (auth ?? '').split(' ');

  if (authType !== 'Bearer' || !authToken) return res.status(403).json({ message: '로그인 후에 이용할 수 있는 기능입니다.' });

  try {
    const { id } = jwt.verify(authToken, SESSION_SECRET_KEY);

    const [user] = await db(`SELECT id, nickname FROM members WHERE id = '${id}'`);
    res.locals.user = user;

    next();
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: '전달된 쿠키에서 오류가 발생하였습니다.' });
  }
};
