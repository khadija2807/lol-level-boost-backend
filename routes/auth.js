// server/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs'); // Şifrələri heşləmək üçün kitabxana
const jwt = require('jsonwebtoken'); // JSON Web Token yaratmaq üçün kitabxana
const User = require('../models/User'); // User modelini daxil edirik
const auth = require('../middleware/auth'); // Autentifikasiya middleware-ni daxil edirik

const router = express.Router(); // Yeni bir Express router obyekti yaradırıq

// --- Qeydiyyat (Register) API Endpoint-i ---
// İstifadəçi yeni hesab yaratmaq üçün bu endpoint-ə POST sorğusu göndərəcək.
router.post('/register', async (req, res) => {
  // Sorğu body-sindən istifadəçi adı, e-poçt və şifrəni alırıq.
  const { username, email, password } = req.body;

  try {
    // 1. E-poçtun artıq istifadə olunub-olunmadığını yoxlayırıq.
    let user = await User.findOne({ email });
    if (user) {
      // Əgər e-poçt artıq mövcuddursa, 400 Bad Request statusu ilə xəta mesajı qaytarırıq.
      return res.status(400).json({ msg: 'Bu e-poçt ilə istifadəçi artıq mövcuddur.' });
    }

    // 2. İstifadəçi adının artıq istifadə olunub-olunmadığını yoxlayırıq.
    user = await User.findOne({ username });
    if (user) {
      // Əgər istifadəçi adı artıq mövcuddursa, 400 Bad Request statusu ilə xəta mesajı qaytarırıq.
      return res.status(400).json({ msg: 'Bu istifadəçi adı artıq mövcuddur.' });
    }

    // 3. Yeni bir istifadəçi obyekti yaradırıq.
    user = new User({
      username,
      email,
      password // Şifrə hələ heşlənməyib
    });

    // 4. Şifrəni heşləyirik (təhlükəsizlik üçün).
    // bcrypt.genSalt(10) ilə 10 raundluq bir "salt" yaradırıq. Salt, şifrəni heşləyərkən əlavə təhlükəsizlik təmin edir.
    const salt = await bcrypt.genSalt(10);
    // Şifrəni heşləyib istifadəçi obyektinə yazırıq.
    user.password = await bcrypt.hash(password, salt);

    // 5. İstifadəçini verilənlər bazasına yadda saxlayırıq.
    await user.save();

    // 6. JSON Web Token (JWT) yaradırıq.
    // Tokenin içində istifadəçinin ID-si və rolu olacaq.
    const payload = {
      user: {
        id: user.id,   // MongoDB tərəfindən avtomatik yaradılan ID
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err; // Xəta olarsa, onu atırıq
        // Uğurlu qeydiyyatdan sonra tokeni və istifadəçi məlumatlarını cavab olaraq göndəririk.
        res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
      }
    );

  } catch (err) {
    // Hər hansı bir server xətası baş verərsə, konsola yazdırırıq və 500 Server Error qaytarırıq.
    console.error(err.message);
    res.status(500).send('Server xətası');
  }
});

// --- Giriş (Login) API Endpoint-i ---
// İstifadəçi daxil olmaq üçün bu endpoint-ə POST sorğusu göndərəcək.
router.post('/login', async (req, res) => {
  // Sorğu body-sindən e-poçt və şifrəni alırıq.
  const { email, password } = req.body;

  try {
    // 1. E-poçtla istifadəçini tapırıq.
    let user = await User.findOne({ email });
    if (!user) {
      // Əgər istifadəçi tapılmasa, 400 Bad Request statusu ilə xəta mesajı qaytarırıq.
      return res.status(400).json({ msg: 'Yanlış email və ya şifrə.' });
    }

    // 2. Daxil edilmiş şifrənin verilənlər bazasındakı heşlənmiş şifrə ilə uyğun gəlib-gəlmədiyini yoxlayırıq.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Əgər şifrələr uyğun gəlmirsə, 400 Bad Request statusu ilə xəta mesajı qaytarırıq.
      return res.status(400).json({ msg: 'Yanlış email və ya şifrə.' });
    }

    // 3. JSON Web Token (JWT) yaradırıq (qeydiyyatda olduğu kimi).
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        // Uğurlu girişdən sonra tokeni və istifadəçi məlumatlarını cavab olaraq göndəririk.
        res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server xətası');
  }
});

// --- İstifadəçi Məlumatlarını Almaq (GET /api/auth/me) ---
// Bu endpoint daxil olmuş istifadəçinin öz məlumatlarını alması üçündür.
// 'auth' middleware-i tokeni yoxlayır və req.user obyektini doldurur.
router.get('/me', auth, async (req, res) => {
  try {
    // req.user.id auth middleware-dən gəlir.
    // Şifrəni qaytarmamaq üçün .select('-password') istifadə edirik.
    const user = await User.findById(req.user.id).select('-password');
    res.json(user); // İstifadəçi məlumatlarını cavab olaraq göndəririk
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server xətası');
  }
});

module.exports = router; // Router obyektini export edirik ki, index.js-də istifadə olunsun.
