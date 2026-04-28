const router = require('express').Router();
const controller = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/me', authMiddleware, controller.me);

module.exports = router;
