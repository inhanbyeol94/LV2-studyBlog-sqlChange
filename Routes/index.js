const express = require('express');
const app = express.Router();

const { Posts } = require('../models');

//all read
app.get('/', async (req, res) => {
  try {
    res.status(201).json(await Posts.findAll());
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: '전체 데이터를 불러오는데 실패하였습니다.' });
  }
});

module.exports = app;
