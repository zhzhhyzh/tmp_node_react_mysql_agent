const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/items', require('./itemRoutes'));
router.use('/agent', require('./agentRoutes'));

module.exports = router;
