const router = require('express').Router();
const controller = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Demo-only listing. In real apps guard with role=admin.
router.get('/', controller.listUsers);

module.exports = router;
