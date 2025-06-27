import express from 'express';
import path from 'path';
import fs from 'fs';
import compression from 'compression';
import helmet from 'helmet';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// الحصول على عنوان IP المحلي
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const networkInterface of interfaces[name]) {
      if (networkInterface.family === 'IPv4' && !networkInterface.internal) {
        return networkInterface.address;
      }
    }
  }
  return 'localhost';
}

// Middleware للأمان
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "https:"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      childSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// ضغط الاستجابات
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 0
}));

// Middleware للتخزين المؤقت
app.use((req, res, next) => {
  const ext = path.extname(req.url).toLowerCase();
  
  // ملفات ثابتة - تخزين مؤقت طويل
  if (['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.webp'].includes(ext)) {
    res.set('Cache-Control', 'public, max-age=31536000'); // سنة واحدة
    res.set('Expires', new Date(Date.now() + 31536000000).toUTCString());
  }
  // HTML - بدون تخزين مؤقت
  else if (ext === '.html' || req.url === '/') {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  
  next();
});

// خدمة الملفات الثابتة
app.use(express.static('.', {
  maxAge: '1y',
  etag: true,
  lastModified: true
}));

// معالجة Service Worker
app.get('/sw.js', (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.sendFile(path.join(__dirname, 'public', 'sw.js'));
});

// معالجة Manifest
app.get('/manifest.json', (req, res) => {
  res.set('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

// معالجة Client-side routing - إرجاع index.html لجميع المسارات
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>خطأ 404 - الصفحة غير موجودة</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #1f2937, #374151);
            color: white;
            min-height: 100vh;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
          }
          h1 { font-size: 4em; margin: 0; color: #ef4444; }
          h2 { margin: 20px 0; color: #60a5fa; }
          p { font-size: 1.2em; margin: 20px 0; }
          .home-btn {
            background: #3b82f6;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            font-size: 1.1em;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
          }
          .home-btn:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <div>
          <h1>404</h1>
          <h2>الصفحة غير موجودة</h2>
          <p>عذراً، الصفحة التي تبحث عنها غير موجودة.</p>
          <a href="/" class="home-btn">العودة للصفحة الرئيسية</a>
        </div>
      </body>
      </html>
    `);
  }
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
  console.error('خطأ في الخادم:', err);
  res.status(500).send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>خطأ 500 - خطأ داخلي</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 50px;
          background: linear-gradient(135deg, #1f2937, #374151);
          color: white;
          min-height: 100vh;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }
        h1 { font-size: 4em; margin: 0; color: #ef4444; }
        h2 { margin: 20px 0; color: #60a5fa; }
        p { font-size: 1.2em; margin: 20px 0; }
        .home-btn {
          background: #3b82f6;
          color: white;
          padding: 15px 30px;
          border: none;
          border-radius: 8px;
          font-size: 1.1em;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          margin-top: 20px;
        }
        .home-btn:hover { background: #2563eb; }
      </style>
    </head>
    <body>
      <div>
        <h1>500</h1>
        <h2>خطأ داخلي في الخادم</h2>
        <p>عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.</p>
        <a href="/" class="home-btn">العودة للصفحة الرئيسية</a>
      </div>
    </body>
    </html>
  `);
});

// تشغيل الخادم
const server = app.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  
  console.log('\n🚀 تم تشغيل نظام إدارة التقارير العسكرية بنجاح!');
  console.log('═══════════════════════════════════════════════════');
  console.log(`🌐 الخادم يعمل على المنفذ: ${PORT}`);
  console.log(`📱 للوصول من الجوال: http://${localIP}:${PORT}`);
  console.log(`💻 للوصول من الكمبيوتر: http://localhost:${PORT}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('✅ الميزات المفعلة:');
  console.log('   🛡️ الأمان المتقدم (Helmet)');
  console.log('   🗜️ ضغط الملفات (Compression)');
  console.log('   📦 التخزين المؤقت الذكي');
  console.log('   📱 دعم PWA كامل');
  console.log('   🔄 Client-side routing');
  console.log('═══════════════════════════════════════════════════');
  console.log('🛑 للإيقاف اضغط Ctrl+C');
  console.log('');
});

// معالجة إشارات الإيقاف
process.on('SIGINT', () => {
  console.log('\n🛑 إيقاف الخادم...');
  server.close(() => {
    console.log('✅ تم إيقاف الخادم بنجاح');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 إيقاف الخادم...');
  server.close(() => {
    console.log('✅ تم إيقاف الخادم بنجاح');
    process.exit(0);
  });
});

// معالجة الأخطاء غير المتوقعة
process.on('uncaughtException', (error) => {
  console.error('خطأ غير متوقع:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise غير معالج:', reason);
});