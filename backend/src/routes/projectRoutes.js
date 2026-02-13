const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, deleteProject, updateProject } = require('../controllers/projectController');
const { createTask, getTasks } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Project Routes
router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);;

// Task Routes (Nested under projects)
router.route('/:projectId/tasks')
  .post(protect, createTask)
  .get(protect, getTasks);

module.exports = router;