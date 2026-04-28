const router = require('express').Router();
const controller = require('../controllers/agentController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/chat', controller.chat);

module.exports = router;
