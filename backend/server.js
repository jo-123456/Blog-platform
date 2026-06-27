require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getDB, run, get } = require('./db/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));

async function seedData() {
  const existing = get("SELECT id FROM users WHERE email = 'demo@blog.com'");
  if (existing) return;

  const adminId = uuidv4();
  const pw = await bcrypt.hash('demo1234', 10);
  run('INSERT INTO users (id, username, email, password, avatar, bio, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [adminId, 'demo_writer', 'demo@blog.com', pw,
     'https://api.dicebear.com/7.x/avataaars/svg?seed=demo_writer',
     'Passionate writer exploring ideas at the intersection of technology, design, and culture.', 'admin']);

  const posts = [
    {
      title: 'The Art of Minimalist Design in the Digital Age',
      category: 'Design',
      cover: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=800&q=80',
      content: `<p>Minimalism in design isn't about removing everything—it's about keeping only what matters.</p><h2>The Core Principles</h2><p>Great minimalist design starts with a ruthless editorial eye.</p>`
    },
    {
      title: 'Building Resilient APIs: Lessons from Production',
      category: 'Technology',
      cover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
      content: `<p>Every API that survives contact with real users carries battle scars.</p><h2>Design for Failure First</h2><p>Stop asking how will this work and start asking how will this fail.</p>`
    },
    {
      title: 'On Deep Work and the Attention Economy',
      category: 'Productivity',
      cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      content: `<p>We are living through the largest attention heist in human history.</p><h2>The Value of Undivided Attention</h2><p>Deep work is becoming increasingly rare and increasingly valuable.</p>`
    }
  ];

  const slugify = require('slugify');
  for (const p of posts) {
    const id = uuidv4();
    const slug = slugify(p.title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
    const words = p.content.split(/\s+/).length;
    const readTime = Math.ceil(words / 200);
    const excerpt = p.content.replace(/<[^>]+>/g, '').substring(0, 200) + '...';
    run(`INSERT INTO posts (id, title, slug, content, excerpt, cover_image, author_id, category, tags, read_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, p.title, slug, p.content, excerpt, p.cover, adminId, p.category, '[]', readTime]);

    const commentId = uuidv4();
    run('INSERT INTO comments (id, content, post_id, author_id) VALUES (?, ?, ?, ?)',
      [commentId, 'Really insightful perspective. This changed how I think about the topic.', id, adminId]);
  }
}

app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/posts/:slug/comments', require('./routes/comments'));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// Image proxy — fetches external images server-side to bypass hotlink/CORS blocks
app.get('/api/proxy-image', (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url param' });

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return res.status(400).json({ error: 'Invalid protocol' });
  }

  const protocol = parsedUrl.protocol === 'https:' ? require('https') : require('http');
  const request = protocol.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Inkwell/1.0)',
      'Accept': 'image/*,*/*',
      'Referer': parsedUrl.origin,
    },
    timeout: 10000,
  }, (proxyRes) => {
    if ([301, 302, 303, 307, 308].includes(proxyRes.statusCode)) {
      const redirectUrl = proxyRes.headers['location'];
      if (redirectUrl) {
        return res.redirect(`/api/proxy-image?url=${encodeURIComponent(redirectUrl)}`);
      }
    }

    if (proxyRes.statusCode !== 200) {
      return res.status(proxyRes.statusCode || 500).json({ error: 'Failed to fetch image' });
    }

    const contentType = proxyRes.headers['content-type'] || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    proxyRes.pipe(res);
  });

  request.on('error', () => res.status(500).json({ error: 'Proxy error' }));
  request.on('timeout', () => { request.destroy(); res.status(504).json({ error: 'Timeout' }); });
});

const PORT = process.env.PORT || 5000;

getDB().then(async () => {
  await seedData();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(console.error);