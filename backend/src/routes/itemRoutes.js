const router = require('express').Router();
const controller = require('../controllers/itemController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', controller.list);
router.post('/', controller.create);
router.get('/:id', controller.get);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
