require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getDB, run, get } = require('./db/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
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
      content: `<p>Minimalism in design isn't about removing everything—it's about keeping only what matters. In a world overflowing with information, the ability to distill complexity into elegant simplicity is perhaps the most valuable skill a designer can possess.</p>

<h2>The Core Principles</h2>
<p>Great minimalist design starts with a ruthless editorial eye. Every element must justify its existence. Ask yourself: does this serve the user's goal, or does it merely satisfy my creative impulse? The answer determines what stays.</p>

<p>White space is not empty space—it's breathing room. It creates focus, guides the eye, and gives the important elements room to speak. When you eliminate the noise, the signal becomes unmistakable.</p>

<h2>Typography as the Foundation</h2>
<p>In minimalist design, typography carries enormous weight. When you strip away decorative elements, the quality of your type choices becomes undeniable. A beautifully set paragraph of text can be more visually compelling than any illustration.</p>

<p>Choose typefaces with purpose. A geometric sans-serif communicates precision and modernity; a humanist serif conveys warmth and tradition. Let the subject matter guide your choices, not trend or habit.</p>

<h2>Color with Intention</h2>
<p>Restraint in color amplifies impact. A single well-chosen accent color against a neutral field creates more visual tension than a rainbow of competing hues. Study the masters—Dieter Rams' industrial designs, Massimo Vignelli's wayfinding systems—and notice how much they achieve with how little.</p>

<p>The discipline of minimalism is ultimately a practice in clarity of thought. When you can't hide behind decoration, every decision becomes a statement about your values and your understanding of the problem you're solving.</p>`
    },
    {
      title: 'Building Resilient APIs: Lessons from Production',
      category: 'Technology',
      cover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
      content: `<p>Every API that survives contact with real users carries battle scars. The ones that thrive do so because their designers anticipated failure, planned for ambiguity, and built systems that degrade gracefully under pressure.</p>

<h2>Design for Failure First</h2>
<p>The single biggest shift in my thinking about API design came when I stopped asking "how will this work?" and started asking "how will this fail?" Network partitions happen. Third-party services go down. Databases run out of connections. Users send malformed requests. Your API's behavior in these moments defines its character.</p>

<p>Circuit breakers, timeouts, and retry logic with exponential backoff aren't optional optimizations—they're the price of admission for production systems. Build them in from the start, not as afterthoughts when your 3am pager starts screaming.</p>

<h2>Idempotency is Non-Negotiable</h2>
<p>Make every mutating operation idempotent. Accept an idempotency key from clients. If a request fails mid-flight, the client should be able to safely retry it without creating duplicate state. This single principle will save you from an entire category of subtle, hard-to-debug bugs.</p>

<h2>Version from Day One</h2>
<p>You will need to change your API. Plan for it. Whether you use URL versioning, header versioning, or content negotiation matters less than making a choice and committing to it before your first external consumer. Breaking changes without versioning is a contract violation.</p>

<p>The APIs that stand the test of time are the ones that respected their consumers enough to be honest about their limitations and disciplined enough to maintain their contracts.</p>`
    },
    {
      title: 'On Deep Work and the Attention Economy',
      category: 'Productivity',
      cover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      content: `<p>We are living through the largest attention heist in human history. The platforms we use daily have been engineered by some of the world's most talented engineers to capture and hold our focus, monetizing the minutes we spend in their spaces. Understanding this isn't pessimism—it's the first step toward reclaiming your cognitive sovereignty.</p>

<h2>The Value of Undivided Attention</h2>
<p>Cal Newport's concept of "deep work" describes the ability to focus without distraction on a cognitively demanding task. This capacity, he argues, is becoming increasingly rare and increasingly valuable. The knowledge worker who can sustain concentration for three or four hours on a hard problem produces work that the distracted worker cannot match, regardless of how many hours the latter puts in.</p>

<p>The math is straightforward: two hours of genuine focus outperforms eight hours of fragmented, interruption-laced effort on complex tasks. Yet we organize our days as if the opposite were true.</p>

<h2>Creating the Conditions</h2>
<p>Deep work doesn't happen by accident. It requires deliberate design of your environment and schedule. Identify your peak cognitive hours—the window when your mind is sharpest—and protect that time with the same ferocity you'd protect a meeting with your most important client. Because that's what it is.</p>

<p>Remove friction from focus and add friction to distraction. Close the tabs. Put the phone in another room. Let the notifications pile up. They will still be there when you emerge, and you will handle them with the clarity of someone who has actually done something meaningful with their day.</p>`
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

    // Add some comments
    const commentId = uuidv4();
    run('INSERT INTO comments (id, content, post_id, author_id) VALUES (?, ?, ?, ?)',
      [commentId, 'Really insightful perspective. This changed how I think about the topic.', id, adminId]);
  }
}

app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/posts/:slug/comments', require('./routes/comments'));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

getDB().then(async () => {
  await seedData();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(console.error);
