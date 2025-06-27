import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const HOST = '0.0.0.0';

// أنواع MIME
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jsx': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

// الحصول على IP المحلي
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

// قراءة ملف index.html وتحويله لـ SPA
function getIndexHTML() {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  
  // إضافة تطوير React مباشر
  const reactDevHTML = html.replace(
    '<script type="module" src="/src/main.jsx"></script>',
    `
    <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@18.2.0",
        "react-dom": "https://esm.sh/react-dom@18.2.0",
        "react-dom/client": "https://esm.sh/react-dom@18.2.0/client",
        "react-router-dom": "https://esm.sh/react-router-dom@6.16.0",
        "@radix-ui/react-alert-dialog": "https://esm.sh/@radix-ui/react-alert-dialog@1.0.5",
        "@radix-ui/react-avatar": "https://esm.sh/@radix-ui/react-avatar@1.0.3",
        "@radix-ui/react-checkbox": "https://esm.sh/@radix-ui/react-checkbox@1.0.4",
        "@radix-ui/react-dialog": "https://esm.sh/@radix-ui/react-dialog@1.0.5",
        "@radix-ui/react-dropdown-menu": "https://esm.sh/@radix-ui/react-dropdown-menu@2.0.5",
        "@radix-ui/react-label": "https://esm.sh/@radix-ui/react-label@2.0.2",
        "@radix-ui/react-select": "https://esm.sh/@radix-ui/react-select@2.0.0",
        "@radix-ui/react-tabs": "https://esm.sh/@radix-ui/react-tabs@1.0.4",
        "clsx": "https://esm.sh/clsx@2.0.0",
        "lucide-react": "https://esm.sh/lucide-react@0.285.0",
        "framer-motion": "https://esm.sh/framer-motion@10.16.4"
      }
    }
    </script>
    <script type="module" src="/src/main.jsx"></script>
    `
  );
  
  return reactDevHTML;
}

// إنشاء الخادم
const server = http.createServer((req, res) => {
  try {
    console.log(`📡 طلب: ${req.method} ${req.url} من ${req.headers['user-agent']?.substring(0, 50)}...`);
    
    let filePath = req.url.split('?')[0];
    
    // معالجة CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    // الصفحة الرئيسية
    if (filePath === '/') {
      const html = getIndexHTML();
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache'
      });
      res.end(html);
      return;
    }
    
    // معالجة الملفات
    const fullPath = path.join(__dirname, filePath);
    
    // التحقق من الأمان - منع الوصول خارج المجلد
    if (!fullPath.startsWith(__dirname)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }
    
    // التحقق من وجود الملف
    if (!fs.existsSync(fullPath)) {
      // للـ SPA routing، أرجع index.html
      if (!filePath.includes('.')) {
        const html = getIndexHTML();
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache'
        });
        res.end(html);
        return;
      }
      
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`الملف غير موجود: ${filePath}`);
      return;
    }
    
    // قراءة الملف
    const content = fs.readFileSync(fullPath);
    const extension = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extension] || 'application/octet-stream';
    
    // إعداد headers
    const headers = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    };
    
    // تخزين مؤقت للملفات الثابتة
    if (['.js', '.css', '.png', '.jpg', '.gif', '.svg', '.ico', '.woff', '.woff2'].includes(extension)) {
      headers['Cache-Control'] = 'public, max-age=3600';
    } else {
      headers['Cache-Control'] = 'no-cache';
    }
    
    res.writeHead(200, headers);
    res.end(content);
    
  } catch (error) {
    console.error('❌ خطأ في الخادم:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`خطأ داخلي: ${error.message}`);
  }
});

// تشغيل الخادم
server.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  
  console.log('\n🚀 تم تشغيل نظام إدارة التقارير العسكرية بنجاح!');
  console.log('═══════════════════════════════════════════════════');
  console.log(`🌐 الخادم يعمل على المنفذ: ${PORT}`);
  console.log(`📱 للوصول من الجوال: http://${localIP}:${PORT}`);
  console.log(`💻 للوصول من الكمبيوتر: http://localhost:${PORT}`);
  console.log('═══════════════════════════════════════════════════');
  console.log('✅ جاهز لاستقبال الطلبات!');
  console.log('🛑 للإيقاف اضغط Ctrl+C\n');
});

// معالجة الإيقاف
process.on('SIGINT', () => {
  console.log('\n🛑 إيقاف الخادم...');
  server.close(() => {
    console.log('✅ تم إيقاف الخادم بنجاح');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('❌ خطأ غير متوقع:', error);
});

export default server;