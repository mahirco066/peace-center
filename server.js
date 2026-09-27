const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 10000;
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
fs.mkdirSync(DATA_DIR, { recursive: true });

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'peace-files';
const supabase = USE_SUPABASE ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
}) : null;

const initial = {
  settings: {
    siteTitle: 'مركز دراسات السلام والتنمية',
    subtitle: 'جامعة السلام – ولاية غرب كردفان',
    aboutTitle: 'معرفة تخدم السلام والتنمية',
    aboutText1: 'يعمل مركز دراسات السلام والتنمية بجامعة السلام على دعم البحث العلمي والتعليم والتدريب في مجالات السلام والتنمية، مع تركيز خاص على قضايا غرب كردفان والمجتمعات المحلية.',
    aboutText2: 'نسعى إلى تحويل المعرفة والدراسات إلى برامج ومبادرات عملية تعزز الحوار والتعايش والتنمية المستدامة.'
  },
  announcements: [
    { id: 'a1', text: '📢 مركز دراسات السلام والتنمية يعلن عن بدء التسجيل في البرامج التدريبية' },
    { id: 'a2', text: 'ندوة علمية: السلام والتنمية المستدامة في غرب كردفان' },
    { id: 'a3', text: 'تابع أحدث البحوث والدراسات والأنشطة العلمية للمركز' }
  ],
  programs: [
    { id: 'p1', title: 'بناء السلام', text: 'تعزيز ثقافة السلام والتعايش والحوار المجتمعي' },
    { id: 'p2', title: 'التنمية المستدامة', text: 'دعم مبادرات التنمية والمشروعات المجتمعية المستدامة' },
    { id: 'p3', title: 'التدريب وبناء القدرات', text: 'تأهيل الكوادر وتطوير المهارات لخدمة المجتمع والتنمية' },
    { id: 'p4', title: 'البحوث والدراسات', text: 'إنتاج المعرفة وإجراء البحوث العلمية التي تسهم في قضايا السلام والتنمية' }
  ],
  news: [
    { id: 'n1', title: 'ندوة علمية حول السلام والتنمية المستدامة', text: 'فعالية علمية تجمع الباحثين والمهتمين بقضايا السلام والتنمية.', date: '2026-09-20', image: '' },
    { id: 'n2', title: 'برنامج تدريبي لبناء القدرات', text: 'برنامج تدريبي يستهدف تطوير مهارات الكوادر والمبادرات المحلية.', date: '2026-09-15', image: '' }
  ],
  documents: [],
  hero: [
    { id: 'h1', image: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Baobab_vibes_01.jpg', caption: 'شجرة التبلدي في غرب كردفان', source: 'Wikimedia Commons · CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Baobab_vibes_01.jpg' },
    { id: 'h2', image: 'https://upload.wikimedia.org/wikipedia/commons/6/60/%D8%AE%D8%B1%D9%81%D8%A7%D9%86_%D9%81%D9%8A_%D9%85%D9%86%D8%B7%D9%82%D8%A9_%D8%A7%D9%84%D8%AE%D9%88%D9%8A.jpg', caption: 'قطيع الخرفان في منطقة الخوي بغرب كردفان', source: 'Wikimedia Commons · CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:%D8%AE%D8%B1%D9%81%D8%A7%D9%86_%D9%81%D9%8A_%D9%85%D9%86%D8%B7%D9%82%D8%A9_%D8%A7%D9%84%D8%AE%D9%88%D9%8A.jpg' }
  ]
};

function cloneInitial() { return JSON.parse(JSON.stringify(initial)); }
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(password, stored) {
  const [salt, key] = String(stored || '').split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(key, 'hex');
  const b = Buffer.from(derived, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function id() { return crypto.randomUUID(); }

function loadLocal() {
  if (!fs.existsSync(DB_FILE)) {
    const db = cloneInitial();
    db.admin = { username: process.env.ADMIN_USERNAME || 'admin', passwordHash: hashPassword(process.env.ADMIN_PASSWORD || 'Peace@2026') };
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}
function saveLocal(db) { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }

async function getSupabaseData() {
  const { data, error } = await supabase.from('site_data').select('*').eq('id', 1).maybeSingle();
  if (error) throw error;
  if (!data) {
    const seed = cloneInitial();
    const { error: insErr } = await supabase.from('site_data').insert({ id: 1, settings: seed.settings, announcements: seed.announcements, programs: seed.programs, news: seed.news, documents: seed.documents, hero: seed.hero });
    if (insErr) throw insErr;
    return seed;
  }
  return {
    settings: data.settings || {}, announcements: data.announcements || [], programs: data.programs || [],
    news: data.news || [], documents: data.documents || [], hero: data.hero || []
  };
}
async function saveSupabaseData(db) {
  const { error } = await supabase.from('site_data').update({ settings: db.settings, announcements: db.announcements, programs: db.programs, news: db.news, documents: db.documents, hero: db.hero, updated_at: new Date().toISOString() }).eq('id', 1);
  if (error) throw error;
}
async function getData() { return USE_SUPABASE ? getSupabaseData() : loadLocal(); }
async function saveData(db) { return USE_SUPABASE ? saveSupabaseData(db) : saveLocal(db); }

async function ensureAdmin() {
  if (!USE_SUPABASE) return;
  const { data, error } = await supabase.from('admin_users').select('id,username,password_hash').limit(1).maybeSingle();
  if (error) throw error;
  if (!data) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'Peace@2026';
    const { error: insErr } = await supabase.from('admin_users').insert({ username, password_hash: hashPassword(password) });
    if (insErr) throw insErr;
  }
}
async function getAdmin() {
  if (!USE_SUPABASE) return loadLocal().admin;
  const { data, error } = await supabase.from('admin_users').select('id,username,password_hash').limit(1).single();
  if (error) throw error;
  return data;
}

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(PUBLIC));

// Explicit homepage route so Render always serves the main site at /
app.get('/', (_req, res) => res.sendFile(path.join(PUBLIC, 'index.html')));

const sessions = new Map();
function createSession(username) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, { username, expires: Date.now() + 8 * 60 * 60 * 1000 });
  return token;
}
function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const s = token && sessions.get(token);
  if (!s || s.expires < Date.now()) return res.status(401).json({ error: 'غير مصرح' });
  next();
}

app.post('/api/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    const admin = await getAdmin();
    if (username !== admin.username || !verifyPassword(password || '', admin.password_hash || admin.passwordHash)) return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    res.json({ token: createSession(username), username });
  } catch (e) { next(e); }
});
app.post('/api/logout', auth, (req, res) => { sessions.delete(req.headers.authorization.replace('Bearer ', '')); res.json({ ok: true }); });

app.get('/api/public', async (_req, res, next) => {
  try { res.json(await getData()); } catch (e) { next(e); }
});
app.get('/api/admin', auth, async (_req, res, next) => {
  try { const d = await getData(); const a = await getAdmin(); res.json({ ...d, admin: { username: a.username } }); } catch (e) { next(e); }
});

const collections = ['announcements', 'programs', 'news', 'documents', 'hero'];
for (const key of collections) {
  app.post(`/api/admin/${key}`, auth, async (req, res, next) => {
    try { const db = await getData(); const item = { ...req.body, id: id() }; db[key].unshift(item); await saveData(db); res.json(item); } catch (e) { next(e); }
  });
  app.put(`/api/admin/${key}/:id`, auth, async (req, res, next) => {
    try { const db = await getData(); const i = db[key].findIndex(x => x.id === req.params.id); if (i < 0) return res.status(404).json({ error: 'العنصر غير موجود' }); db[key][i] = { ...db[key][i], ...req.body, id: req.params.id }; await saveData(db); res.json(db[key][i]); } catch (e) { next(e); }
  });
  app.delete(`/api/admin/${key}/:id`, auth, async (req, res, next) => {
    try { const db = await getData(); const old = db[key].find(x => x.id === req.params.id); if (!old) return res.status(404).json({ error: 'العنصر غير موجود' }); db[key] = db[key].filter(x => x.id !== req.params.id); await saveData(db); res.json({ ok: true }); } catch (e) { next(e); }
  });
}

app.put('/api/admin/settings', auth, async (req, res, next) => {
  try { const db = await getData(); db.settings = { ...db.settings, ...req.body }; await saveData(db); res.json(db.settings); } catch (e) { next(e); }
});
app.put('/api/admin/account', auth, async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password || password.length < 8) return res.status(400).json({ error: 'أدخل اسم مستخدم وكلمة مرور من 8 أحرف على الأقل' });
    if (USE_SUPABASE) {
      const a = await getAdmin();
      const { error } = await supabase.from('admin_users').update({ username, password_hash: hashPassword(password), updated_at: new Date().toISOString() }).eq('id', a.id);
      if (error) throw error;
    } else {
      const db = loadLocal(); db.admin.username = username; db.admin.passwordHash = hashPassword(password); saveLocal(db);
    }
    sessions.clear();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 }, fileFilter: (_req, file, cb) => {
  const allowed = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|jpg|jpeg|png|webp)$/i;
  cb(allowed.test(file.originalname) ? null : new Error('نوع الملف غير مسموح'), allowed.test(file.originalname));
}});

app.post('/api/admin/upload', auth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'لم يتم اختيار ملف' });
    if (!USE_SUPABASE) {
      const uploads = path.join(ROOT, 'uploads'); fs.mkdirSync(uploads, { recursive: true });
      const ext = path.extname(req.file.originalname).toLowerCase();
      const filename = `${Date.now()}-${crypto.randomBytes(5).toString('hex')}${ext}`;
      fs.writeFileSync(path.join(uploads, filename), req.file.buffer);
      return res.json({ url: `/uploads/${filename}`, name: req.file.originalname, size: req.file.size, type: req.file.mimetype });
    }
    const ext = path.extname(req.file.originalname).toLowerCase();
    const safeBase = path.basename(req.file.originalname, ext).replace(/[^\p{L}\p{N}_-]+/gu, '-').slice(0, 80) || 'file';
    const objectPath = `${Date.now()}-${crypto.randomBytes(5).toString('hex')}-${safeBase}${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(objectPath, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
    res.json({ url: data.publicUrl, name: req.file.originalname, size: req.file.size, type: req.file.mimetype, storagePath: objectPath });
  } catch (e) { next(e); }
});

app.delete('/api/admin/upload/:filename', auth, async (req, res, next) => {
  try {
    const filename = req.params.filename;
    if (!USE_SUPABASE) {
      const p = path.join(ROOT, 'uploads', path.basename(filename)); if (fs.existsSync(p)) fs.unlinkSync(p); return res.json({ ok: true });
    }
    const { error } = await supabase.storage.from(BUCKET).remove([filename]);
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) { next(e); }
});

app.get('/admin', (_req, res) => res.sendFile(path.join(PUBLIC, 'admin.html')));
app.get('/api/health', async (_req, res) => res.json({ ok: true, database: USE_SUPABASE ? 'supabase' : 'local' }));

app.use((err, _req, res, _next) => { console.error(err); res.status(400).json({ error: err.message || 'حدث خطأ' }); });

(async () => {
  try {
    if (USE_SUPABASE) {
      await ensureAdmin();
      await getSupabaseData();
      console.log('Supabase database and admin are ready.');
    } else {
      console.log('Supabase variables are missing; local JSON fallback is active.');
    }
    app.listen(PORT, () => console.log(`Peace Center running on ${PORT}`));
  } catch (e) {
    console.error('Startup failed:', e);
    process.exit(1);
  }
})();
