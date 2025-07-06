// server/routes/orders.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Autentifikasiya middleware-ni daxil edirik
const Order = require('../models/Order');   // Order modelini daxil edirik

// --- Yeni Sifariş Yaratmaq (POST /api/orders) ---
// Yalnız daxil olmuş istifadəçilər (customer, booster, admin) sifariş yarada bilər.
router.post('/', auth, async (req, res) => {
  const { currentLevel, desiredLevel, server, price, notes } = req.body;

  try {
    // Yeni sifariş obyekti yaradırıq
    const newOrder = new Order({
      user: req.user.id, // Auth middleware-dən gələn istifadəçi ID-si
      currentLevel,
      desiredLevel,
      server,
      price,
      notes
    });

    // Sifarişi verilənlər bazasına yadda saxlayırıq
    const order = await newOrder.save();
    res.json(order); // Yaradılmış sifarişi cavab olaraq göndəririk

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server xətası');
  }
});

// --- Bütün Sifarişləri Almaq (GET /api/orders) ---
// Yalnız daxil olmuş istifadəçilər sifarişləri görə bilər.
// Adminlər bütün sifarişləri, müştərilər öz sifarişlərini görəcək.
router.get('/', auth, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      // Adminlər bütün sifarişləri görə bilər
      orders = await Order.find().populate('user', ['username', 'email']).populate('booster', ['username']);
    } else {
      // Müştərilər yalnız öz sifarişlərini görə bilər
      orders = await Order.find({ user: req.user.id }).populate('user', ['username', 'email']).populate('booster', ['username']);
    }
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server xətası');
  }
});

// --- ID-yə Görə Sifariş Almaq (GET /api/orders/:id) ---
// Yalnız sifarişin sahibi, booster-i və ya admin sifarişi görə bilər.
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', ['username', 'email']).populate('booster', ['username']);

    if (!order) {
      return res.status(404).json({ msg: 'Sifariş tapılmadı' });
    }

    // Yalnız sifarişin sahibi, booster-i və ya admin görə bilər
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin' && (order.booster && order.booster.toString() !== req.user.id)) {
      return res.status(401).json({ msg: 'İcazə yoxdur' });
    }

    res.json(order);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') { // Əgər ID formatı səhvdirsə
      return res.status(404).json({ msg: 'Sifariş tapılmadı' });
    }
    res.status(500).send('Server xətası');
  }
});

// --- Sifarişi Yeniləmək (PUT /api/orders/:id) ---
// Yalnız sifarişin sahibi (bəzi sahələri), booster və ya admin yeniləyə bilər.
router.put('/:id', auth, async (req, res) => {
  const { currentLevel, desiredLevel, server, status, price, paymentStatus, booster, notes } = req.body;

  // Yenilənəcək sahələri obyektə yığırıq
  const orderFields = {};
  if (currentLevel) orderFields.currentLevel = currentLevel;
  if (desiredLevel) orderFields.desiredLevel = desiredLevel;
  if (server) orderFields.server = server;
  if (notes) orderFields.notes = notes;

  // Admin və ya booster roluna görə yeniləmə icazələri
  if (req.user.role === 'admin' || req.user.role === 'booster') {
    if (status) orderFields.status = status;
    if (price) orderFields.price = price;
    if (paymentStatus) orderFields.paymentStatus = paymentStatus;
    if (booster) orderFields.booster = booster;
  }

  try {
    let order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ msg: 'Sifariş tapılmadı' });

    // Yalnız sifarişin sahibi, booster-i və ya admin yeniləyə bilər
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin' && (order.booster && order.booster.toString() !== req.user.id)) {
      return res.status(401).json({ msg: 'İcazə yoxdur' });
    }

    // Müştəri yalnız öz sifarişinin bəzi sahələrini yeniləyə bilər (məsələn, qeydləri)
    if (req.user.role === 'customer' && order.user.toString() === req.user.id) {
      // Müştərilərin dəyişə biləcəyi sahələri məhdudlaşdırırıq
      const allowedCustomerUpdates = ['notes'];
      for (const key in orderFields) {
        if (!allowedCustomerUpdates.includes(key)) {
          // Müştəri icazəsiz sahəni dəyişməyə çalışırsa
          return res.status(403).json({ msg: 'Müştəri bu sahəni yeniləyə bilməz' });
        }
      }
    }


    order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: orderFields }, // Yalnız dəyişdirilmiş sahələri yeniləyir
      { new: true }         // Yenilənmiş sənədi qaytarır
    ).populate('user', ['username', 'email']).populate('booster', ['username']);

    res.json(order);

  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Sifariş tapılmadı' });
    }
    res.status(500).send('Server xətası');
  }
});

// --- Sifarişi Silmək (DELETE /api/orders/:id) ---
// Yalnız adminlər sifarişi silə bilər.
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ msg: 'Sifariş tapılmadı' });
    }

    // Yalnız adminlər silə bilər
    if (req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'İcazə yoxdur' });
    }

    await Order.findByIdAndDelete(req.params.id); // Sifarişi silir
    res.json({ msg: 'Sifariş silindi' });

  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Sifariş tapılmadı' });
    }
    res.status(500).send('Server xətası');
  }
});

module.exports = router;
