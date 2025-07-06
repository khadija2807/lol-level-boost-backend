// server/middleware/auth.js
const jwt = require('jsonwebtoken'); // JSON Web Token-ləri yoxlamaq üçün kitabxana

// Bu middleware funksiyası hər bir qorunan API sorğusundan əvvəl işə düşəcək.
module.exports = function(req, res, next) {
  // 1. Sorğu başlığından (request header) tokeni alırıq.
  // Adətən token 'x-auth-token' başlığı altında göndərilir.
  const token = req.header('x-auth-token');

  // 2. Tokenin mövcudluğunu yoxlayırıq.
  // Əgər token yoxdursa, istifadəçi daxil olmayıb və icazə rədd edilir.
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' }); // 401 Unauthorized statusu
  }

  // 3. Tokeni yoxlayırıq (verify).
  // Try-catch bloku xəta idarəçiliyi üçündür, çünki token yanlış və ya vaxtı bitmiş ola bilər.
  try {
    // jwt.verify funksiyası tokeni və gizli açarı (JWT_SECRET) istifadə edərək tokenin etibarlılığını yoxlayır.
    // Əgər token etibarlıdırsa, decoded obyekti tokenin içindəki məlumatları ehtiva edir.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tokenin içindəki istifadəçi məlumatlarını (id, rol) 'req' obyektinə əlavə edirik.
    // Beləliklə, növbəti router funksiyaları bu məlumatlara asanlıqla çata bilər.
    req.user = decoded.user;

    // 'next()' funksiyası, middleware-dən sonra növbəti funksiyanın (məsələn, API routerının) işə düşməsini təmin edir.
    next();
  } catch (err) {
    // Əgər token etibarsızdırsa (məsələn, saxta və ya vaxtı bitmiş), xəta qaytarılır.
    res.status(401).json({ msg: 'Token is not valid' }); // 401 Unauthorized statusu
  }
};
