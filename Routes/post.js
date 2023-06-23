const express = require('express');
const app = express.Router();

const { Posts, Comments } = require('../models');
const authMiddleware = require('../middlewares/auth');
const { Op } = require('sequelize');

//single read [post, comment]
app.get('/', async (req, res) => {
  try {
    res.status(200).json({ post: await Posts.findOne({ where: { id: req.query.id } }), comments: await Comments.findAll({ where: { postId: req.query.id } }) });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: '게시물 상세 정보를 불러오는데 실패하였습니다.' });
  }
});

//create
app.post('/create', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const { userId, nickname } = res.locals.user;

    if (!title) return res.status(412).json({ message: '게시글 제목은 필수입니다.' });
    if (!content) return res.status(412).json({ message: '게시글 내용은 필수입니다.' });
    if (typeof title !== 'string') return res.status(412).json({ message: '게시글 제목의 형식이 일치하지 않습니다.' });
    if (typeof content !== 'string') return res.status(412).json({ message: '게시글 내용의 형식이 일치하지 않습니다.' });

    await Posts.create({ title, content, userId, nickname });

    return res.json({ message: '게시글이 정상 생성되었습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: '게시글 작성에 실패하였습니다.' });
  }
});

//update
app.patch('/update', authMiddleware, async (req, res) => {
  try {
    const { postId, title, content } = req.body;
    const { userId } = res.locals.user;

    if (!postId) return res.status(412).json({ message: '게시글 번호는 필수입니다.' });
    if (!title) return res.status(412).json({ message: '게시글 제목은 필수입니다.' });
    if (!content) return res.status(412).json({ message: '게시글 내용은 필수입니다.' });
    if (typeof postId !== 'number') return res.status(412).json({ message: '게시글 번호의 형식이 일치하지 않습니다.' });
    if (typeof title !== 'string') return res.status(412).json({ message: '게시글 제목의 형식이 일치하지 않습니다.' });
    if (typeof content !== 'string') return res.status(412).json({ message: '게시글 내용의 형식이 일치하지 않습니다.' });

    const authority = await Posts.findOne({ where: { id: postId, userId: userId } });
    if (!authority) return res.status(412).json({ message: '게시글 수정은 본인이 작성한 게시글만 가능합니다.' });

    await Posts.update({ title, content }, { where: { [Op.and]: [{ id: postId }, { userId }] } });

    return res.status(201).json({ message: '정상 수정되었습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: '게시글 수정에 실패하였습니다.' });
  }
});

//delete
app.delete('/delete', authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { postId } = req.body;

    if (!postId) return res.status(412).json({ message: '게시글 번호는 필수입니다.' });
    if (typeof postId !== 'number') return res.status(412).json({ message: '게시글 번호의 형식이 일치하지 않습니다.' });

    const authority = await Posts.findOne({ where: { id: postId, userId: userId } });
    if (!authority) return res.status(412).json({ message: '게시글 삭제는 본인이 작성한 게시글만 가능합니다.' });

    await Posts.destroy({ where: { id: postId } });

    return res.status(201).json({ message: '정상 삭제되었습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: '게시글 삭제를 실패하였습니다.' });
  }
});

module.exports = app;
