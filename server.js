import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تحديد المنفذ
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// أنواع MIME للملفات المختلفة
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.jsx': 'text/jsx; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'font/eot',
  '.webp': 'image/webp',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8'
};

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

// إنشاء الخادم
const server = http.createServer((req, res) => {
  try {
    // تنظيف URL وإزالة query parameters
    let filePath = req.url.split('?')[0];
    
    // إذا كان الطلب للجذر، إرجاع index.html
    if (filePath === '/') {
      filePath = '/index.html';
    }
    
    // تحديد المسار الكامل للملف
    const fullPath = path.join(__dirname, filePath);
    
    // التحقق من وجود الملف
    if (!fs.existsSync(fullPath)) {
      // إذا لم يوجد الملف، أرجع index.html للتعامل مع client-side routing
      const indexPath = path.join(__dirname, 'index.html');
      if (fs.existsSync(indexPath)) {
        const indexContent = fs.readFileSync(indexPath);
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
        res.end(indexContent);
        return;
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('الصفحة غير موجودة - 404 Not Found');
        return;
      }
    }
    
    // قراءة الملف
    const content = fs.readFileSync(fullPath);
    const extension = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extension] || 'application/octet-stream';
    
    // تحديد headers للتخزين المؤقت
    let cacheHeaders = {};
    if (['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'].includes(extension)) {
      cacheHeaders = {
        'Cache-Control': 'public, max-age=31536000', // سنة واحدة
        'Expires': new Date(Date.now() + 31536000000).toUTCString()
      };
    } else if (extension === '.html') {
      cacheHeaders = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
    }
    
    // إضافة headers الأمان
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
    };
    
    // إرسال الاستجابة
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...cacheHeaders,
      ...securityHeaders
    });
    
    res.end(content);
    
  } catch (error) {
    console.error('خطأ في الخادم:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('خطأ داخلي في الخادم - 500 Internal Server Error');
  }
});

// بدء تشغيل الخادم
server.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  
  console.log('\n🚀 تم تشغيل نظام إدارة التقارير العسكرية بنجاح!');
  console.log('═══════════════════════════════════════════════════');
  console.log(`🌐 الخادم يعمل على المنفذ: ${PORT}`);
  console.log(`📱 للوصول من الجوال: http://${localIP}:${PORT}`);
  console.log(`💻 للوصول من الكمبيوتر: http://localhost:${PORT}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('✅ جاهز لاستقبال الطلبات!');
  console.log('🛑 للإيقاف اضغط Ctrl+C');
  console.log('');
});

// التعامل مع إشارات الإيقاف
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

// معالجة الأخطاء
process.on('uncaughtException', (error) => {
  console.error('خطأ غير متوقع:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise غير معالج:', reason);
});