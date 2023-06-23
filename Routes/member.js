require('dotenv').config;
const { SECRET_KEY, SESSION_SECRET_KEY } = process.env;

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const express = require('express');
const app = express.Router();

const { Members } = require('../models');
const { Op } = require('sequelize');

//all read
app.post('/register', async (req, res) => {
  try {
    const { id, password, nickname, confirmPassword } = req.body;

    if (!id) return res.status(412).json({ message: 'id값은 필수입니다.' });
    if (!password) return res.status(412).json({ message: 'password값은 필수입니다.' });
    if (!confirmPassword) return res.status(412).json({ message: 'confirmPassword값은 필수입니다.' });
    if (!nickname) return res.status(412).json({ message: 'nickname값은 필수입니다.' });

    if (!/^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,16}$/.test(nickname)) return res.status(412).json({ message: 'nickname값은 2자 이상 16자 이하, 영어 또는 숫자 또는 한글로 구성해 주세요.' });
    if (!/^[a-z]+[a-z0-9]{5,19}$/g.test(id)) return res.status(412).json({ message: 'id값은 영문자로 시작하는 영문자 또는 숫자 6~20자를 입력해 주세요.' });
    if (!/^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{8,16}$/.test(password)) return res.status(412).json({ message: 'password값은 8~16자 영문, 숫자, 특수문자를 최소 한가지씩 조합해서 입력해 주세요.' });

    const overlapToCheck = await Members.findOne({ where: { [Op.or]: [{ userId: id }, { nickname: nickname }] } });

    if (overlapToCheck) return res.status(412).json({ message: '입력한 id혹은 nickname이 중복된 값입니다.' });

    const passwordToCrypto = crypto.pbkdf2Sync(password, SECRET_KEY.toString('hex'), 11524, 64, 'sha512').toString('hex');

    await Members.Create({ userId: id, nickname, password: passwordToCrypto });

    res.status(201).json({ message: '정상 등록되었습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: '오류가 발생했습니다.' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id) return res.status(412).json({ message: 'id값은 필수입니다.' });
    if (!password) return res.status(412).json({ message: 'password값은 필수입니다.' });

    const passwordToCrypto = crypto.pbkdf2Sync(password, SECRET_KEY.toString('hex'), 11524, 64, 'sha512').toString('hex');

    const validationToUser = await Members.findOne({ where: { userId: id, password: passwordToCrypto } });

    if (!validationToUser) return res.status(412).json({ message: '로그인에 실패하였습니다.' });

    const payloadData = { userId: validationToUser.userId, nickname: validationToUser.nickname };
    const token = await jwt.sign(payloadData, SESSION_SECRET_KEY);

    res.cookie('auth', `Bearer ${token}`);
    return res.status(200).json({ message: '로그인 성공' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: '로그인 도중 오류가 발생하였습니다.' });
  }
});

module.exports = app;
