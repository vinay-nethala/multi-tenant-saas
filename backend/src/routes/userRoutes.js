const express = require('express');
const router = express.Router();
const { deleteUser, updateUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.delete('/:id', protect, deleteUser);
router.put('/:id', protect, updateUser);

module.exports = router;