const express = require('express');
const app = express.Router();

const authMiddleware = require('../middlewares/auth');

const { Comments } = require('../models');

//create
app.post('/create', authMiddleware, async (req, res) => {
  try {
    const { postId, content } = req.body;
    const { userId, nickname } = res.locals.user;

    if (!postId) return res.status(412).json({ message: '게시글 번호는 필수입니다.' });
    if (!content) return res.status(412).json({ message: '댓글 내용은 필수입니다.' });
    if (typeof postId !== 'number') return res.status(412).json({ message: '게시글 번호의 형식이 일치하지 않습니다.' });
    if (typeof content !== 'string') return res.status(412).json({ message: '댓글 내용의 형식이 일치하지 않습니다.' });

    await Comments.create({ postId, content, userId, nickname });

    return res.status(201).json({ message: '댓글이 정상 등록되었습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: '댓글 등록에 실패하였습니다.' });
  }
});

//update
app.patch('/update', authMiddleware, async (req, res) => {
  try {
    const { commentId, content } = req.body;
    const { userId } = res.locals.user;

    if (!commentId) return res.status(412).json({ message: '댓글 번호는 필수입니다.' });
    if (!content) return res.status(412).json({ message: '댓글 내용은 필수입니다.' });
    if (typeof commentId !== 'number') return res.status(412).json({ message: '댓글 번호의 형식이 일치하지 않습니다.' });
    if (typeof content !== 'string') return res.status(412).json({ message: '댓글 내용의 형식이 일치하지 않습니다.' });

    const authority = await Comments.findOne({ where: { id: commentId, userId } });
    if (!authority) return res.status(412).json({ message: '댓글 수정은 본인이 작성한 댓글만 가능합니다.' });

    await Comments.update({ content }, { where: { id: commentId, userId } });

    return res.status(201).json({ message: '정상 수정되었습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: '댓글 수정을 실패하였습니다.' });
  }
});

//delete
app.delete('/delete', authMiddleware, async (req, res) => {
  try {
    const { commentId } = req.body;
    const { userId } = res.locals.user;
    if (!commentId) return res.status(412).json({ message: '댓글 번호는 필수입니다.' });
    if (typeof commentId !== 'number') return res.status(412).json({ message: '댓글 번호의 형식이 일치하지 않습니다.' });

    const authority = await Comments.findOne({ where: { id: commentId, userId } });
    if (!authority) return res.status(412).json({ message: '댓글 삭제는 본인이 작성한 댓글만 가능합니다.' });

    await Comments.destroy({ where: { id: commentId } });

    return res.status(201).json({ message: '정상 삭제되었습니다.' });
  } catch (err) {
    console.log('?');
    console.error(err);
    return res.status(400).json({ message: '댓글 삭제에 실패하였습니다.' });
  }
});

module.exports = app;
