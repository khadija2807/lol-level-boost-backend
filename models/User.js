// server/models/User.js
const mongoose = require('mongoose'); // Mongoose kitabxanasını daxil edirik

// İstifadəçi sxemini (schema) təyin edirik. Bu, MongoDB-də istifadəçi sənədlərinin quruluşunu müəyyən edir.
const userSchema = new mongoose.Schema({
  username: {
    type: String,     // Veri tipi string (mətn) olmalıdır
    required: true,   // Bu sahə mütləq doldurulmalıdır
    unique: true,     // Hər istifadəçi üçün unikal olmalıdır (təkrar olmamalıdır)
    trim: true,       // Boşluqları avtomatik təmizləyir
    minlength: 3      // Minimum 3 simvol uzunluğunda olmalıdır
  },
  email: {
    type: String,     // Veri tipi string olmalıdır
    required: true,   // Mütləq doldurulmalıdır
    unique: true,     // Unikal olmalıdır
    trim: true,       // Boşluqları təmizləyir
    lowercase: true,  // Bütün hərfləri kiçik hərflərə çevirir (axtarışı asanlaşdırır)
    match: [/.+@.+\..+/, 'Please fill a valid email address'] // E-poçt formatını yoxlayır (regex ilə)
  },
  password: {
    type: String,     // Veri tipi string olmalıdır
    required: true,   // Mütləq doldurulmalıdır
    minlength: 6      // Minimum 6 simvol uzunluğunda olmalıdır (heşləndikdən sonra daha uzun olacaq)
  },
  role: {
    type: String,     // Veri tipi string olmalıdır
    enum: ['customer', 'booster', 'admin'], // Yalnız bu dəyərlərdən biri ola bilər
    default: 'customer' // Əgər rol təyin edilməyibsə, avtomatik olaraq 'customer' olur
  }
}, {
  timestamps: true // 'createdAt' (yaradılma tarixi) və 'updatedAt' (son yenilənmə tarixi) sahələrini avtomatik əlavə edir
});

// 'User' adlı MongoDB kolleksiyası üçün modeli export edirik.
// Bu model vasitəsilə verilənlər bazasında istifadəçiləri yarada, oxuya, yeniləyə və silə bilərik.
module.exports = mongoose.model('User', userSchema);
