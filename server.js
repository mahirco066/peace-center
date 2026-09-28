const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();

const PORT = process.env.PORT || 10000;
const ROOT = __dirname;

/* =========================================================
   تحديد مجلد الموقع
========================================================= */

function findPublicDir() {
  const candidates = [
    path.join(ROOT, 'public'),
    path.join(ROOT, 'peace-center', 'public'),
    path.join(ROOT, 'website', 'public'),
    ROOT
  ];

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'index.html'))) {
      return dir;
    }
  }

  function scan(dir, depth) {
    if (depth < 0) return null;

    if (fs.existsSync(path.join(dir, 'index.html'))) {
      return dir;
    }

    let entries = [];

    try {
      entries = fs.readdirSync(dir, {
        withFileTypes: true
      });
    } catch (error) {
      return null;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      if (
        ['node_modules', '.git', '.cache'].includes(
          entry.name
        )
      ) {
        continue;
      }

      const found = scan(
        path.join(dir, entry.name),
        depth - 1
      );

      if (found) return found;
    }

    return null;
  }

  return scan(ROOT, 3) || path.join(ROOT, 'public');
}

const PUBLIC = findPublicDir();

console.log('Website files directory:', PUBLIC);

/* =========================================================
   إعداد البيانات
========================================================= */

const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

fs.mkdirSync(DATA_DIR, {
  recursive: true
});

const UPLOAD_DIR = path.join(ROOT, 'uploads');

fs.mkdirSync(UPLOAD_DIR, {
  recursive: true
});

/* =========================================================
   Supabase
========================================================= */

const SUPABASE_URL =
  process.env.SUPABASE_URL || '';

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const USE_SUPABASE = Boolean(
  SUPABASE_URL &&
  SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET ||
  'peace-files';

const supabase = USE_SUPABASE
  ? createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null;

/* =========================================================
   البيانات الأولية
========================================================= */

const initial = {
  settings: {
    siteTitle:
      'مركز دراسات السلام والتنمية',

    subtitle:
      'جامعة السلام – ولاية غرب كردفان',

    aboutTitle:
      'معرفة تخدم السلام والتنمية',

    aboutText1:
      'يعمل مركز دراسات السلام والتنمية بجامعة السلام على دعم البحث العلمي والتعليم والتدريب في مجالات السلام والتنمية، مع تركيز خاص على قضايا غرب كردفان والمجتمعات المحلية.',

    aboutText2:
      'نسعى إلى تحويل المعرفة والدراسات إلى برامج ومبادرات عملية تعزز الحوار والتعايش والتنمية المستدامة.',

    phone:
      '+249 121 145 757',

    email:
      'info@alsalam.edu.sd',

    address:
      'جامعة السلام – ولاية غرب كردفان',

    footerSlogan:
      'معًا من أجل سلام مستدام وتنمية شاملة',

    logo:
      'center.jpg',

    cms: {
      services: [
        {
          id: 's1',
          title: 'البحوث والدراسات',
          text:
            'إنتاج المعرفة وإجراء البحوث العلمية التي تسهم في قضايا السلام والتنمية',
          icon: '🔬',
          color: 'blue',
          image: '',
          link: '#research',
          order: 1,
          visible: true
        },
        {
          id: 's2',
          title: 'بناء السلام',
          text:
            'تعزيز ثقافة السلام والتعايش والحوار المجتمعي',
          icon: '🕊️',
          color: 'gold',
          image: '',
          link: '#programs',
          order: 2,
          visible: true
        },
        {
          id: 's3',
          title: 'التنمية المستدامة',
          text:
            'دعم مبادرات التنمية والمشروعات المجتمعية المستدامة',
          icon: '🌱',
          color: 'green',
          image: '',
          link: '#programs',
          order: 3,
          visible: true
        },
        {
          id: 's4',
          title: 'التدريب وبناء القدرات',
          text:
            'تأهيل الكوادر وتطوير المهارات لخدمة المجتمع والتنمية',
          icon: '🎓',
          color: 'purple',
          image: '',
          link: '#programs',
          order: 4,
          visible: true
        }
      ],

      stats: [
        {
          id: 'st1',
          number: '20+',
          label: 'مشاريع تنموية',
          icon: '🏗️',
          order: 1,
          visible: true
        },
        {
          id: 'st2',
          number: '15+',
          label: 'دورات تدريبية',
          icon: '🎓',
          order: 2,
          visible: true
        },
        {
          id: 'st3',
          number: '50+',
          label: 'مستفيدين',
          icon: '👥',
          order: 3,
          visible: true
        },
        {
          id: 'st4',
          number: '100+',
          label: 'بحث ودراسة',
          icon: '📚',
          order: 4,
          visible: true
        }
      ],

      research: [
        {
          id: 'r1',
          title:
            'دراسات السلام والتنمية في غرب كردفان',
          text:
            'دراسات وبحوث علمية تتناول قضايا السلام والتنمية والمجتمع المحلي.',
          image: '',
          file: '',
          order: 1,
          visible: true
        },
        {
          id: 'r2',
          title:
            'البحث العلمي وخدمة المجتمع',
          text:
            'إنتاج المعرفة وربط البحث العلمي باحتياجات المجتمع والتنمية.',
          image: '',
          file: '',
          order: 2,
          visible: true
        }
      ],

      media: [],

      pages: [],

      navigation: [
        {
          id: 'nav1',
          title: 'الرئيسية',
          url: '#home',
          order: 1,
          visible: true
        },
        {
          id: 'nav2',
          title: 'عن المركز',
          url: '#about',
          order: 2,
          visible: true
        },
        {
          id: 'nav3',
          title: 'البحوث والدراسات',
          url: '#research',
          order: 3,
          visible: true
        },
        {
          id: 'nav4',
          title: 'البرامج',
          url: '#programs',
          order: 4,
          visible: true
        },
        {
          id: 'nav5',
          title: 'الأخبار',
          url: '#news',
          order: 5,
          visible: true
        },
        {
          id: 'nav6',
          title: 'اتصل بنا',
          url: '#contact',
          order: 6,
          visible: true
        }
      ],

      homepage: {
        kicker:
          'مركز دراسات السلام والتنمية',

        title:
          'المعرفة والبحث العلمي من أجل السلام والتنمية المستدامة في السودان',

        description:
          'منصة أكاديمية للبحث والحوار وبناء القدرات، ودعم المبادرات التي تسهم في مجتمعات أكثر سلامًا وتماسكًا وتنمية.',

        buttonText:
          'اكتشف المزيد ←',

        buttonLink:
          '#about',

        tagline:
          'معًا من أجل سلام وتنمية مستدامة'
      }
    }
  },

  announcements: [
    {
      id: 'a1',
      text:
        '📢 مركز دراسات السلام والتنمية يعلن عن بدء التسجيل في البرامج التدريبية'
    },
    {
      id: 'a2',
      text:
        'ندوة علمية: السلام والتنمية المستدامة في غرب كردفان'
    },
    {
      id: 'a3',
      text:
        'تابع أحدث البحوث والدراسات والأنشطة العلمية للمركز'
    }
  ],

  programs: [
    {
      id: 'p1',
      title: 'بناء السلام',
      text:
        'تعزيز ثقافة السلام والتعايش والحوار المجتمعي'
    },
    {
      id: 'p2',
      title: 'التنمية المستدامة',
      text:
        'دعم مبادرات التنمية والمشروعات المجتمعية المستدامة'
    },
    {
      id: 'p3',
      title: 'التدريب وبناء القدرات',
      text:
        'تأهيل الكوادر وتطوير المهارات لخدمة المجتمع والتنمية'
    },
    {
      id: 'p4',
      title: 'البحوث والدراسات',
      text:
        'إنتاج المعرفة وإجراء البحوث العلمية التي تسهم في قضايا السلام والتنمية'
    }
  ],

  news: [
    {
      id: 'n1',
      title:
        'ندوة علمية حول السلام والتنمية المستدامة',
      text:
        'فعالية علمية تجمع الباحثين والمهتمين بقضايا السلام والتنمية.',
      date: '2026-09-20',
      image: ''
    },
    {
      id: 'n2',
      title:
        'برنامج تدريبي لبناء القدرات',
      text:
        'برنامج تدريبي يستهدف تطوير مهارات الكوادر والمبادرات المحلية.',
      date: '2026-09-15',
      image: ''
    }
  ],

  documents: [],

  hero: [
    {
      id: 'h1',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/2/2b/Baobab_vibes_01.jpg',
      caption:
        'شجرة التبلدي في غرب كردفان',
      source:
        'Wikimedia Commons · CC BY-SA 4.0',
      url:
        'https://commons.wikimedia.org/wiki/File:Baobab_vibes_01.jpg'
    },
    {
      id: 'h2',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/6/60/%D8%AE%D8%B1%D9%81%D8%A7%D9%86_%D9%81%D9%8A_%D9%85%D9%86%D8%B7%D9%82%D8%A9_%D8%A7%D9%84%D8%AE%D9%88%D9%8A.jpg',
      caption:
        'قطيع الخرفان في منطقة الخوي بغرب كردفان',
      source:
        'Wikimedia Commons · CC BY-SA 4.0',
      url:
        'https://commons.wikimedia.org/wiki/File:%D8%AE%D8%B1%D9%81%D8%A7%D9%86_%D9%81%D9%8A_%D9%85%D9%86%D8%B7%D9%82%D8%A9_%D8%A7%D9%84%D8%AE%D9%88%D9%8A.jpg'
    }
  ]
};

/* =========================================================
   أدوات عامة
========================================================= */

function cloneInitial() {
  return JSON.parse(
    JSON.stringify(initial)
  );
}

function createId() {
  return crypto.randomUUID();
}

/* =========================================================
   تشفير كلمة المرور
========================================================= */

function hashPassword(
  password,
  salt = crypto.randomBytes(16).toString('hex')
) {
  const hash = crypto
    .scryptSync(password, salt, 64)
    .toString('hex');

  return salt + ':' + hash;
}

function verifyPassword(
  password,
  stored
) {
  const parts =
    String(stored || '').split(':');

  const salt = parts[0];
  const key = parts[1];

  if (!salt || !key) {
    return false;
  }

  const derived = crypto
    .scryptSync(password, salt, 64)
    .toString('hex');

  const a = Buffer.from(
    key,
    'hex'
  );

  const b = Buffer.from(
    derived,
    'hex'
  );

  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    a,
    b
  );
}

/* =========================================================
   توحيد بيانات CMS
========================================================= */

function ensureCms(db) {
  if (!db.settings) {
    db.settings = {};
  }

  if (!db.settings.cms) {
    db.settings.cms = {};
  }

  const cms = db.settings.cms;

  if (!Array.isArray(cms.services)) {
    cms.services = [];
  }

  if (!Array.isArray(cms.stats)) {
    cms.stats = [];
  }

  if (!Array.isArray(cms.research)) {
    cms.research = [];
  }

  if (!Array.isArray(cms.media)) {
    cms.media = [];
  }

  if (!Array.isArray(cms.pages)) {
    cms.pages = [];
  }

  if (!Array.isArray(cms.navigation)) {
    cms.navigation = [];
  }

  if (!cms.homepage) {
    cms.homepage = {};
  }

  return db;
}

/* =========================================================
   قاعدة البيانات المحلية
========================================================= */

function loadLocal() {
  if (!fs.existsSync(DB_FILE)) {
    const db = cloneInitial();

    db.admin = {
      username:
        process.env.ADMIN_USERNAME ||
        'admin',

      passwordHash:
        hashPassword(
          process.env.ADMIN_PASSWORD ||
          'Peace@2026'
        )
    };

    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(db, null, 2),
      'utf8'
    );
  }

  const db =
    JSON.parse(
      fs.readFileSync(
        DB_FILE,
        'utf8'
      )
    );

  ensureCms(db);

  return db;
}

function saveLocal(db) {
  ensureCms(db);

  fs.writeFileSync(
    DB_FILE,
    JSON.stringify(
      db,
      null,
      2
    ),
    'utf8'
  );
}

/* =========================================================
   قاعدة بيانات Supabase
========================================================= */

async function getSupabaseData() {
  const result =
    await supabase
      .from('site_data')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

  if (result.error) {
    throw result.error;
  }

  if (!result.data) {
    const seed =
      cloneInitial();

    const insertResult =
      await supabase
        .from('site_data')
        .insert({
          id: 1,
          settings:
            seed.settings,
          announcements:
            seed.announcements,
          programs:
            seed.programs,
          news:
            seed.news,
          documents:
            seed.documents,
          hero:
            seed.hero
        })
        .select()
        .single();

    if (insertResult.error) {
      throw insertResult.error;
    }

    const db =
      insertResult.data;

    ensureCms(db);

    return db;
  }

  const db =
    result.data;

  ensureCms(db);

  return db;
}

async function saveSupabaseData(db) {
  ensureCms(db);

  const result =
    await supabase
      .from('site_data')
      .update({
        settings:
          db.settings,

        announcements:
          db.announcements || [],

        programs:
          db.programs || [],

        news:
          db.news || [],

        documents:
          db.documents || [],

        hero:
          db.hero || []
      })
      .eq('id', 1);

  if (result.error) {
    throw result.error;
  }

  return db;
}

async function getData() {
  if (USE_SUPABASE) {
    return getSupabaseData();
  }

  return loadLocal();
}

async function saveData(db) {
  if (USE_SUPABASE) {
    return saveSupabaseData(db);
  }

  saveLocal(db);

  return db;
}

/* =========================================================
   Express
========================================================= */

app.use(
  express.json({
    limit: '20mb'
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '20mb'
  })
);

/* =========================================================
   الجلسات
========================================================= */

const sessions = new Map();

function createSession(username) {
  const token =
    crypto.randomBytes(32).toString('hex');

  sessions.set(token, {
    username,
    createdAt: Date.now()
  });

  return token;
}

function getTokenFromRequest(req) {
  const header =
    req.headers.authorization || '';

  if (header.startsWith('Bearer ')) {
    return header.slice(7);
  }

  return req.headers['x-admin-token'] || '';
}

function requireAdmin(
  req,
  res,
  next
) {
  const token =
    getTokenFromRequest(req);

  if (!token || !sessions.has(token)) {
    return res.status(401).json({
      ok: false,
      error: 'غير مصرح'
    });
  }

  req.admin =
    sessions.get(token);

  next();
}

/* =========================================================
   تسجيل الدخول
========================================================= */

app.post(
  '/api/login',
  async (req, res) => {
    try {
      const username =
        String(
          req.body.username || ''
        ).trim();

      const password =
        String(
          req.body.password || ''
        );

      if (!username || !password) {
        return res.status(400).json({
          ok: false,
          error:
            'يرجى إدخال اسم المستخدم وكلمة المرور'
        });
      }

      const db =
        await getData();

      const savedUsername =
        process.env.ADMIN_USERNAME ||
        (db.admin &&
          db.admin.username) ||
        'admin';

      const savedPassword =
        process.env.ADMIN_PASSWORD || '';

      let valid = false;

      if (savedPassword) {
        valid =
          username === savedUsername &&
          password === savedPassword;
      } else {
        if (
          db.admin &&
          db.admin.passwordHash
        ) {
          valid =
            username === savedUsername &&
            verifyPassword(
              password,
              db.admin.passwordHash
            );
        } else {
          valid =
            username === 'admin' &&
            password === 'Peace@2026';
        }
      }

      if (!valid) {
        return res.status(401).json({
          ok: false,
          error:
            'اسم المستخدم أو كلمة المرور غير صحيحة'
        });
      }

      const token =
        createSession(username);

      return res.json({
        ok: true,
        token,
        username
      });
    } catch (error) {
      console.error(
        'Login error:',
        error
      );

      return res.status(500).json({
        ok: false,
        error:
          'حدث خطأ أثناء تسجيل الدخول'
      });
    }
  }
);

/* Alias */

app.post(
  '/api/admin/login',
  async (req, res) => {
    req.url = '/api/login';

    const username =
      String(
        req.body.username || ''
      ).trim();

    const password =
      String(
        req.body.password || ''
      );

    try {
      const db =
        await getData();

      const savedUsername =
        process.env.ADMIN_USERNAME ||
        (db.admin &&
          db.admin.username) ||
        'admin';

      let valid = false;

      if (process.env.ADMIN_PASSWORD) {
        valid =
          username === savedUsername &&
          password ===
            process.env.ADMIN_PASSWORD;
      } else {
        valid =
          username === savedUsername &&
          verifyPassword(
            password,
            db.admin.passwordHash
          );
      }

      if (!valid) {
        return res.status(401).json({
          ok: false,
          error:
            'اسم المستخدم أو كلمة المرور غير صحيحة'
        });
      }

      const token =
        createSession(username);

      return res.json({
        ok: true,
        token,
        username
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        ok: false,
        error:
          'حدث خطأ أثناء تسجيل الدخول'
      });
    }
  }
);

/* =========================================================
   تسجيل الخروج
========================================================= */

app.post(
  '/api/logout',
  requireAdmin,
  (req, res) => {
    const token =
      getTokenFromRequest(req);

    sessions.delete(token);

    res.json({
      ok: true
    });
  }
);

/* =========================================================
   بيانات الموقع العامة
========================================================= */

app.get(
  '/api/public',
  async (req, res) => {
    try {
      const db =
        await getData();

      res.json({
        ok: true,
        settings:
          db.settings || {},

        announcements:
          db.announcements || [],

        programs:
          db.programs || [],

        news:
          db.news || [],

        documents:
          db.documents || [],

        hero:
          db.hero || []
      });
    } catch (error) {
      console.error(
        'Public API error:',
        error
      );

      res.status(500).json({
        ok: false,
        error:
          'تعذر تحميل بيانات الموقع'
      });
    }
  }
);

/* =========================================================
   لوحة التحكم
========================================================= */

app.get(
  '/api/admin',
  requireAdmin,
  async (req, res) => {
    try {
      const db =
        await getData();

      res.json({
        ok: true,
        data: db
      });
    } catch (error) {
      console.error(
        'Admin API error:',
        error
      );

      res.status(500).json({
        ok: false,
        error:
          'تعذر تحميل بيانات لوحة التحكم'
      });
    }
  }
);

/* =========================================================
   الإعدادات العامة
========================================================= */

app.get(
  '/api/settings',
  requireAdmin,
  async (req, res) => {
    const db =
      await getData();

    res.json({
      ok: true,
      data:
        db.settings || {}
    });
  }
);

app.put(
  '/api/settings',
  requireAdmin,
  async (req, res) => {
    try {
      const db =
        await getData();

      db.settings = {
        ...db.settings,
        ...(req.body || {})
      };

      ensureCms(db);

      await saveData(db);

      res.json({
        ok: true,
        data: db.settings
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        ok: false,
        error:
          'تعذر حفظ الإعدادات'
      });
    }
  }
);

/* =========================================================
   الصفحة الرئيسية
========================================================= */

app.get(
  '/api/homepage',
  requireAdmin,
  async (req, res) => {
    const db =
      await getData();

    res.json({
      ok: true,
      data:
        db.settings.cms.homepage
    });
  }
);

app.put(
  '/api/homepage',
  requireAdmin,
  async (req, res) => {
    try {
      const db =
        await getData();

      ensureCms(db);

      db.settings.cms.homepage = {
        ...db.settings.cms.homepage,
        ...(req.body || {})
      };

      await saveData(db);

      res.json({
        ok: true,
        data:
          db.settings.cms.homepage
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        ok: false,
        error:
          'تعذر حفظ الصفحة الرئيسية'
      });
    }
  }
);

/* =========================================================
   أدوات CRUD
========================================================= */

function sortItems(items) {
  return [...items].sort(
    (a, b) =>
      Number(a.order || 0) -
      Number(b.order || 0)
  );
}

async function listCmsCollection(
  collection
) {
  const db =
    await getData();

  ensureCms(db);

  return sortItems(
    db.settings.cms[collection] || []
  );
}

async function createCmsItem(
  collection,
  item
) {
  const db =
    await getData();

  ensureCms(db);

  const items =
    db.settings.cms[collection];

  const newItem = {
    ...item,
    id:
      item.id ||
      createId()
  };

  if (
    newItem.order === undefined
  ) {
    newItem.order =
      items.length + 1;
  }

  items.push(newItem);

  await saveData(db);

  return newItem;
}

async function updateCmsItem(
  collection,
  itemId,
  changes
) {
  const db =
    await getData();

  ensureCms(db);

  const items =
    db.settings.cms[collection];

  const index =
    items.findIndex(
      item =>
        String(item.id) ===
        String(itemId)
    );

  if (index === -1) {
    return null;
  }

  items[index] = {
    ...items[index],
    ...(changes || {}),
    id: items[index].id
  };

  await saveData(db);

  return items[index];
}

async function deleteCmsItem(
  collection,
  itemId
) {
  const db =
    await getData();

  ensureCms(db);

  const items =
    db.settings.cms[collection];

  const index =
    items.findIndex(
      item =>
        String(item.id) ===
        String(itemId)
    );

  if (index === -1) {
    return false;
  }

  items.splice(index, 1);

  await saveData(db);

  return true;
}

/* =========================================================
   Services
========================================================= */

app.get(
  '/api/admin/services',
  requireAdmin,
  async (req, res) => {
    res.json({
      ok: true,
      data:
        await listCmsCollection(
          'services'
        )
    });
  }
);

app.post(
  '/api/admin/services',
  requireAdmin,
  async (req, res) => {
    try {
      const item =
        await createCmsItem(
          'services',
          req.body || {}
        );

      res.json({
        ok: true,
        data: item
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        ok: false,
        error:
          'تعذر إضافة الخدمة'
      });
    }
  }
);

app.put(
  '/api/admin/services/:id',
  requireAdmin,
  async (req, res) => {
    try {
      const item =
        await updateCmsItem(
          'services',
          req.params.id,
          req.body || {}
        );

      if (!item) {
        return res.status(404).json({
          ok: false,
          error:
            'الخدمة غير موجودة'
        });
      }

      res.json({
        ok: true,
        data: item
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        ok: false,
        error:
          'تعذر تعديل الخدمة'
      });
    }
  }
);

app.delete(
  '/api/admin/services/:id',
  requireAdmin,
  async (req, res) => {
    try {
      const deleted =
        await deleteCmsItem(
          'services',
          req.params.id
        );

      if (!deleted) {
        return res.status(404).json({
          ok: false,
          error:
            'الخدمة غير موجودة'
        });
      }

      res.json({
        ok: true
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        ok: false,
        error:
          'تعذر حذف الخدمة'
      });
    }
  }
);

/* =========================================================
   Stats
========================================================= */

app.get(
  '/api/admin/stats',
  requireAdmin,
  async (req, res) => {
    res.json({
      ok: true,
      data:
        await listCmsCollection(
          'stats'
        )
    });
  }
);

app.post(
  '/api/admin/stats',
  requireAdmin,
  async (req, res) => {
    try {
      const item =
        await createCmsItem(
          'stats',
          req.body || {}
        );

      res.json({
        ok: true,
        data: item
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر إضافة الإحصائية'
      });
    }
  }
);

app.put(
  '/api/admin/stats/:id',
  requireAdmin,
  async (req, res) => {
    try {
      const item =
        await updateCmsItem(
          'stats',
          req.params.id,
          req.body || {}
        );

      if (!item) {
        return res.status(404).json({
          ok: false,
          error:
            'الإحصائية غير موجودة'
        });
      }

      res.json({
        ok: true,
        data: item
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر تعديل الإحصائية'
      });
    }
  }
);

app.delete(
  '/api/admin/stats/:id',
  requireAdmin,
  async (req, res) => {
    try {
      const deleted =
        await deleteCmsItem(
          'stats',
          req.params.id
        );

      if (!deleted) {
        return res.status(404).json({
          ok: false,
          error:
            'الإحصائية غير موجودة'
        });
      }

      res.json({
        ok: true
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر حذف الإحصائية'
      });
    }
  }
);

/* =========================================================
   Research
========================================================= */

app.get(
  '/api/admin/research',
  requireAdmin,
  async (req, res) => {
    res.json({
      ok: true,
      data:
        await listCmsCollection(
          'research'
        )
    });
  }
);

app.post(
  '/api/admin/research',
  requireAdmin,
  async (req, res) => {
    try {
      const item =
        await createCmsItem(
          'research',
          req.body || {}
        );

      res.json({
        ok: true,
        data: item
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر إضافة البحث'
      });
    }
  }
);

app.put(
  '/api/admin/research/:id',
  requireAdmin,
  async (req, res) => {
    try {
      const item =
        await updateCmsItem(
          'research',
          req.params.id,
          req.body || {}
        );

      if (!item) {
        return res.status(404).json({
          ok: false,
          error:
            'البحث غير موجود'
        });
      }

      res.json({
        ok: true,
        data: item
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر تعديل البحث'
      });
    }
  }
);

app.delete(
  '/api/admin/research/:id',
  requireAdmin,
  async (req, res) => {
    try {
      const deleted =
        await deleteCmsItem(
          'research',
          req.params.id
        );

      if (!deleted) {
        return res.status(404).json({
          ok: false,
          error:
            'البحث غير موجود'
        });
      }

      res.json({
        ok: true
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر حذف البحث'
      });
    }
  }
);

/* =========================================================
   Media
========================================================= */

app.get(
  '/api/admin/media',
  requireAdmin,
  async (req, res) => {
    res.json({
      ok: true,
      data:
        await listCmsCollection(
          'media'
        )
    });
  }
);

app.post(
  '/api/admin/media',
  requireAdmin,
  async (req, res) => {
    try {
      const item =
        await createCmsItem(
          'media',
          req.body || {}
        );

      res.json({
        ok: true,
        data: item
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر إضافة ملف الوسائط'
      });
    }
  }
);

app.put(
  '/api/admin/media/:id',
  requireAdmin,
  async (req, res) => {
    try {
      const item =
        await updateCmsItem(
          'media',
          req.params.id,
          req.body || {}
        );

      if (!item) {
        return res.status(404).json({
          ok: false,
          error:
            'ملف الوسائط غير موجود'
        });
      }

      res.json({
        ok: true,
        data: item
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر تعديل ملف الوسائط'
      });
    }
  }
);

app.delete(
  '/api/admin/media/:id',
  requireAdmin,
  async (req, res) => {
    try {
      const deleted =
        await deleteCmsItem(
          'media',
          req.params.id
        );

      if (!deleted) {
        return res.status(404).json({
          ok: false,
          error:
            'ملف الوسائط غير موجود'
        });
      }

      res.json({
        ok: true
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر حذف ملف الوسائط'
      });
    }
  }
);

/* =========================================================
   Pages
========================================================= */

app.get(
  '/api/admin/pages',
  requireAdmin,
  async (req, res) => {
    res.json({
      ok: true,
      data:
        await listCmsCollection(
          'pages'
        )
    });
  }
);

app.post(
  '/api/admin/pages',
  requireAdmin,
  async (req, res) => {
    try {
      const item =
        await createCmsItem(
          'pages',
          req.body || {}
        );

      res.json({
        ok: true,
        data: item
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر إضافة الصفحة'
      });
    }
  }
);

app.put(
  '/api/admin/pages/:id',
  requireAdmin,
  async (req, res) => {
    try {
      const item =
        await updateCmsItem(
          'pages',
          req.params.id,
          req.body || {}
        );

      if (!item) {
        return res.status(404).json({
          ok: false,
          error:
            'الصفحة غير موجودة'
        });
      }

      res.json({
        ok: true,
        data: item
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر تعديل الصفحة'
      });
    }
  }
);

app.delete(
  '/api/admin/pages/:id',
  requireAdmin,
  async (req, res) => {
    try {
      const deleted =
        await deleteCmsItem(
          'pages',
          req.params.id
        );

      if (!deleted) {
        return res.status(404).json({
          ok: false,
          error:
            'الصفحة غير موجودة'
        });
      }

      res.json({
        ok: true
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر حذف الصفحة'
      });
    }
  }
);

/* =========================================================
   Navigation
========================================================= */

app.get(
  '/api/admin/navigation',
  requireAdmin,
  async (req, res) => {
    res.json({
      ok: true,
      data:
        await listCmsCollection(
          'navigation'
        )
    });
  }
);

app.post(
  '/api/admin/navigation',
  requireAdmin,
  async (req, res) => {
    try {
      const item =
        await createCmsItem(
          'navigation',
          req.body || {}
        );

      res.json({
        ok: true,
        data: item
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر إضافة عنصر القائمة'
      });
    }
  }
);

app.put(
  '/api/admin/navigation/:id',
  requireAdmin,
  async (req, res) => {
    try {
      const item =
        await updateCmsItem(
          'navigation',
          req.params.id,
          req.body || {}
        );

      if (!item) {
        return res.status(404).json({
          ok: false,
          error:
            'عنصر القائمة غير موجود'
        });
      }

      res.json({
        ok: true,
        data: item
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر تعديل عنصر القائمة'
      });
    }
  }
);

app.delete(
  '/api/admin/navigation/:id',
  requireAdmin,
  async (req, res) => {
    try {
      const deleted =
        await deleteCmsItem(
          'navigation',
          req.params.id
        );

      if (!deleted) {
        return res.status(404).json({
          ok: false,
          error:
            'عنصر القائمة غير موجود'
        });
      }

      res.json({
        ok: true
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر حذف عنصر القائمة'
      });
    }
  }
);

/* =========================================================
   الإعلانات
========================================================= */

app.get(
  '/api/admin/announcements',
  requireAdmin,
  async (req, res) => {
    const db =
      await getData();

    res.json({
      ok: true,
      data:
        db.announcements || []
    });
  }
);

app.post(
  '/api/admin/announcements',
  requireAdmin,
  async (req, res) => {
    try {
      const db =
        await getData();

      const item = {
        id:
          createId(),
        ...(req.body || {})
      };

      if (
        !Array.isArray(
          db.announcements
        )
      ) {
        db.announcements = [];
      }

      db.announcements.push(item);

      await saveData(db);

      res.json({
        ok: true,
        data: item
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر إضافة الإعلان'
      });
    }
  }
);

app.put(
  '/api/admin/announcements/:id',
  requireAdmin,
  async (req, res) => {
    try {
      const db =
        await getData();

      const items =
        db.announcements || [];

      const index =
        items.findIndex(
          item =>
            String(item.id) ===
            String(req.params.id)
        );

      if (index === -1) {
        return res.status(404).json({
          ok: false,
          error:
            'الإعلان غير موجود'
        });
      }

      items[index] = {
        ...items[index],
        ...(req.body || {}),
        id: items[index].id
      };

      await saveData(db);

      res.json({
        ok: true,
        data: items[index]
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر تعديل الإعلان'
      });
    }
  }
);

app.delete(
  '/api/admin/announcements/:id',
  requireAdmin,
  async (req, res) => {
    try {
      const db =
        await getData();

      const items =
        db.announcements || [];

      const index =
        items.findIndex(
          item =>
            String(item.id) ===
            String(req.params.id)
        );

      if (index === -1) {
        return res.status(404).json({
          ok: false,
          error:
            'الإعلان غير موجود'
        });
      }

      items.splice(index, 1);

      await saveData(db);

      res.json({
        ok: true
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر حذف الإعلان'
      });
    }
  }
);

/* =========================================================
   البرامج
========================================================= */

app.get(
  '/api/admin/programs',
  requireAdmin,
  async (req, res) => {
    const db =
      await getData();

    res.json({
      ok: true,
      data:
        db.programs || []
    });
  }
);

app.post(
  '/api/admin/programs',
  requireAdmin,
  async (req, res) => {
    try {
      const db =
        await getData();

      if (!Array.isArray(db.programs)) {
        db.programs = [];
      }

      const item = {
        id:
          createId(),
        ...(req.body || {})
      };

      db.programs.push(item);

      await saveData(db);

      res.json({
        ok: true,
        data: item
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر إضافة البرنامج'
      });
    }
  }
);

app.put(
  '/api/admin/programs/:id',
  requireAdmin,
  async (req, res) => {
    try {
      const db =
        await getData();

      const items =
        db.programs || [];

      const index =
        items.findIndex(
          item =>
            String(item.id) ===
            String(req.params.id)
        );

      if (index === -1) {
        return res.status(404).json({
          ok: false,
          error:
            'البرنامج غير موجود'
        });
      }

      items[index] = {
        ...items[index],
        ...(req.body || {}),
        id: items[index].id
      };

      await saveData(db);

      res.json({
        ok: true,
        data: items[index]
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر تعديل البرنامج'
      });
    }
  }
);

app.delete(
  '/api/admin/programs/:id',
  requireAdmin,
  async (req, res) => {
    try {
      const db =
        await getData();

      const items =
        db.programs || [];

      const index =
        items.findIndex(
          item =>
            String(item.id) ===
            String(req.params.id)
        );

      if (index === -1) {
        return res.status(404).json({
          ok: false,
          error:
            'البرنامج غير موجود'
        });
      }

      items.splice(index, 1);

      await saveData(db);

      res.json({
        ok: true
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر حذف البرنامج'
      });
    }
  }
);

/* =========================================================
   الأخبار
========================================================= */

app.get(
  '/api/admin/news',
  requireAdmin,
  async (req, res) => {
    const db =
      await getData();

    res.json({
      ok: true,
      data:
        db.news || []
    });
  }
);

app.post(
  '/api/admin/news',
  requireAdmin,
  async (req, res) => {
    try {
      const db =
        await getData();

      if (!Array.isArray(db.news)) {
        db.news = [];
      }

      const item = {
        id:
          createId(),
        ...(req.body || {})
      };

      db.news.push(item);

      await saveData(db);

      res.json({
        ok: true,
        data: item
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر إضافة الخبر'
      });
    }
  }
);

app.put(
  '/api/admin/news/:id',
  requireAdmin,
  async (req, res) => {
    try {
      const db =
        await getData();

      const items =
        db.news || [];

      const index =
        items.findIndex(
          item =>
            String(item.id) ===
            String(req.params.id)
        );

      if (index === -1) {
        return res.status(404).json({
          ok: false,
          error:
            'الخبر غير موجود'
        });
      }

      items[index] = {
        ...items[index],
        ...(req.body || {}),
        id: items[index].id
      };

      await saveData(db);

      res.json({
        ok: true,
        data: items[index]
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر تعديل الخبر'
      });
    }
  }
);

app.delete(
  '/api/admin/news/:id',
  requireAdmin,
  async (req, res) => {
    try {
      const db =
        await getData();

      const items =
        db.news || [];

      const index =
        items.findIndex(
          item =>
            String(item.id) ===
            String(req.params.id)
        );

      if (index === -1) {
        return res.status(404).json({
          ok: false,
          error:
            'الخبر غير موجود'
        });
      }

      items.splice(index, 1);

      await saveData(db);

      res.json({
        ok: true
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر حذف الخبر'
      });
    }
  }
);

/* =========================================================
   Hero
========================================================= */

app.get(
  '/api/admin/hero',
  requireAdmin,
  async (req, res) => {
    const db =
      await getData();

    res.json({
      ok: true,
      data:
        db.hero || []
    });
  }
);

app.post(
  '/api/admin/hero',
  requireAdmin,
  async (req, res) => {
    try {
      const db =
        await getData();

      if (!Array.isArray(db.hero)) {
        db.hero = [];
      }

      const item = {
        id:
          createId(),
        ...(req.body || {})
      };

      db.hero.push(item);

      await saveData(db);

      res.json({
        ok: true,
        data: item
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر إضافة صورة الواجهة'
      });
    }
  }
);

app.put(
  '/api/admin/hero/:id',
  requireAdmin,
  async (req, res) => {
    try {
      const db =
        await getData();

      const items =
        db.hero || [];

      const index =
        items.findIndex(
          item =>
            String(item.id) ===
            String(req.params.id)
        );

      if (index === -1) {
        return res.status(404).json({
          ok: false,
          error:
            'الصورة غير موجودة'
        });
      }

      items[index] = {
        ...items[index],
        ...(req.body || {}),
        id: items[index].id
      };

      await saveData(db);

      res.json({
        ok: true,
        data: items[index]
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر تعديل صورة الواجهة'
      });
    }
  }
);

app.delete(
  '/api/admin/hero/:id',
  requireAdmin,
  async (req, res) => {
    try {
      const db =
        await getData();

      const items =
        db.hero || [];

      const index =
        items.findIndex(
          item =>
            String(item.id) ===
            String(req.params.id)
        );

      if (index === -1) {
        return res.status(404).json({
          ok: false,
          error:
            'الصورة غير موجودة'
        });
      }

      items.splice(index, 1);

      await saveData(db);

      res.json({
        ok: true
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error:
          'تعذر حذف صورة الواجهة'
      });
    }
  }
);

/* =========================================================
   رفع الملفات
========================================================= */

const storage =
  multer.diskStorage({
    destination:
      function (
        req,
        file,
        cb
      ) {
        cb(
          null,
          UPLOAD_DIR
        );
      },

    filename:
      function (
        req,
        file,
        cb
      ) {
        const ext =
          path.extname(
            file.originalname
          );

        const name =
          crypto
            .randomBytes(16)
            .toString('hex');

        cb(
          null,
          name + ext
        );
      }
  });

const upload =
  multer({
    storage,

    limits: {
      fileSize:
        100 * 1024 * 1024
    }
  });

const allowedExtensions = [
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.mp4',
  '.webm',
  '.mov',
  '.mp3',
  '.wav',
  '.m4a',
  '.ogg'
];

app.post(
  '/api/admin/upload',
  requireAdmin,
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          ok: false,
          error:
            'لم يتم اختيار ملف'
        });
      }

      const ext =
        path.extname(
          req.file.originalname
        ).toLowerCase();

      if (
        !allowedExtensions.includes(
          ext
        )
      ) {
        fs.unlinkSync(
          req.file.path
        );

        return res.status(400).json({
          ok: false,
          error:
            'نوع الملف غير مسموح'
        });
      }

      /* -----------------------------------------
         رفع إلى Supabase Storage
      ----------------------------------------- */

      if (USE_SUPABASE) {
        const fileBuffer =
          fs.readFileSync(
            req.file.path
          );

        const storagePath =
          Date.now() +
          '-' +
          req.file.filename;

        const uploadResult =
          await supabase.storage
            .from(BUCKET)
            .upload(
              storagePath,
              fileBuffer,
              {
                contentType:
                  req.file.mimetype,
                upsert: false
              }
            );

        if (
          uploadResult.error
        ) {
          console.error(
            uploadResult.error
          );

          return res.status(500).json({
            ok: false,
            error:
              'تعذر رفع الملف إلى التخزين'
          });
        }

        const publicResult =
          supabase.storage
            .from(BUCKET)
            .getPublicUrl(
              storagePath
            );

        fs.unlinkSync(
          req.file.path
        );

        const fileInfo = {
          id:
            createId(),

          name:
            req.file.originalname,

          filename:
            storagePath,

          url:
            publicResult.data.publicUrl,

          type:
            req.file.mimetype,

          size:
            req.file.size,

          createdAt:
            new Date().toISOString()
        };

        const db =
          await getData();

        ensureCms(db);

        db.settings.cms.media.push(
          fileInfo
        );

        await saveData(db);

        return res.json({
          ok: true,
          data: fileInfo
        });
      }

      /* -----------------------------------------
         تخزين محلي
      ----------------------------------------- */

      const relativeUrl =
        '/uploads/' +
        req.file.filename;

      const fileInfo = {
        id:
          createId(),

        name:
          req.file.originalname,

        filename:
          req.file.filename,

        url:
          relativeUrl,

        type:
          req.file.mimetype,

        size:
          req.file.size,

        createdAt:
          new Date().toISOString()
      };

      const db =
        await getData();

      ensureCms(db);

      db.settings.cms.media.push(
        fileInfo
      );

      await saveData(db);

      res.json({
        ok: true,
        data: fileInfo
      });
    } catch (error) {
      console.error(
        'Upload error:',
        error
      );

      res.status(500).json({
        ok: false,
        error:
          'حدث خطأ أثناء رفع الملف'
      });
    }
  }
);

/* =========================================================
   حذف ملف من التخزين
========================================================= */

app.delete(
  '/api/admin/upload/:id',
  requireAdmin,
  async (req, res) => {
    try {
      const db =
        await getData();

      ensureCms(db);

      const items =
        db.settings.cms.media;

      const index =
        items.findIndex(
          item =>
            String(item.id) ===
            String(req.params.id)
        );

      if (index === -1) {
        return res.status(404).json({
          ok: false,
          error:
            'الملف غير موجود'
        });
      }

      const file =
        items[index];

      if (
        USE_SUPABASE &&
        file.filename
      ) {
        try {
          await supabase.storage
            .from(BUCKET)
            .remove([
              file.filename
            ]);
        } catch (storageError) {
          console.error(
            storageError
          );
        }
      } else if (
        file.filename
      ) {
        const localPath =
          path.join(
            UPLOAD_DIR,
            file.filename
          );

        if (
          fs.existsSync(
            localPath
          )
        ) {
          fs.unlinkSync(
            localPath
          );
        }
      }

      items.splice(index, 1);

      await saveData(db);

      res.json({
        ok: true
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        ok: false,
        error:
          'تعذر حذف الملف'
      });
    }
  }
);

/* =========================================================
   خدمة الملفات المحلية
========================================================= */

app.use(
  '/uploads',
  express.static(
    UPLOAD_DIR
  )
);

/* =========================================================
   فحص حالة الخادم
========================================================= */

app.get(
  '/api/health',
  async (req, res) => {
    let database =
      'local';

    let supabaseStatus =
      false;

    if (USE_SUPABASE) {
      database =
        'supabase';

      try {
        await getSupabaseData();

        supabaseStatus =
          true;
      } catch (error) {
        console.error(
          'Supabase health error:',
          error
        );

        supabaseStatus =
          false;
      }
    }

    res.json({
      ok: true,

      database,

      supabase:
        supabaseStatus,

      cms: true,

      features: {
        homepage: true,
        services: true,
        stats: true,
        research: true,
        media: true,
        pages: true,
        navigation: true,
        announcements: true,
        programs: true,
        news: true,
        hero: true,
        uploads: true
      },

      publicDirectory:
        PUBLIC
    });
  }
);

/* =========================================================
   ملفات الموقع
========================================================= */

app.use(
  express.static(
    PUBLIC
  )
);

/* =========================================================
   صفحة الإدارة
========================================================= */

app.get(
  '/admin',
  (req, res) => {
    const adminFile =
      path.join(
        PUBLIC,
        'admin.html'
      );

    if (
      fs.existsSync(
        adminFile
      )
    ) {
      return res.sendFile(
        adminFile
      );
    }

    res.status(404).send(
      'Admin page not found'
    );
  }
);

/* =========================================================
   الصفحة الرئيسية
========================================================= */

app.get(
  '*',
  (req, res) => {
    const indexFile =
      path.join(
        PUBLIC,
        'index.html'
      );

    if (
      fs.existsSync(
        indexFile
      )
    ) {
      return res.sendFile(
        indexFile
      );
    }

    res.status(404).send(
      'Website page not found'
    );
  }
);

/* =========================================================
   معالجة الأخطاء
========================================================= */

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      'Server error:',
      error
    );

    if (
      res.headersSent
    ) {
      return next(error);
    }

    res.status(500).json({
      ok: false,
      error:
        'حدث خطأ داخلي في الخادم'
    });
  }
);

/* =========================================================
   تشغيل الخادم
========================================================= */

app.listen(
  PORT,
  '0.0.0.0',
  () => {
    console.log(
      '======================================'
    );

    console.log(
      'Peace Center server is running'
    );

    console.log(
      'Port:',
      PORT
    );

    console.log(
      'Public:',
      PUBLIC
    );

    console.log(
      'Database:',
      USE_SUPABASE
        ? 'Supabase'
        : 'Local JSON'
    );

    console.log(
      'Storage:',
      USE_SUPABASE
        ? 'Supabase Storage'
        : 'Local uploads'
    );

    console.log(
      '======================================'
    );
  }
);
