// server/index.js

// .env faylındakı ətraf mühit dəyişənlərini yükləyirik (PORT, MONGODB_URI, JWT_SECRET kimi).
// Bu, həssas məlumatların kodda birbaşa olmamasını təmin edir.
require('dotenv').config();

// Lazımi Node.js kitabxanalarını daxil edirik.
const express = require('express');    // Veb serverimizi qurmaq üçün Express framework-u
const mongoose = require('mongoose');  // MongoDB verilənlər bazası ilə əlaqə üçün Mongoose
const cors = require('cors');          // Frontend ilə backend arasındakı brauzer təhlükəsizlik problemlərini həll edir.

// Express tətbiqini (serveri) yaradırıq.
const app = express();

// Serverin dinləyəcəyi portu müəyyənləşdiririk.
// Əgər ətraf mühitdə PORT dəyişəni varsa (məsələn, hostinqdə), onu istifadə edir.
// Yoxdursa, yerli inkişaf üçün 5000 portunu istifadə edir.
const PORT = process.env.PORT || 5000; // Render öz PORT dəyişənini təmin edəcək
// ...
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// MongoDB bağlantı stringini .env faylından alırıq.
const MONGODB_URI = process.env.MONGODB_URI;

// --- Middleware-lər (Sorğuların emalı üçün funksiyalar) ---
// CORS-u aktivləşdiririk. Bu, frontend-in (məsələn, localhost:3000) serverə (localhost:5000) sorğu göndərməsinə icazə verir.
app.use(cors());
// Express-ə deyirik ki, gələn sorğuların JSON formatında olan body hissəsini oxusun və JavaScript obyekti kimi əlçatan etsin.
app.use(express.json());

// --- Routeları daxil edirik ---
// testRoutes.js faylındakı routeları /api prefix-i ilə istifadə edirik
app.use('/api', require('./routes/testRoutes'));
// auth.js faylındakı autentifikasiya routelarını /api/auth prefix-i ilə istifadə edirik
app.use('/api/auth', require('./routes/auth'));
// orders.js faylındakı sifariş routelarını /api/orders prefix-i ilə istifadə edirik
app.use('/api/orders', require('./routes/orders')); // Yeni sifariş routelarını daxil edirik

// --- Yenidən əlavə edilmiş kök (root) route ---
// Serverin işləyib-işləmədiyini yoxlamaq üçün sadə bir GET routerı yaradırıq.
// Bu, brauzerdə http://localhost:5000 ünvanına daxil olduqda cavab verəcək.
app.get('/', (req, res) => {
  res.send('🚀 LoL Level Boost API-yə xoş gəlmisiniz! Server işləyir.');
});

// --- MongoDB-yə Qoşulma ---
// Mongoose ilə MongoDB-yə qoşuluruq.
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB-yə uğurla qoşuldu!')) // Qoşulma uğurlu olduqda bu mesajı konsolda göstərir.
  .catch(err => console.error('❌ MongoDB qoşulma xətası:', err)); // Xəta olarsa, xəta mesajını göstərir.

// --- Serveri Başlatma ---
// Serveri müəyyən edilmiş portda dinləməyə başlayırıq.
// Bu, serverin daxil olan HTTP sorğularını qəbul etməyə hazır olduğunu bildirir.
app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} ünvanında işləyir...`);
});
