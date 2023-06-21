const express = require('express');
const app = express.Router();

const { db } = require('../database/library');
const authMiddleware = require('../middlewares/auth');
const moment = require('moment');

//single read [post, comment]
app.get('/', async (req, res) => {
  try {
    res.status(200).json({ post: await db(`SELECT * FROM posts WHERE postId = '${req.query.id}'`), comments: await db(`SELECT * FROM comments WHERE postId = '${req.query.id}'`) });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: '게시물 상세 정보를 불러오는데 실패하였습니다.' });
  }
});

//create
app.post('/create', authMiddleware, async (req, res) => {
  try {
    const { title, body } = req.body;
    const { id, nickname } = res.locals.user;
    const nowDate = moment().format('YYYY-MM-DD HH:mm:ss');

    if (!title) return res.status(412).json({ message: '게시글 제목은 필수입니다.' });
    if (!body) return res.status(412).json({ message: '게시글 내용은 필수입니다.' });
    if (typeof title !== 'string') return res.status(412).json({ message: '게시글 제목의 형식이 일치하지 않습니다.' });
    if (typeof body !== 'string') return res.status(412).json({ message: '게시글 내용의 형식이 일치하지 않습니다.' });

    const result = await db(`INSERT INTO posts (title, userId, nickname, body, date) VALUES ("${title}","${id}","${nickname}","${body}","${nowDate}");`);

    if (result.affectedRows !== 1) return res.status(401).json({ message: '게시글 등록에 실패하였습니다.' });

    return res.json({ message: '게시글이 정상 생성되었습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: '게시글 작성에 실패하였습니다.' });
  }
});

//update
app.patch('/update', authMiddleware, async (req, res) => {
  try {
    const { postId, title, body } = req.body;
    const { id } = res.locals.user;

    if (!postId) return res.status(412).json({ message: '게시글 번호는 필수입니다.' });
    if (!title) return res.status(412).json({ message: '게시글 제목은 필수입니다.' });
    if (!body) return res.status(412).json({ message: '게시글 내용은 필수입니다.' });
    if (typeof postId !== 'number') return res.status(412).json({ message: '게시글 번호의 형식이 일치하지 않습니다.' });
    if (typeof title !== 'string') return res.status(412).json({ message: '게시글 제목의 형식이 일치하지 않습니다.' });
    if (typeof body !== 'string') return res.status(412).json({ message: '게시글 내용의 형식이 일치하지 않습니다.' });

    const [authority] = await db(`SELECT * FROM posts WHERE postId = '${postId}' AND userId = '${id}'`);
    if (!authority) return res.status(412).json({ message: '게시글 수정은 본인이 작성한 게시글만 가능합니다.' });

    const result = await db(`UPDATE posts SET title = '${title}', body = '${body}' WHERE postId = '${postId}'`);

    if (result.affectedRows !== 1) return res.status(401).json({ message: '게시글 수정에 실패하였습니다.' });
    return res.status(201).json({ message: '정상 수정되었습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: '게시글 수정에 실패하였습니다.' });
  }
});

//delete
app.delete('/delete', authMiddleware, async (req, res) => {
  try {
    const { id } = res.locals.user;
    const { postId } = req.body;

    if (!postId) return res.status(412).json({ message: '게시글 번호는 필수입니다.' });
    if (typeof postId !== 'number') return res.status(412).json({ message: '게시글 번호의 형식이 일치하지 않습니다.' });

    const [authority] = await db(`SELECT * FROM posts WHERE postId = '${postId}' AND userId = '${id}'`);
    if (!authority) return res.status(412).json({ message: '게시글 삭제는 본인이 작성한 게시글만 가능합니다.' });

    const result = await db(`DELETE FROM posts WHERE postId = '${postId}';`);

    if (result.affectedRows !== 1) return res.status(401).json({ message: '게시글 삭제를 실패하였습니다.' });
    return res.status(201).json({ message: '정상 삭제되었습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: '게시글 삭제를 실패하였습니다.' });
  }
});

module.exports = app;
