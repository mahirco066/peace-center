const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();

const PORT = process.env.PORT || 10000;
const ROOT = __dirname;

const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const UPLOAD_DIR = path.join(ROOT, 'uploads');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

console.log('Website files directory:', PUBLIC_DIR);

/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
  process.env.SUPABASE_URL || '';

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const USE_SUPABASE =
  Boolean(
    SUPABASE_URL &&
    SUPABASE_SERVICE_ROLE_KEY
  );

const STORAGE_BUCKET =
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

const initialData = {
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
      },

      services: [
        {
          id: 's1',
          title:
            'البحوث والدراسات',
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
          title:
            'بناء السلام',
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
          title:
            'التنمية المستدامة',
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
          title:
            'التدريب وبناء القدرات',
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

      research: [],

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
      ]
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
    }
  ],

  programs: [
    {
      id: 'p1',
      title:
        'البحث العلمي والدراسات',
      text:
        'إنتاج المعرفة وإجراء البحوث العلمية التي تسهم في قضايا السلام والتنمية'
    },

    {
      id: 'p2',
      title:
        'البرامج والتدريب',
      text:
        'تأهيل الكوادر وتطوير المهارات لخدمة المجتمع والتنمية'
    },

    {
      id: 'p3',
      title:
        'الرصد والإعلام',
      text:
        'دعم المعرفة والتواصل حول قضايا السلام والتنمية'
    },

    {
      id: 'p4',
      title:
        'الشراكات والتعاون',
      text:
        'تطوير التعاون مع المؤسسات الأكاديمية والمجتمعية'
    }
  ],

  news: [],

  documents: [],

  hero: [
    {
      id: 'h1',
      image:
        'https://upload.wikimedia.org/wikipedia/commons/2/2b/Baobab_vibes_01.jpg',
      caption:
        'شجرة التبلدي في غرب كردفان',
      source:
        'Wikimedia Commons',
      url:
        'https://commons.wikimedia.org/wiki/File:Baobab_vibes_01.jpg'
    }
  ]
};

/* =========================================================
   أدوات عامة
========================================================= */

function cloneData(data) {
  return JSON.parse(
    JSON.stringify(data)
  );
}

function createId() {
  return crypto.randomUUID();
}

/* =========================================================
   كلمة المرور
========================================================= */

function hashPassword(
  password,
  salt = crypto.randomBytes(16).toString('hex')
) {
  const hash =
    crypto
      .scryptSync(
        password,
        salt,
        64
      )
      .toString('hex');

  return (
    salt +
    ':' +
    hash
  );
}

function verifyPassword(
  password,
  stored
) {
  const parts =
    String(
      stored || ''
    ).split(':');

  if (parts.length !== 2) {
    return false;
  }

  const salt =
    parts[0];

  const savedHash =
    parts[1];

  const derivedHash =
    crypto
      .scryptSync(
        password,
        salt,
        64
      )
      .toString('hex');

  const a =
    Buffer.from(
      savedHash,
      'hex'
    );

  const b =
    Buffer.from(
      derivedHash,
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
   التأكد من وجود أقسام CMS
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

  if (!cms.homepage) {
    cms.homepage = {};
  }

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

  return db;
}

/* =========================================================
   قاعدة البيانات المحلية
========================================================= */

function loadLocalData() {
  if (
    !fs.existsSync(
      DB_FILE
    )
  ) {
    const db =
      cloneData(
        initialData
      );

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
      ),
      'utf8'
    );

    return db;
  }

  const db =
    JSON.parse(
      fs.readFileSync(
        DB_FILE,
        'utf8'
      )
    );

  ensureCms(db);

  if (!db.admin) {
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

    saveLocalData(db);
  }

  return db;
}

function saveLocalData(db) {
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
   Supabase
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
      cloneData(
        initialData
      );

    const inserted =
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

    if (inserted.error) {
      throw inserted.error;
    }

    return ensureCms(
      inserted.data
    );
  }

  return ensureCms(
    result.data
  );
}

async function saveSupabaseData(
  db
) {
  ensureCms(db);

  const result =
    await supabase
      .from('site_data')
      .update({
        settings:
          db.settings,

        announcements:
          db.announcements ||
          [],

        programs:
          db.programs ||
          [],

        news:
          db.news ||
          [],

        documents:
          db.documents ||
          [],

        hero:
          db.hero ||
          []
      })
      .eq(
        'id',
        1
      );

  if (result.error) {
    throw result.error;
  }

  return db;
}

async function getData() {
  if (USE_SUPABASE) {
    return getSupabaseData();
  }

  return loadLocalData();
}

async function saveData(db) {
  if (USE_SUPABASE) {
    return saveSupabaseData(
      db
    );
  }

  saveLocalData(db);

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
   جلسات الإدارة
========================================================= */

const sessions =
  new Map();

function createSession(
  username
) {
  const token =
    crypto.randomBytes(
      32
    ).toString('hex');

  sessions.set(
    token,
    {
      username,
      createdAt:
        Date.now()
    }
  );

  return token;
}

function getToken(req) {
  const authorization =
    req.headers.authorization ||
    '';

  if (
    authorization.startsWith(
      'Bearer '
    )
  ) {
    return authorization.slice(
      7
    );
  }

  return (
    req.headers[
      'x-admin-token'
    ] || ''
  );
}

function requireAdmin(
  req,
  res,
  next
) {
  const token =
    getToken(req);

  if (
    !token ||
    !sessions.has(token)
  ) {
    return res.status(401).json({
      ok: false,
      error:
        'غير مصرح'
    });
  }

  req.admin =
    sessions.get(token);

  next();
}

/* =========================================================
   تسجيل الدخول
========================================================= */

async function loginHandler(
  req,
  res
) {
  try {
    const username =
      String(
        req.body.username ||
        ''
      ).trim();

    const password =
      String(
        req.body.password ||
        ''
      );

    if (
      !username ||
      !password
    ) {
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
      (
        db.admin &&
        db.admin.username
      ) ||
      'admin';

    let valid =
      false;

    if (
      process.env.ADMIN_PASSWORD
    ) {
      valid =
        username ===
          savedUsername &&
        password ===
          process.env.ADMIN_PASSWORD;
    } else if (
      db.admin &&
      db.admin.passwordHash
    ) {
      valid =
        username ===
          savedUsername &&
        verifyPassword(
          password,
          db.admin.passwordHash
        );
    } else {
      valid =
        username ===
          'admin' &&
        password ===
          'Peace@2026';
    }

    if (!valid) {
      return res.status(401).json({
        ok: false,
        error:
          'اسم المستخدم أو كلمة المرور غير صحيحة'
      });
    }

    const token =
      createSession(
        username
      );

    res.json({
      ok: true,
      token,
      username
    });
  } catch (error) {
    console.error(
      'Login error:',
      error
    );

    res.status(500).json({
      ok: false,
      error:
        'حدث خطأ أثناء تسجيل الدخول'
    });
  }
}

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
  requireAdmin,
  (req, res) => {
    sessions.delete(
      getToken(req)
    );

    res.json({
      ok: true
    });
  }
);

/* =========================================================
   البيانات العامة
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
          db.settings ||
          {},

        announcements:
          db.announcements ||
          [],

        programs:
          db.programs ||
          [],

        news:
          db.news ||
          [],

        documents:
          db.documents ||
          [],

        hero:
          db.hero ||
          []
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
   بيانات لوحة التحكم
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
   الإعدادات
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
        db.settings ||
        {}
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
        data:
          db.settings
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

    ensureCms(db);

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
   CRUD لأقسام CMS الجديدة
========================================================= */

const cmsCollections = [
  'services',
  'stats',
  'research',
  'media',
  'pages',
  'navigation'
];

function sortItems(
  items
) {
  return [
    ...items
  ].sort(
    (a, b) =>
      Number(
        a.order || 0
      ) -
      Number(
        b.order || 0
      )
  );
}

for (
  const collection
  of cmsCollections
) {
  const base =
    `/api/admin/${collection}`;

  app.get(
    base,
    requireAdmin,
    async (req, res) => {
      try {
        const db =
          await getData();

        ensureCms(db);

        res.json({
          ok: true,
          data:
            sortItems(
              db.settings.cms[
                collection
              ]
            )
        });
      } catch (error) {
        console.error(error);

        res.status(500).json({
          ok: false,
          error:
            'تعذر تحميل البيانات'
        });
      }
    }
  );

  app.post(
    base,
    requireAdmin,
    async (req, res) => {
      try {
        const db =
          await getData();

        ensureCms(db);

        const items =
          db.settings.cms[
            collection
          ];

        const item = {
          ...(req.body || {}),

          id:
            req.body &&
            req.body.id
              ? req.body.id
              : createId(),

          order:
            req.body &&
            req.body.order !==
              undefined
              ? req.body.order
              : items.length + 1
        };

        items.push(item);

        await saveData(db);

        res.json({
          ok: true,
          data: item
        });
      } catch (error) {
        console.error(error);

        res.status(500).json({
          ok: false,
          error:
            'تعذر إضافة العنصر'
        });
      }
    }
  );

  app.put(
    `${base}/:id`,
    requireAdmin,
    async (req, res) => {
      try {
        const db =
          await getData();

        ensureCms(db);

        const items =
          db.settings.cms[
            collection
          ];

        const index =
          items.findIndex(
            item =>
              String(
                item.id
              ) ===
              String(
                req.params.id
              )
          );

        if (
          index === -1
        ) {
          return res.status(404).json({
            ok: false,
            error:
              'العنصر غير موجود'
          });
        }

        items[index] = {
          ...items[index],
          ...(req.body || {}),
          id:
            items[index].id
        };

        await saveData(db);

        res.json({
          ok: true,
          data:
            items[index]
        });
      } catch (error) {
        console.error(error);

        res.status(500).json({
          ok: false,
          error:
            'تعذر تعديل العنصر'
        });
      }
    }
  );

  app.delete(
    `${base}/:id`,
    requireAdmin,
    async (req, res) => {
      try {
        const db =
          await getData();

        ensureCms(db);

        const items =
          db.settings.cms[
            collection
          ];

        const index =
          items.findIndex(
            item =>
              String(
                item.id
              ) ===
              String(
                req.params.id
              )
          );

        if (
          index === -1
        ) {
          return res.status(404).json({
            ok: false,
            error:
              'العنصر غير موجود'
          });
        }

        items.splice(
          index,
          1
        );

        await saveData(db);

        res.json({
          ok: true
        });
      } catch (error) {
        console.error(error);

        res.status(500).json({
          ok: false,
          error:
            'تعذر حذف العنصر'
        });
      }
    }
  );
}

/* =========================================================
   الأقسام القديمة:
   announcements / programs / news / documents / hero
========================================================= */

const legacyCollections = [
  'announcements',
  'programs',
  'news',
  'documents',
  'hero'
];

for (
  const collection
  of legacyCollections
) {
  const base =
    `/api/admin/${collection}`;

  app.get(
    base,
    requireAdmin,
    async (req, res) => {
      try {
        const db =
          await getData();

        res.json({
          ok: true,
          data:
            db[collection] ||
            []
        });
      } catch (error) {
        console.error(error);

        res.status(500).json({
          ok: false,
          error:
            'تعذر تحميل البيانات'
        });
      }
    }
  );

  app.post(
    base,
    requireAdmin,
    async (req, res) => {
      try {
        const db =
          await getData();

        if (
          !Array.isArray(
            db[collection]
          )
        ) {
          db[collection] =
            [];
        }

        const item = {
          ...(req.body || {}),

          id:
            req.body &&
            req.body.id
              ? req.body.id
              : createId()
        };

        db[collection].push(
          item
        );

        await saveData(db);

        res.json({
          ok: true,
          data: item
        });
      } catch (error) {
        console.error(error);

        res.status(500).json({
          ok: false,
          error:
            'تعذر إضافة العنصر'
        });
      }
    }
  );

  app.put(
    `${base}/:id`,
    requireAdmin,
    async (req, res) => {
      try {
        const db =
          await getData();

        const items =
          db[collection] ||
          [];

        const index =
          items.findIndex(
            item =>
              String(
                item.id
              ) ===
              String(
                req.params.id
              )
          );

        if (
          index === -1
        ) {
          return res.status(404).json({
            ok: false,
            error:
              'العنصر غير موجود'
          });
        }

        items[index] = {
          ...items[index],
          ...(req.body || {}),
          id:
            items[index].id
        };

        await saveData(db);

        res.json({
          ok: true,
          data:
            items[index]
        });
      } catch (error) {
        console.error(error);

        res.status(500).json({
          ok: false,
          error:
            'تعذر تعديل العنصر'
        });
      }
    }
  );

  app.delete(
    `${base}/:id`,
    requireAdmin,
    async (req, res) => {
      try {
        const db =
          await getData();

        const items =
          db[collection] ||
          [];

        const index =
          items.findIndex(
            item =>
              String(
                item.id
              ) ===
              String(
                req.params.id
              )
          );

        if (
          index === -1
        ) {
          return res.status(404).json({
            ok: false,
            error:
              'العنصر غير موجود'
          });
        }

        items.splice(
          index,
          1
        );

        await saveData(db);

        res.json({
          ok: true
        });
      } catch (error) {
        console.error(error);

        res.status(500).json({
          ok: false,
          error:
            'تعذر حذف العنصر'
        });
      }
    }
  );
}

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
        const extension =
          path.extname(
            file.originalname
          );

        const name =
          crypto
            .randomBytes(
              16
            )
            .toString(
              'hex'
            );

        cb(
          null,
          name +
            extension
        );
      }
  });

const upload =
  multer({
    storage,

    limits: {
      fileSize:
        100 *
        1024 *
        1024
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
  async (
    req,
    res
  ) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          ok: false,
          error:
            'لم يتم اختيار ملف'
        });
      }

      const extension =
        path.extname(
          req.file.originalname
        ).toLowerCase();

      if (
        !allowedExtensions.includes(
          extension
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

      const db =
        await getData();

      ensureCms(db);

      /* =========================
         Supabase Storage
      ========================= */

      if (USE_SUPABASE) {
        const fileBuffer =
          fs.readFileSync(
            req.file.path
          );

        const storagePath =
          Date.now() +
          '-' +
          req.file.filename;

        const result =
          await supabase.storage
            .from(
              STORAGE_BUCKET
            )
            .upload(
              storagePath,
              fileBuffer,
              {
                contentType:
                  req.file.mimetype,
                upsert:
                  false
              }
            );

        if (
          result.error
        ) {
          console.error(
            result.error
          );

          return res.status(500).json({
            ok: false,
            error:
              'تعذر رفع الملف إلى التخزين'
          });
        }

        const publicUrl =
          supabase.storage
            .from(
              STORAGE_BUCKET
            )
            .getPublicUrl(
              storagePath
            )
            .data
            .publicUrl;

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
            publicUrl,

          type:
            req.file.mimetype,

          size:
            req.file.size,

          createdAt:
            new Date().toISOString()
        };

        db.settings.cms.media.push(
          fileInfo
        );

        await saveData(db);

        return res.json({
          ok: true,
          data:
            fileInfo
        });
      }

      /* =========================
         التخزين المحلي
      ========================= */

      const fileInfo = {
        id:
          createId(),

        name:
          req.file.originalname,

        filename:
          req.file.filename,

        url:
          '/uploads/' +
          req.file.filename,

        type:
          req.file.mimetype,

        size:
          req.file.size,

        createdAt:
          new Date().toISOString()
      };

      db.settings.cms.media.push(
        fileInfo
      );

      await saveData(db);

      res.json({
        ok: true,
        data:
          fileInfo
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
   حذف ملف
========================================================= */

app.delete(
  '/api/admin/upload/:id',
  requireAdmin,
  async (
    req,
    res
  ) => {
    try {
      const db =
        await getData();

      ensureCms(db);

      const media =
        db.settings.cms.media;

      const index =
        media.findIndex(
          item =>
            String(
              item.id
            ) ===
            String(
              req.params.id
            )
        );

      if (
        index === -1
      ) {
        return res.status(404).json({
          ok: false,
          error:
            'الملف غير موجود'
        });
      }

      const file =
        media[index];

      if (
        USE_SUPABASE &&
        file.filename
      ) {
        const result =
          await supabase.storage
            .from(
              STORAGE_BUCKET
            )
            .remove([
              file.filename
            ]);

        if (
          result.error
        ) {
          console.error(
            result.error
          );
        }
      } else if (
        file.filename
      ) {
        const localFile =
          path.join(
            UPLOAD_DIR,
            file.filename
          );

        if (
          fs.existsSync(
            localFile
          )
        ) {
          fs.unlinkSync(
            localFile
          );
        }
      }

      media.splice(
        index,
        1
      );

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
   ملفات الرفع المحلية
========================================================= */

app.use(
  '/uploads',
  express.static(
    UPLOAD_DIR
  )
);

/* =========================================================
   فحص الخادم
========================================================= */

app.get(
  '/api/health',
  async (
    req,
    res
  ) => {
    let supabaseOk =
      false;

    if (
      USE_SUPABASE
    ) {
      try {
        await getSupabaseData();

        supabaseOk =
          true;
      } catch (error) {
        console.error(
          'Supabase health error:',
          error
        );
      }
    }

    res.json({
      ok: true,

      database:
        USE_SUPABASE
          ? 'supabase'
          : 'local',

      supabase:
        supabaseOk,

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
        documents: true,
        hero: true,
        uploads: true
      }
    });
  }
);

/* =========================================================
   ملفات الموقع
========================================================= */

app.use(
  express.static(
    PUBLIC_DIR
  )
);

/* =========================================================
   لوحة الإدارة
========================================================= */

app.get(
  '/admin',
  (
    req,
    res
  ) => {
    const adminFile =
      path.join(
        PUBLIC_DIR,
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
   لا نستخدم app.get('*')
   لأن Express 5 يسبب PathError
========================================================= */

app.use(
  (
    req,
    res
  ) => {
    const indexFile =
      path.join(
        PUBLIC_DIR,
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
      return next(
        error
      );
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
