const express = require('express');
const router = express.Router();
const mentions = require('./mentions');
const control = require('./control');
const auth = require('./auth');

router.use('/auth', auth);
router.use('/mentions', mentions);
router.use('/control', control);

module.exports = router;
