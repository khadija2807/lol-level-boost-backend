// server/routes/testRoutes.js
const express = require('express');
const router = express.Router();

// Bu, test üçün bir API endpoint-idir.
// http://localhost:5000/api/test ünvanına GET sorğusu göndəriləndə cavab verəcək.
router.get('/test', (req, res) => {
  res.json({ message: 'Backend API-si uğurla işləyir və məlumat göndərir!', data: { key: 'value' } });
});

module.exports = router;