const express = require('express');
const app = express.Router();

const { db } = require('../database/library');

//all read
app.get('/', async (req, res) => {
  try {
    res.status(201).json((await db(`SELECT * FROM posts`)).sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: '전체 데이터를 불러오는데 실패하였습니다.' });
  }
});

module.exports = app;
