const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { query, run, get } = require('../db/database');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Get comments for a post
router.get('/', optionalAuth, (req, res) => {
  const post = get('SELECT id FROM posts WHERE slug = ?', [req.params.slug]);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const comments = query(
    `SELECT c.*, u.username as author_name, u.avatar as author_avatar
     FROM comments c JOIN users u ON c.author_id = u.id
     WHERE c.post_id = ? ORDER BY c.created_at ASC`,
    [post.id]
  );

  // Nest replies
  const top = comments.filter(c => !c.parent_id);
  const replies = comments.filter(c => c.parent_id);
  const nested = top.map(c => ({
    ...c,
    replies: replies.filter(r => r.parent_id === c.id)
  }));

  res.json(nested);
});

// Add comment
router.post('/', auth, (req, res) => {
  const post = get('SELECT id FROM posts WHERE slug = ?', [req.params.slug]);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const { content, parent_id } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Content required' });

  const id = uuidv4();
  run(
    'INSERT INTO comments (id, content, post_id, author_id, parent_id) VALUES (?, ?, ?, ?, ?)',
    [id, content, post.id, req.user.id, parent_id || null]
  );

  const comment = get(
    'SELECT c.*, u.username as author_name, u.avatar as author_avatar FROM comments c JOIN users u ON c.author_id = u.id WHERE c.id = ?',
    [id]
  );
  res.status(201).json({ ...comment, replies: [] });
});

// Update comment
router.put('/:commentId', auth, (req, res) => {
  const comment = get('SELECT * FROM comments WHERE id = ?', [req.params.commentId]);
  if (!comment) return res.status(404).json({ error: 'Not found' });
  if (comment.author_id !== req.user.id)
    return res.status(403).json({ error: 'Forbidden' });

  run("UPDATE comments SET content = ?, updated_at = datetime('now') WHERE id = ?",
    [req.body.content, req.params.commentId]);
  res.json(get('SELECT c.*, u.username as author_name, u.avatar as author_avatar FROM comments c JOIN users u ON c.author_id = u.id WHERE c.id = ?', [req.params.commentId]));
});

// Delete comment
router.delete('/:commentId', auth, (req, res) => {
  const comment = get('SELECT * FROM comments WHERE id = ?', [req.params.commentId]);
  if (!comment) return res.status(404).json({ error: 'Not found' });
  if (comment.author_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Forbidden' });

  run('DELETE FROM comments WHERE parent_id = ?', [req.params.commentId]);
  run('DELETE FROM comment_likes WHERE comment_id = ?', [req.params.commentId]);
  run('DELETE FROM comments WHERE id = ?', [req.params.commentId]);
  res.json({ message: 'Deleted' });
});

// Like comment
router.post('/:commentId/like', auth, (req, res) => {
  const existing = get('SELECT 1 FROM comment_likes WHERE user_id = ? AND comment_id = ?', [req.user.id, req.params.commentId]);
  if (existing) {
    run('DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?', [req.user.id, req.params.commentId]);
    run('UPDATE comments SET likes = likes - 1 WHERE id = ?', [req.params.commentId]);
    res.json({ liked: false });
  } else {
    run('INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)', [req.user.id, req.params.commentId]);
    run('UPDATE comments SET likes = likes + 1 WHERE id = ?', [req.params.commentId]);
    res.json({ liked: true });
  }
});

module.exports = router;
