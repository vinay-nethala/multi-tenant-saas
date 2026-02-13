const express = require('express');
const router = express.Router();
const { updateTaskStatus, deleteTask, updateTask } = require('../controllers/taskController'); // Import deleteTask
const { protect } = require('../middleware/authMiddleware');

router.patch('/:id/status', protect, updateTaskStatus);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);

module.exports = router;