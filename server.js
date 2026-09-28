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
    if (fs.existsSync(path.join(dir, 'index.html'))) return dir;
  }

  function scan(dir, depth) {
    if (depth < 0) return null;
    if (fs.existsSync(path.join(dir, 'index.html'))) return dir;

    let entries = [];

    try {
      entries = fs.readdirSync(dir, {
        withFileTypes: true
      });
    } catch (_) {
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

  return (
    scan(ROOT, 3) ||
    path.join(ROOT, 'public')
  );
}

const PUBLIC = findPublicDir();

console.log(
  'Website files directory:',
  PUBLIC
);

/* =========================================================
   قاعدة البيانات
========================================================= */

const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

fs.mkdirSync(DATA_DIR, {
  recursive: true
});

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
          title:
            'البحوث والدراسات',

          text:
            'إنتاج المعرفة وإجراء البحوث العلمية التي تسهم في قضايا السلام والتنمية',

          icon:
            '🔬',

          color:
            'blue',

          image:
            '',

          link:
            '#research',

          order:
            1,

          visible:
            true
        },

        {
          id: 's2',
          title:
            'بناء السلام',

          text:
            'تعزيز ثقافة السلام والتعايش والحوار المجتمعي',

          icon:
            '🕊️',

          color:
            'gold',

          image:
            '',

          link:
            '#programs',

          order:
            2,

          visible:
            true
        },

        {
          id: 's3',
          title:
            'التنمية المستدامة',

          text:
            'دعم مبادرات التنمية والمشروعات المجتمعية المستدامة',

          icon:
            '🌱',

          color:
            'green',

          image:
            '',

          link:
            '#programs',

          order:
            3,

          visible:
            true
        },

        {
          id: 's4',
          title:
            'التدريب وبناء القدرات',

          text:
            'تأهيل الكوادر وتطوير المهارات لخدمة المجتمع والتنمية',

          icon:
            '🎓',

          color:
            'purple',

          image:
            '',

          link:
            '#programs',

          order:
            4,

          visible:
            true
        }
      ],

      stats: [
        {
          id:
            'st1',

          number:
            '20+',

          label:
            'مشاريع تنموية',

          icon:
            '🏗️',

          order:
            1,

          visible:
            true
        },

        {
          id:
            'st2',

          number:
            '15+',

          label:
            'دورات تدريبية',

          icon:
            '🎓',

          order:
            2,

          visible:
            true
        },

        {
          id:
            'st3',

          number:
            '50+',

          label:
            'مستفيدين',

          icon:
            '👥',

          order:
            3,

          visible:
            true
        },

        {
          id:
            'st4',

          number:
            '100+',

          label:
            'بحث ودراسة',

          icon:
            '📚',

          order:
            4,

          visible:
            true
        }
      ],

      research: [
        {
          id:
            'r1',

          title:
            'دراسات السلام والتنمية في غرب كردفان',

          text:
            'دراسات وبحوث علمية تتناول قضايا السلام والتنمية والمجتمع المحلي.',

          image:
            '',

          file:
            '',

          order:
            1,

          visible:
            true
        },

        {
          id:
            'r2',

          title:
            'البحث العلمي وخدمة المجتمع',

          text:
            'إنتاج المعرفة وربط البحث العلمي باحتياجات المجتمع والتنمية.',

          image:
            '',

          file:
            '',

          order:
            2,

          visible:
            true
        }
      ],

      media: [],

      pages: [],

      navigation: [
        {
          id:
            'nav1',

          title:
            'الرئيسية',

          url:
            '#home',

          order:
            1,

          visible:
            true
        },

        {
          id:
            'nav2',

          title:
            'عن المركز',

          url:
            '#about',

          order:
            2,

          visible:
            true
        },

        {
          id:
            'nav3',

          title:
            'البحوث والدراسات',

          url:
            '#research',

          order:
            3,

          visible:
            true
        },

        {
          id:
            'nav4',

          title:
            'البرامج',

          url:
            '#programs',

          order:
            4,

          visible:
            true
        },

        {
          id:
            'nav5',

          title:
            'الأخبار',

          url:
            '#news',

          order:
            5,

          visible:
            true
        },

        {
          id:
            'nav6',

          title:
            'اتصل بنا',

          url:
            '#contact',

          order:
            6,

          visible:
            true
        }
      ],

      homepage: {
        kicker:
          'جامعة السلام – ولاية غرب كردفان',

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
      id:
        'a1',

      text:
        '📢 مركز دراسات السلام والتنمية يعلن عن بدء التسجيل في البرامج التدريبية'
    },

    {
      id:
        'a2',

      text:
        'ندوة علمية: السلام والتنمية المستدامة في غرب كردفان'
    },

    {
      id:
        'a3',

      text:
        'تابع أحدث البحوث والدراسات والأنشطة العلمية للمركز'
    }
  ],

  programs: [
    {
      id:
        'p1',

      title:
        'بناء السلام',

      text:
        'تعزيز ثقافة السلام والتعايش والحوار المجتمعي'
    },

    {
      id:
        'p2',

      title:
        'التنمية المستدامة',

      text:
        'دعم مبادرات التنمية والمشروعات المجتمعية المستدامة'
    },

    {
      id:
        'p3',

      title:
        'التدريب وبناء القدرات',

      text:
        'تأهيل الكوادر وتطوير المهارات لخدمة المجتمع والتنمية'
    },

    {
      id:
        'p4',

      title:
        'البحوث والدراسات',

      text:
        'إنتاج المعرفة وإجراء البحوث العلمية التي تسهم في قضايا السلام والتنمية'
    }
  ],

  news: [
    {
      id:
        'n1',

      title:
        'ندوة علمية حول السلام والتنمية المستدامة',

      text:
        'فعالية علمية تجمع الباحثين والمهتمين بقضايا السلام والتنمية.',

      date:
        '2026-09-20',

      image:
        ''
    },

    {
      id:
        'n2',

      title:
        'برنامج تدريبي لبناء القدرات',

      text:
        'برنامج تدريبي يستهدف تطوير مهارات الكوادر والمبادرات المحلية.',

      date:
        '2026-09-15',

      image:
        ''
    }
  ],

  documents: [],

  hero: [
    {
      id:
        'h1',

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
      id:
        'h2',

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

function hashPassword(
  password,
  salt = crypto
    .randomBytes(16)
    .toString('hex')
) {
  const hash =
    crypto
      .scryptSync(
        password,
        salt,
        64
      )
      .toString('hex');

  return `${salt}:${hash}`;
}

function verifyPassword(
  password,
  stored
) {
  const parts =
    String(
      stored || ''
    ).split(':');

  const salt =
    parts[0];

  const key =
    parts[1];

  if (
    !salt ||
    !key
  ) {
    return false;
  }

  const derived =
    crypto
      .scryptSync(
        password,
        salt,
        64
      )
      .toString('hex');

  const a =
    Buffer.from(
      key,
      'hex'
    );

  const b =
    Buffer.from(
      derived,
      'hex'
    );

  return (
    a.length ===
      b.length &&
    crypto.timingSafeEqual(
      a,
      b
    )
  );
}

/* =========================================================
   ضمان وجود CMS
========================================================= */

function ensureCms(db) {
  if (!db.settings) {
    db.settings = {};
  }

  if (!db.settings.cms) {
    db.settings.cms = {};
  }

  const cms =
    db.settings.cms;

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

  if (
    !cms.homepage ||
    typeof cms.homepage !== 'object' ||
    Array.isArray(cms.homepage)
  ) {
    cms.homepage = {};
  }

  return db;
}

function mergeSeedArray(
  existing,
  seed
) {
  if (!Array.isArray(existing)) {
    existing = [];
  }

  if (!Array.isArray(seed)) {
    return existing;
  }

  if (existing.length === 0) {
    return JSON.parse(
      JSON.stringify(seed)
    );
  }

  return existing;
}

function mergeSeedObject(
  existing,
  seed
) {
  if (
    !existing ||
    typeof existing !== 'object' ||
    Array.isArray(existing)
  ) {
    return JSON.parse(
      JSON.stringify(seed)
    );
  }

  const result = {
    ...existing
  };

  for (
    const key of Object.keys(seed)
  ) {
    if (
      result[key] === undefined ||
      result[key] === null ||
      result[key] === ''
    ) {
      result[key] =
        JSON.parse(
          JSON.stringify(
            seed[key]
          )
        );
    }
  }

  return result;
}

/* =========================================================
   تهيئة قاعدة البيانات
========================================================= */

function normalizeDatabase(db) {
  const seed =
    cloneInitial();

  if (!db.settings) {
    db.settings = {};
  }

  db.settings =
    mergeSeedObject(
      db.settings,
      seed.settings
    );

  ensureCms(db);

  db.settings.cms.services =
    mergeSeedArray(
      db.settings.cms.services,
      seed.settings.cms.services
    );

  db.settings.cms.stats =
    mergeSeedArray(
      db.settings.cms.stats,
      seed.settings.cms.stats
    );

  db.settings.cms.research =
    mergeSeedArray(
      db.settings.cms.research,
      seed.settings.cms.research
    );

  db.settings.cms.navigation =
    mergeSeedArray(
      db.settings.cms.navigation,
      seed.settings.cms.navigation
    );

  db.settings.cms.pages =
    mergeSeedArray(
      db.settings.cms.pages,
      seed.settings.cms.pages
    );

  db.settings.cms.media =
    mergeSeedArray(
      db.settings.cms.media,
      seed.settings.cms.media
    );

  db.settings.cms.homepage =
    mergeSeedObject(
      db.settings.cms.homepage,
      seed.settings.cms.homepage
    );

  db.announcements =
    mergeSeedArray(
      db.announcements,
      seed.announcements
    );

  db.programs =
    mergeSeedArray(
      db.programs,
      seed.programs
    );

  db.news =
    mergeSeedArray(
      db.news,
      seed.news
    );

  db.documents =
    Array.isArray(
      db.documents
    )
      ? db.documents
      : [];

  db.hero =
    mergeSeedArray(
      db.hero,
      seed.hero
    );

  return db;
}

/* =========================================================
   Local Database
========================================================= */

function loadLocal() {
  if (!fs.existsSync(DB_FILE)) {
    const db =
      cloneInitial();

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
      JSON.stringify(
        db,
        null,
        2
      )
    );
  }

  let db =
    JSON.parse(
      fs.readFileSync(
        DB_FILE,
        'utf8'
      )
    );

  db =
    normalizeDatabase(
      db
    );

  saveLocal(db);

  return db;
}

function saveLocal(db) {
  db =
    normalizeDatabase(
      db
    );

  fs.writeFileSync(
    DB_FILE,
    JSON.stringify(
      db,
      null,
      2
    )
  );

  return db;
}

/* =========================================================
   Supabase
========================================================= */

async function getSupabaseData() {
  const {
    data,
    error
  } = await supabase
    .from('site_data')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    const seed =
      cloneInitial();

    const {
      error: insertError
    } = await supabase
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
          seed.hero,

        updated_at:
          new Date().toISOString()
      });

    if (insertError) {
      throw insertError;
    }

    return seed;
  }

  let db = {
    settings:
      data.settings || {},

    announcements:
      Array.isArray(
        data.announcements
      )
        ? data.announcements
        : [],

    programs:
      Array.isArray(
        data.programs
      )
        ? data.programs
        : [],

    news:
      Array.isArray(
        data.news
      )
        ? data.news
        : [],

    documents:
      Array.isArray(
        data.documents
      )
        ? data.documents
        : [],

    hero:
      Array.isArray(
        data.hero
      )
        ? data.hero
        : []
  };

  const before =
    JSON.stringify(
      db
    );

  db =
    normalizeDatabase(
      db
    );

  const after =
    JSON.stringify(
      db
    );

  if (
    before !==
    after
  ) {
    await saveSupabaseData(
      db
    );
  }

  return db;
}

async function saveSupabaseData(
  db
) {
  db =
    normalizeDatabase(
      db
    );

  const {
    error
  } = await supabase
    .from('site_data')
    .update({
      settings:
        db.settings,

      announcements:
        db.announcements,

      programs:
        db.programs,

      news:
        db.news,

      documents:
        db.documents,

      hero:
        db.hero,

      updated_at:
        new Date().toISOString()
    })
    .eq('id', 1);

  if (error) {
    throw error;
  }

  return db;
}

async function getData() {
  if (USE_SUPABASE) {
    return getSupabaseData();
  }

  return loadLocal();
}

async function saveData(
  db
) {
  if (USE_SUPABASE) {
    return saveSupabaseData(
      db
    );
  }

  return saveLocal(
    db
  );
}

/* =========================================================
   حساب المدير
========================================================= */

async function ensureAdmin() {
  if (!USE_SUPABASE) {
    return;
  }

  const {
    data,
    error
  } = await supabase
    .from('admin_users')
    .select(
      'id,username,password_hash'
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    const username =
      process.env.ADMIN_USERNAME ||
      'admin';

    const password =
      process.env.ADMIN_PASSWORD ||
      'Peace@2026';

    const {
      error: insertError
    } = await supabase
      .from('admin_users')
      .insert({
        username:
          username,

        password_hash:
          hashPassword(
            password
          )
      });

    if (insertError) {
      throw insertError;
    }
  }
}

async function getAdmin() {
  if (!USE_SUPABASE) {
    const db =
      loadLocal();

    return db.admin;
  }

  const {
    data,
    error
  } = await supabase
    .from('admin_users')
    .select(
      'id,username,password_hash'
    )
    .limit(1)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/* =========================================================
   Express
========================================================= */

app.use(
  express.json({
    limit: '10mb'
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb'
  })
);

app.use(
  express.static(
    PUBLIC
  )
);

const LOCAL_UPLOADS =
  path.join(
    ROOT,
    'uploads'
  );

fs.mkdirSync(
  LOCAL_UPLOADS,
  {
    recursive: true
  }
);

app.use(
  '/uploads',
  express.static(
    LOCAL_UPLOADS
  )
);

/* =========================================================
   الصفحة الرئيسية
========================================================= */

app.get(
  '/',
  (_req, res) => {
    const indexPath =
      path.join(
        PUBLIC,
        'index.html'
      );

    if (
      fs.existsSync(
        indexPath
      )
    ) {
      return res.sendFile(
        indexPath
      );
    }

    res
      .status(500)
      .send(`
        <html lang="ar" dir="rtl">
          <meta charset="utf-8">
          <title>مشكلة في ملفات الموقع</title>

          <body style="font-family:Arial;padding:40px">

            <h2>
              ملف الصفحة الرئيسية غير موجود
            </h2>

            <p>
              لم يجد الخادم ملف
              <b>index.html</b>.
            </p>

            <p>
              المجلد:
              <code>${PUBLIC}</code>
            </p>

          </body>
        </html>
      `);
  }
);

/* =========================================================
   Sessions
========================================================= */

const sessions =
  new Map();

function createSession(
  username
) {
  const token =
    crypto
      .randomBytes(32)
      .toString('hex');

  sessions.set(
    token,
    {
      username:
        username,

      expires:
        Date.now() +
        8 *
          60 *
          60 *
          1000
    }
  );

  return token;
}

function auth(
  req,
  res,
  next
) {
  const token =
    req.headers.authorization
      ?.replace(
        'Bearer ',
        ''
      );

  const session =
    token &&
    sessions.get(
      token
    );

  if (
    !session ||
    session.expires <
      Date.now()
  ) {
    return res
      .status(401)
      .json({
        error:
          'غير مصرح'
      });
  }

  next();
}

/* =========================================================
   تسجيل الدخول
   يقبل /api/login و /api/admin/login
========================================================= */

async function loginHandler(
  req,
  res,
  next
) {
  try {
    const {
      username,
      password
    } = req.body || {};

    const admin =
      await getAdmin();

    const valid =
      username ===
        admin.username &&
      verifyPassword(
        password || '',
        admin.password_hash ||
          admin.passwordHash
      );

    if (!valid) {
      return res
        .status(401)
        .json({
          error:
            'اسم المستخدم أو كلمة المرور غير صحيحة'
        });
    }

    res.json({
      token:
        createSession(
          username
        ),

      username:
        username
    });
  } catch (error) {
    next(error);
  }
}

/*
   هذا هو الإصلاح المهم:
   لوحة التحكم القديمة كانت تستخدم
   /api/admin/login
   بينما الخادم كان يقبل /api/login فقط.
*/

app.post(
  '/api/login',
  loginHandler
);

app.post(
  '/api/admin/login',
  loginHandler
);

/* =========================================================
   تسجيل الخروج
========================================================= */

app.post(
  '/api/logout',
  auth,
  (req, res) => {
    const token =
      req.headers.authorization
        ?.replace(
          'Bearer ',
          ''
        );

    if (token) {
      sessions.delete(
        token
      );
    }

    res.json({
      ok:
        true
    });
  }
);

/* =========================================================
   البيانات العامة
========================================================= */

app.get(
  '/api/public',
  async (
    _req,
    res,
    next
  ) => {
    try {
      const db =
        await getData();

      res.json(
        db
      );
    } catch (error) {
      next(error);
    }
  }
);

/* =========================================================
   بيانات لوحة التحكم
========================================================= */

app.get(
  '/api/admin',
  auth,
  async (
    _req,
    res,
    next
  ) => {
    try {
      const db =
        await getData();

      const admin =
        await getAdmin();

      res.json({
        ...db,

        cms:
          db.settings?.cms ||
          {},

        admin: {
          username:
            admin.username
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =========================================================
   Collections
========================================================= */

const LEGACY_COLLECTIONS = [
  'announcements',
  'programs',
  'news',
  'documents',
  'hero'
];

const CMS_COLLECTIONS = [
  'services',
  'stats',
  'research',
  'media',
  'pages',
  'navigation'
];

const ALL_COLLECTIONS = [
  ...LEGACY_COLLECTIONS,
  ...CMS_COLLECTIONS
];

function getCollection(
  db,
  key
) {
  if (
    LEGACY_COLLECTIONS.includes(
      key
    )
  ) {
    if (
      !Array.isArray(
        db[key]
      )
    ) {
      db[key] = [];
    }

    return db[key];
  }

  if (
    CMS_COLLECTIONS.includes(
      key
    )
  ) {
    ensureCms(
      db
    );

    if (
      !Array.isArray(
        db.settings.cms[key]
      )
    ) {
      db.settings.cms[key] = [];
    }

    return db.settings.cms[key];
  }

  throw new Error(
    `القسم غير معروف: ${key}`
  );
}

function setCollection(
  db,
  key,
  value
) {
  if (
    LEGACY_COLLECTIONS.includes(
      key
    )
  ) {
    db[key] =
      Array.isArray(
        value
      )
        ? value
        : [];

    return;
  }

  if (
    CMS_COLLECTIONS.includes(
      key
    )
  ) {
    ensureCms(
      db
    );

    db.settings.cms[key] =
      Array.isArray(
        value
      )
        ? value
        : [];

    return;
  }

  throw new Error(
    `القسم غير معروف: ${key}`
  );
}

/* =========================================================
   CRUD لجميع الأقسام
========================================================= */

for (
  const key of ALL_COLLECTIONS
) {
  app.post(
    `/api/admin/${key}`,
    auth,
    async (
      req,
      res,
      next
    ) => {
      try {
        const db =
          await getData();

        const collection =
          getCollection(
            db,
            key
          );

        const item = {
          ...req.body,

          id:
            req.body?.id ||
            createId()
        };

        collection.unshift(
          item
        );

        setCollection(
          db,
          key,
          collection
        );

        await saveData(
          db
        );

        res.json(
          item
        );
      } catch (error) {
        next(error);
      }
    }
  );

  app.put(
    `/api/admin/${key}/:id`,
    auth,
    async (
      req,
      res,
      next
    ) => {
      try {
        const db =
          await getData();

        const collection =
          getCollection(
            db,
            key
          );

        const index =
          collection.findIndex(
            item =>
              String(
                item.id
              ) ===
              String(
                req.params.id
              )
          );

        if (
          index < 0
        ) {
          return res
            .status(404)
            .json({
              error:
                'العنصر غير موجود'
            });
        }

        collection[index] = {
          ...collection[index],

          ...req.body,

          id:
            collection[index]
              .id
        };

        setCollection(
          db,
          key,
          collection
        );

        await saveData(
          db
        );

        res.json(
          collection[index]
        );
      } catch (error) {
        next(error);
      }
    }
  );

  app.delete(
    `/api/admin/${key}/:id`,
    auth,
    async (
      req,
      res,
      next
    ) => {
      try {
        const db =
          await getData();

        const collection =
          getCollection(
            db,
            key
          );

        const old =
          collection.find(
            item =>
              String(
                item.id
              ) ===
              String(
                req.params.id
              )
          );

        if (!old) {
          return res
            .status(404)
            .json({
              error:
                'العنصر غير موجود'
            });
        }

        const filtered =
          collection.filter(
            item =>
              String(
                item.id
              ) !==
              String(
                req.params.id
              )
          );

        setCollection(
          db,
          key,
          filtered
        );

        await saveData(
          db
        );

        if (
          key ===
            'media' &&
          old.storagePath
        ) {
          try {
            if (
              USE_SUPABASE
            ) {
              await supabase
                .storage
                .from(
                  BUCKET
                )
                .remove([
                  old.storagePath
                ]);
            } else {
              const filePath =
                path.join(
                  LOCAL_UPLOADS,
                  path.basename(
                    old.storagePath
                  )
                );

              if (
                fs.existsSync(
                  filePath
                )
              ) {
                fs.unlinkSync(
                  filePath
                );
              }
            }
          } catch (_) {}
        }

        res.json({
          ok:
            true
        });
      } catch (error) {
        next(error);
      }
    }
  );
}

/* =========================================================
   الصفحة الرئيسية CMS
========================================================= */

app.get(
  '/api/admin/homepage',
  auth,
  async (
    _req,
    res,
    next
  ) => {
    try {
      const db =
        await getData();

      ensureCms(
        db
      );

      res.json(
        db.settings.cms
          .homepage ||
          {}
      );
    } catch (error) {
      next(error);
    }
  }
);

app.put(
  '/api/admin/homepage',
  auth,
  async (
    req,
    res,
    next
  ) => {
    try {
      const db =
        await getData();

      ensureCms(
        db
      );

      db.settings.cms.homepage =
        {
          ...db.settings.cms
            .homepage,

          ...req.body
        };

      await saveData(
        db
      );

      res.json(
        db.settings.cms
          .homepage
      );
    } catch (error) {
      next(error);
    }
  }
);

/* =========================================================
   إعدادات الموقع
========================================================= */

app.get(
  '/api/admin/settings',
  auth,
  async (
    _req,
    res,
    next
  ) => {
    try {
      const db =
        await getData();

      res.json(
        db.settings ||
          {}
      );
    } catch (error) {
      next(error);
    }
  }
);

app.put(
  '/api/admin/settings',
  auth,
  async (
    req,
    res,
    next
  ) => {
    try {
      const db =
        await getData();

      db.settings = {
        ...db.settings,

        ...req.body
      };

      ensureCms(
        db
      );

      await saveData(
        db
      );

      res.json(
        db.settings
      );
    } catch (error) {
      next(error);
    }
  }
);

/* =========================================================
   حساب المدير
========================================================= */

app.put(
  '/api/admin/account',
  auth,
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        username,
        password
      } = req.body || {};

      if (
        !username ||
        !password ||
        password.length <
          8
      ) {
        return res
          .status(400)
          .json({
            error:
              'أدخل اسم مستخدم وكلمة مرور من 8 أحرف على الأقل'
          });
      }

      if (
        USE_SUPABASE
      ) {
        const admin =
          await getAdmin();

        const {
          error
        } = await supabase
          .from(
            'admin_users'
          )
          .update({
            username:
              username,

            password_hash:
              hashPassword(
                password
              ),

            updated_at:
              new Date().toISOString()
          })
          .eq(
            'id',
            admin.id
          );

        if (error) {
          throw error;
        }
      } else {
        const db =
          loadLocal();

        db.admin.username =
          username;

        db.admin.passwordHash =
          hashPassword(
            password
          );

        saveLocal(
          db
        );
      }

      sessions.clear();

      res.json({
        ok:
          true
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =========================================================
   رفع الملفات
========================================================= */

const storage =
  multer.memoryStorage();

const upload =
  multer({
    storage,

    limits: {
      fileSize:
        100 *
        1024 *
        1024
    },

    fileFilter:
      (_req, file, cb) => {
        const allowed =
          /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|jpg|jpeg|png|webp|gif|mp4|webm|mov|mp3|wav|m4a|ogg)$/i;

        if (
          allowed.test(
            file.originalname
          )
        ) {
          cb(
            null,
            true
          );
        } else {
          cb(
            new Error(
              'نوع الملف غير مسموح'
            ),
            false
          );
        }
      }
  });

app.post(
  '/api/admin/upload',
  auth,
  upload.single(
    'file'
  ),
  async (
    req,
    res,
    next
  ) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({
            error:
              'لم يتم اختيار ملف'
          });
      }

      if (
        !USE_SUPABASE
      ) {
        const ext =
          path
            .extname(
              req.file
                .originalname
            )
            .toLowerCase();

        const filename =
          `${Date.now()}-${crypto.randomBytes(5).toString('hex')}${ext}`;

        const filePath =
          path.join(
            LOCAL_UPLOADS,
            filename
          );

        fs.writeFileSync(
          filePath,
          req.file.buffer
        );

        const url =
          `/uploads/${filename}`;

        const mediaItem = {
          id:
            createId(),

          name:
            req.file
              .originalname,

          url:
            url,

          size:
            req.file.size,

          type:
            req.file
              .mimetype,

          storagePath:
            filename,

          createdAt:
            new Date().toISOString()
        };

        const db =
          await getData();

        ensureCms(
          db
        );

        db.settings.cms.media.unshift(
          mediaItem
        );

        await saveData(
          db
        );

        return res.json({
          ok:
            true,

          url:
            url,

          name:
            req.file
              .originalname,

          size:
            req.file.size,

          type:
            req.file
              .mimetype,

          storagePath:
            filename,

          media:
            mediaItem
        });
      }

      const ext =
        path
          .extname(
            req.file
              .originalname
          )
          .toLowerCase();

      const safeBase =
        path
          .basename(
            req.file
              .originalname,
            ext
          )
          .replace(
            /[^\p{L}\p{N}_-]+/gu,
            '-'
          )
          .slice(
            0,
            80
          ) ||
        'file';

      const objectPath =
        `${Date.now()}-${crypto.randomBytes(5).toString('hex')}-${safeBase}${ext}`;

      const {
        error
      } =
        await supabase
          .storage
          .from(
            BUCKET
          )
          .upload(
            objectPath,
            req.file.buffer,
            {
              contentType:
                req.file
                  .mimetype,

              upsert:
                false
            }
          );

      if (error) {
        throw error;
      }

      const {
        data:
          publicData
      } =
        supabase
          .storage
          .from(
            BUCKET
          )
          .getPublicUrl(
            objectPath
          );

      const url =
        publicData.publicUrl;

      const mediaItem = {
        id:
          createId(),

        name:
          req.file
            .originalname,

        url:
          url,

        size:
          req.file.size,

        type:
          req.file
            .mimetype,

        storagePath:
          objectPath,

        createdAt:
          new Date().toISOString()
      };

      const db =
        await getData();

      ensureCms(
        db
      );

      db.settings.cms.media.unshift(
        mediaItem
      );

      await saveData(
        db
      );

      res.json({
        ok:
          true,

        url:
          url,

        name:
          req.file
            .originalname,

        size:
          req.file.size,

        type:
          req.file
            .mimetype,

        storagePath:
          objectPath,

        media:
          mediaItem
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =========================================================
   حذف ملف مرفوع مباشرة
========================================================= */

app.delete(
  '/api/admin/upload/:filename',
  auth,
  async (
    req,
    res,
    next
  ) => {
    try {
      const filename =
        req.params.filename;

      if (
        !USE_SUPABASE
      ) {
        const filePath =
          path.join(
            LOCAL_UPLOADS,
            path.basename(
              filename
            )
          );

        if (
          fs.existsSync(
            filePath
          )
        ) {
          fs.unlinkSync(
            filePath
          );
        }

        return res.json({
          ok:
            true
        });
      }

      const {
        error
      } =
        await supabase
          .storage
          .from(
            BUCKET
          )
          .remove([
            filename
          ]);

      if (error) {
        throw error;
      }

      res.json({
        ok:
          true
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =========================================================
   حذف الوسائط بالـID
========================================================= */

app.delete(
  '/api/admin/media/:id',
  auth,
  async (
    req,
    res,
    next
  ) => {
    try {
      const db =
        await getData();

      ensureCms(
        db
      );

      const media =
        db.settings.cms
          .media ||
        [];

      const item =
        media.find(
          x =>
            String(
              x.id
            ) ===
            String(
              req.params.id
            )
        );

      if (!item) {
        return res
          .status(404)
          .json({
            error:
              'ملف الوسائط غير موجود'
          });
      }

      if (
        item.storagePath
      ) {
        try {
          if (
            USE_SUPABASE
          ) {
            await supabase
              .storage
              .from(
                BUCKET
              )
              .remove([
                item.storagePath
              ]);
          } else {
            const filePath =
              path.join(
                LOCAL_UPLOADS,
                path.basename(
                  item.storagePath
                )
              );

            if (
              fs.existsSync(
                filePath
              )
            ) {
              fs.unlinkSync(
                filePath
              );
            }
          }
        } catch (_) {}
      }

      db.settings.cms.media =
        media.filter(
          x =>
            String(
              x.id
            ) !==
            String(
              req.params.id
            )
        );

      await saveData(
        db
      );

      res.json({
        ok:
          true
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =========================================================
   صفحة لوحة التحكم
========================================================= */

app.get(
  '/admin',
  (_req, res) => {
    const adminPath =
      path.join(
        PUBLIC,
        'admin.html'
      );

    if (
      fs.existsSync(
        adminPath
      )
    ) {
      return res.sendFile(
        adminPath
      );
    }

    res
      .status(404)
      .send(
        'admin.html غير موجود داخل مجلد الموقع.'
      );
  }
);

/* =========================================================
   فحص النظام
========================================================= */

app.get(
  '/api/health',
  async (
    _req,
    res
  ) => {
    let cms =
      false;

    let counts =
      {};

    try {
      const db =
        await getData();

      cms =
        Boolean(
          db.settings &&
          db.settings.cms
        );

      counts = {
        services:
          db.settings?.cms
            ?.services
            ?.length ||
          0,

        stats:
          db.settings?.cms
            ?.stats
            ?.length ||
          0,

        research:
          db.settings?.cms
            ?.research
            ?.length ||
          0,

        media:
          db.settings?.cms
            ?.media
            ?.length ||
          0,

        pages:
          db.settings?.cms
            ?.pages
            ?.length ||
          0,

        navigation:
          db.settings?.cms
            ?.navigation
            ?.length ||
          0,

        announcements:
          db.announcements
            ?.length ||
          0,

        programs:
          db.programs
            ?.length ||
          0,

        news:
          db.news
            ?.length ||
          0,

        documents:
          db.documents
            ?.length ||
          0,

        hero:
          db.hero
            ?.length ||
          0
      };
    } catch (_) {
      cms =
        false;
    }

    res.json({
      ok:
        true,

      database:
        USE_SUPABASE
          ? 'supabase'
          : 'local',

      supabase:
        USE_SUPABASE,

      cms:
        cms,

      features: {
        homepage:
          true,

        services:
          true,

        stats:
          true,

        research:
          true,

        media:
          true,

        pages:
          true,

        navigation:
          true,

        announcements:
          true,

        programs:
          true,

        news:
          true,

        documents:
          true,

        hero:
          true,

        uploads:
          true
      },

      counts:
        counts
    });
  }
);

/* =========================================================
   معالجة الأخطاء
========================================================= */

app.use(
  (
    err,
    _req,
    res,
    _next
  ) => {
    console.error(
      'SERVER ERROR:',
      err
    );

    res
      .status(
        err.status ||
          400
      )
      .json({
        error:
          err.message ||
          'حدث خطأ في الخادم'
      });
  }
);

/* =========================================================
   تشغيل الخادم
========================================================= */

(async () => {
  try {
    if (
      USE_SUPABASE
    ) {
      await ensureAdmin();

      await getSupabaseData();

      console.log(
        'Supabase database and CMS are ready.'
      );
    } else {
      loadLocal();

      console.log(
        'Supabase variables are missing; local JSON fallback is active.'
      );
    }

    app.listen(
      PORT,
      () => {
        console.log(
          `Peace Center running on ${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      'Startup failed:',
      error
    );

    process.exit(1);
  }
})();
