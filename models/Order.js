// server/models/Order.js
const mongoose = require('mongoose');

// Sifariş sxemini (schema) təyin edirik. Bu, MongoDB-də sifariş sənədlərinin quruluşunu müəyyən edir.
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // Bu, User modelinə istinad edir
    ref: 'User',                          // 'User' kolleksiyasına istinad olduğunu göstərir
    required: true                        // Hər sifarişin bir istifadəçiyə aid olması mütləqdir
  },
  currentLevel: {
    type: Number,      // Cari səviyyə rəqəm olmalıdır
    required: true,    // Mütləq doldurulmalıdır
    min: 1,            // Minimum səviyyə 1 ola bilər
    max: 30            // Maksimum səviyyə 30 ola bilər (LoL səviyyə limiti)
  },
  desiredLevel: {
    type: Number,      // Hədəf səviyyə rəqəm olmalıdır
    required: true,    // Mütləq doldurulmalıdır
    min: 1,
    max: 30
  },
  server: {
    type: String,      // Server adı string olmalıdır (məsələn, TR, EUW, EUNE)
    required: true,    // Mütləq doldurulmalıdır
    enum: ['TR', 'EUW', 'EUNE', 'NA', 'KR', 'BR', 'RU', 'OCE', 'LAN', 'LAS', 'JP'] // Yalnız bu dəyərlərdən biri ola bilər
  },
  status: {
    type: String,      // Sifarişin statusu (məsələn, Pending, In Progress, Completed)
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], // Yalnız bu dəyərlərdən biri ola bilər
    default: 'Pending' // Varsayılan status 'Pending' (Gözləmədə)
  },
  price: {
    type: Number,      // Sifarişin qiyməti
    required: true,    // Mütləq doldurulmalıdır
    min: 0             // Qiymət mənfi ola bilməz
  },
  paymentStatus: {
    type: String,      // Ödənişin statusu
    enum: ['Pending', 'Paid', 'Refunded'],
    default: 'Pending'
  },
  booster: {
    type: mongoose.Schema.Types.ObjectId, // Bu, sifarişi yerinə yetirən booster-ə istinad edir
    ref: 'User'                           // 'User' kolleksiyasına istinad olduğunu göstərir
  },
  notes: {
    type: String,      // Əlavə qeydlər
    maxlength: 500     // Maksimum 500 simvol
  }
}, {
  timestamps: true // 'createdAt' (yaradılma tarixi) və 'updatedAt' (son yenilənmə tarixi) sahələrini avtomatik əlavə edir
});

// 'Order' adlı MongoDB kolleksiyası üçün modeli export edirik.
module.exports = mongoose.model('Order', orderSchema);
