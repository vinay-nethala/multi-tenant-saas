const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const logAction = require('../utils/auditLogger');

// @desc    Create a task in a project
// @route   POST /api/projects/:projectId/tasks
const createTask = async (req, res) => {
  const { projectId } = req.params;
  const { title, description, priority, assignedTo, dueDate } = req.body;
  const { tenant_id } = req.user;

  try {
    // 1. Verify Project belongs to Tenant
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND tenant_id = $2',
      [projectId, tenant_id]
    );
    
    if (projectCheck.rows.length === 0) {
      return errorResponse(res, 'Project not found', 404);
    }

    // 2. Create Task
    const result = await pool.query(
      `INSERT INTO tasks (project_id, tenant_id, title, description, priority, assigned_to, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [projectId, tenant_id, title, description, priority || 'medium', assignedTo || null, dueDate || null]
    );
    
    await logAction({
        tenantId: tenant_id,
        userId: req.user.id,
        action: 'CREATE_TASK',
        entityType: 'task',
        entityId: result.rows[0].id,
        req
    });
    
    return successResponse(res, 'Task created', result.rows[0], 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Failed to create task');
  }
};

// @desc    Get tasks for a project
// @route   GET /api/projects/:projectId/tasks
const getTasks = async (req, res) => {
  const { projectId } = req.params;
  const { tenant_id } = req.user;

  try {
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND tenant_id = $2',
      [projectId, tenant_id]
    );
    if (projectCheck.rows.length === 0) return errorResponse(res, 'Project not found', 404);

    const result = await pool.query(
      `SELECT t.*, u.full_name as assignee_name 
       FROM tasks t 
       LEFT JOIN users u ON t.assigned_to = u.id 
       WHERE t.project_id = $1 AND t.tenant_id = $2
       ORDER BY t.priority DESC, t.due_date ASC`,
      [projectId, tenant_id]
    );

    return successResponse(res, 'Tasks fetched', { tasks: result.rows });
  } catch (error) {
    return errorResponse(res, 'Failed to fetch tasks');
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { tenant_id } = req.user;

  try {
    const result = await pool.query(
      `UPDATE tasks SET status = $1, updated_at = NOW()
       WHERE id = $2 AND tenant_id = $3
       RETURNING *`,
      [status, id, tenant_id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Task not found', 404);
    }
    
    await logAction({
        tenantId: tenant_id,
        userId: req.user.id,
        action: 'UPDATE_TASK_STATUS',
        entityType: 'task',
        entityId: id,
        req
    });
    
    return successResponse(res, 'Task status updated', result.rows[0]);
  } catch (error) {
    return errorResponse(res, 'Failed to update task');
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  const { id } = req.params;
  const { tenant_id } = req.user;

  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND tenant_id = $2 RETURNING *',
      [id, tenant_id]
    );

    if (result.rowCount === 0) {
      return errorResponse(res, 'Task not found', 404);
    }

    await logAction({
       tenantId: tenant_id,
       userId: req.user.id,
       action: 'DELETE_TASK',
       entityType: 'task',
       entityId: id,
       req
    });

    return successResponse(res, 'Task deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to delete task');
  }
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, assignedTo, dueDate } = req.body;
  const { tenant_id } = req.user;

  try {
    const result = await pool.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           priority = COALESCE($3, priority),
           assigned_to = COALESCE($4, assigned_to),
           due_date = COALESCE($5, due_date),
           updated_at = NOW()
       WHERE id = $6 AND tenant_id = $7
       RETURNING *`,
      [title, description, priority, assignedTo, dueDate, id, tenant_id]
    );

    if (result.rows.length === 0) return errorResponse(res, 'Task not found', 404);

    await logAction({
       tenantId: tenant_id,
       userId: req.user.id,
       action: 'UPDATE_TASK',
       entityType: 'task',
       entityId: id,
       req
    });

    return successResponse(res, 'Task updated', result.rows[0]);
  } catch (error) {
    return errorResponse(res, 'Update failed');
  }
};

module.exports = { 
  createTask, 
  getTasks, 
  updateTaskStatus, 
  deleteTask,
  updateTask
};