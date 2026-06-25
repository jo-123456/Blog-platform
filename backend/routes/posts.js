const express = require('express');
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');
const { query, run, get } = require('../db/database');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

function calcReadTime(content) {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function makeSlug(title) {
  const base = slugify(title, { lower: true, strict: true });
  return `${base}-${Date.now().toString(36)}`;
}

// Get all posts
router.get('/', optionalAuth, (req, res) => {
  const { page = 1, limit = 9, category, search, author } = req.query;
  const offset = (page - 1) * limit;
  let where = "WHERE p.status = 'published'";
  const params = [];

  if (category) { where += ' AND p.category = ?'; params.push(category); }
  if (author) { where += ' AND u.username = ?'; params.push(author); }
  if (search) {
    where += ' AND (p.title LIKE ? OR p.content LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const total = get(`SELECT COUNT(*) as count FROM posts p JOIN users u ON p.author_id = u.id ${where}`, params);
  const posts = query(
    `SELECT p.*, u.username as author_name, u.avatar as author_avatar,
     (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count
     FROM posts p JOIN users u ON p.author_id = u.id
     ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  res.json({ posts, total: total.count, page: Number(page), pages: Math.ceil(total.count / limit) });
});

// Get single post
router.get('/:slug', optionalAuth, (req, res) => {
  const post = get(
    `SELECT p.*, u.username as author_name, u.avatar as author_avatar, u.bio as author_bio,
     (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count
     FROM posts p JOIN users u ON p.author_id = u.id WHERE p.slug = ?`,
    [req.params.slug]
  );
  if (!post) return res.status(404).json({ error: 'Post not found' });

  run('UPDATE posts SET views = views + 1 WHERE id = ?', [post.id]);
  post.views += 1;

  if (req.user) {
    post.liked = !!get('SELECT 1 FROM post_likes WHERE user_id = ? AND post_id = ?', [req.user.id, post.id]);
  }

  res.json(post);
});

// Create post
router.post('/', auth, (req, res) => {
  try {
    const { title, content, excerpt, cover_image, category, tags, status } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content required' });

    const id = uuidv4();
    const slug = makeSlug(title);
    const readTime = calcReadTime(content);
    const postExcerpt = excerpt || content.replace(/<[^>]+>/g, '').substring(0, 200) + '...';

    run(
      `INSERT INTO posts (id, title, slug, content, excerpt, cover_image, author_id, category, tags, status, read_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, slug, content, postExcerpt, cover_image || '', req.user.id,
       category || 'General', JSON.stringify(tags || []), status || 'published', readTime]
    );

    const post = get('SELECT p.*, u.username as author_name FROM posts p JOIN users u ON p.author_id = u.id WHERE p.id = ?', [id]);
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update post
router.put('/:id', auth, (req, res) => {
  const post = get('SELECT * FROM posts WHERE id = ?', [req.params.id]);
  if (!post) return res.status(404).json({ error: 'Not found' });
  if (post.author_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Forbidden' });

  const { title, content, excerpt, cover_image, category, tags, status } = req.body;
  const readTime = content ? calcReadTime(content) : post.read_time;

  run(
    `UPDATE posts SET title = COALESCE(?, title), content = COALESCE(?, content),
     excerpt = COALESCE(?, excerpt), cover_image = COALESCE(?, cover_image),
     category = COALESCE(?, category), tags = COALESCE(?, tags),
     status = COALESCE(?, status), read_time = ?, updated_at = datetime('now') WHERE id = ?`,
    [title || null, content || null, excerpt || null, cover_image || null,
     category || null, tags ? JSON.stringify(tags) : null, status || null, readTime, req.params.id]
  );

  res.json(get('SELECT p.*, u.username as author_name FROM posts p JOIN users u ON p.author_id = u.id WHERE p.id = ?', [req.params.id]));
});

// Delete post
router.delete('/:id', auth, (req, res) => {
  const post = get('SELECT * FROM posts WHERE id = ?', [req.params.id]);
  if (!post) return res.status(404).json({ error: 'Not found' });
  if (post.author_id !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Forbidden' });

  run('DELETE FROM comments WHERE post_id = ?', [req.params.id]);
  run('DELETE FROM post_likes WHERE post_id = ?', [req.params.id]);
  run('DELETE FROM posts WHERE id = ?', [req.params.id]);
  res.json({ message: 'Deleted' });
});

// Like/unlike post
router.post('/:id/like', auth, (req, res) => {
  const existing = get('SELECT 1 FROM post_likes WHERE user_id = ? AND post_id = ?', [req.user.id, req.params.id]);
  if (existing) {
    run('DELETE FROM post_likes WHERE user_id = ? AND post_id = ?', [req.user.id, req.params.id]);
    run('UPDATE posts SET likes = likes - 1 WHERE id = ?', [req.params.id]);
    res.json({ liked: false });
  } else {
    run('INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)', [req.user.id, req.params.id]);
    run('UPDATE posts SET likes = likes + 1 WHERE id = ?', [req.params.id]);
    res.json({ liked: true });
  }
});

// Get categories
router.get('/meta/categories', (req, res) => {
  const cats = query("SELECT category, COUNT(*) as count FROM posts WHERE status='published' GROUP BY category ORDER BY count DESC");
  res.json(cats);
});

module.exports = router;
