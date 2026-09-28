```javascript
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
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (_) {
      return null;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      if (['node_modules', '.git', '.cache'].includes(entry.name)) {
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
   قاعدة البيانات
========================================================= */

const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

fs.mkdirSync(DATA_DIR, { recursive: true });

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const USE_SUPABASE = Boolean(
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET || 'peace-files';

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
    siteTitle: 'مركز دراسات السلام والتنمية',
    subtitle: 'جامعة السلام – ولاية غرب كردفان',

    aboutTitle: 'معرفة تخدم السلام والتنمية',

    aboutText1:
      'يعمل مركز دراسات السلام والتنمية بجامعة السلام على دعم البحث العلمي والتعليم والتدريب في مجالات السلام والتنمية، مع تركيز خاص على قضايا غرب كردفان والمجتمعات المحلية.',

    aboutText2:
      'نسعى إلى تحويل المعرفة والدراسات إلى برامج ومبادرات عملية تعزز الحوار والتعايش والتنمية المستدامة.',

    phone: '+249 121 145 757',
    email: 'info@alsalam.edu.sd',

    address:
      'جامعة السلام – ولاية غرب كردفان',

    footerSlogan:
      'معًا من أجل سلام مستدام وتنمية شاملة',

    logo: 'center.jpg',

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
          title: 'دراسات السلام والتنمية في غرب كردفان',
          text:
            'دراسات وبحوث علمية تتناول قضايا السلام والتنمية والمجتمع المحلي.',
          image: '',
          file: '',
          order: 1,
          visible: true
        },
        {
          id: 'r2',
          title: 'البحث العلمي وخدمة المجتمع',
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
        kicker: 'مركز دراسات السلام والتنمية',
        title:
          'المعرفة والبحث العلمي من أجل السلام والتنمية المستدامة في السودان',
        description:
          'منصة أكاديمية للبحث والحوار وبناء القدرات، ودعم المبادرات التي تسهم في مجتمعات أكثر سلامًا وتماسكًا وتنمية.',
        buttonText: 'اكتشف المزيد ←',
        buttonLink: '#about',
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
  return JSON.parse(JSON.stringify(initial));
}

function id() {
  return crypto.randomUUID();
}

function hashPassword(
  password,
  salt = crypto.randomBytes(16).toString('hex')
) {
  const hash = crypto
    .scryptSync(password, salt, 64)
    .toString('hex');

  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, key] = String(stored || '').split(':');

  if (!salt || !key) return false;

  const derived = crypto
    .scryptSync(password, salt, 64)
    .toString('hex');

  const a = Buffer.from(key, 'hex');
  const b = Buffer.from(derived, 'hex');

  return (
    a.length === b.length &&
    crypto.timingSafeEqual(a, b)
  );
}

/* =========================================================
   توحيد البيانات الجديدة
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
   Local Database
========================================================= */

function loadLocal() {
  if (!fs.existsSync(DB_FILE)) {
    const db = cloneInitial();

    db.admin = {
      username:
        process.env.ADMIN_USERNAME || 'admin',

      passwordHash:
        hashPassword(
          process.env.ADMIN_PASSWORD || 'Peace@2026'
        )
    };

    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(db, null, 2)
    );
  }

  const db = JSON.parse(
    fs.readFileSync(DB_FILE, 'utf8')
  );

  ensureCms(db);

  return db;
}

function saveLocal(db) {
  ensureCms(db);

  fs.writeFileSync(
    DB_FILE,
    JSON.stringify(db, null, 2)
  );
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

  if (error) throw error;

  if (!data) {
    const seed = cloneInitial();

    const {
      error: insertError
    } = await supabase
      .from('site_data')
      .insert({
        id: 1,
        settings: seed.settings,
        announcements:
          seed.announcements,
```
