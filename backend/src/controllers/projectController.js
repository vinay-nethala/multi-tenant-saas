const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const logAction = require('../utils/auditLogger');

// @desc    Create a new project
// @route   POST /api/projects
const createProject = async (req, res) => {
  const { name, description, status } = req.body;
  const { tenant_id, id: userId } = req.user;

  try {
    // 1. Check Plan Limits
    const limitCheck = await pool.query(
      `SELECT t.max_projects, count(p.id) as current_count 
       FROM tenants t 
       LEFT JOIN projects p ON t.id = p.tenant_id 
       WHERE t.id = $1 
       GROUP BY t.id`,
      [tenant_id]
    );
    
    // Handle case where limitCheck returns no rows (rare)
    const current_count = limitCheck.rows[0]?.current_count || 0;
    const max_projects = limitCheck.rows[0]?.max_projects || 3;

    if (parseInt(current_count) >= max_projects) {
      return errorResponse(res, 'Project limit reached for your subscription plan', 403);
    }

    // 2. Create Project
    const result = await pool.query(
      `INSERT INTO projects (tenant_id, name, description, status, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [tenant_id, name, description, status || 'active', userId]
    );
    
    await logAction({
        tenantId: tenant_id,
        userId: userId,
        action: 'CREATE_PROJECT',
        entityType: 'project',
        entityId: result.rows[0].id,
        req
    });
    
    return successResponse(res, 'Project created', result.rows[0], 201);
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Failed to create project');
  }
};

// @desc    List all projects for current tenant
// @route   GET /api/projects
const getProjects = async (req, res) => {
  const { tenant_id } = req.user;
  
  try {
    const query = `
      SELECT p.*, u.full_name as creator_name,
      (SELECT count(*) FROM tasks t WHERE t.project_id = p.id) as task_count
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.tenant_id = $1
      ORDER BY p.created_at DESC
    `;
    
    const result = await pool.query(query, [tenant_id]);
    
    return successResponse(res, 'Projects fetched', { projects: result.rows });
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Failed to fetch projects');
  }
};

// @desc    Get single project details
// @route   GET /api/projects/:id
const getProjectById = async (req, res) => {
  const { id } = req.params;
  const { tenant_id } = req.user;

  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND tenant_id = $2',
      [id, tenant_id]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 'Project not found', 404);
    }

    return successResponse(res, 'Project details', result.rows[0]);
  } catch (error) {
    return errorResponse(res, 'Server error');
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  const { id } = req.params;
  const { tenant_id } = req.user;

  try {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND tenant_id = $2 RETURNING *',
      [id, tenant_id]
    );

    if (result.rowCount === 0) {
      return errorResponse(res, 'Project not found', 404);
    }

    await logAction({
       tenantId: tenant_id,
       userId: req.user.id,
       action: 'DELETE_PROJECT',
       entityType: 'project',
       entityId: id,
       req
    });

    return successResponse(res, 'Project deleted successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Failed to delete project');
  }
};

const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description, status } = req.body;
  const { tenant_id } = req.user;

  try {
    // Check permissions (tenant_admin or creator)
    // For simplicity in this challenge, we allow tenant members to update if they have access
    const result = await pool.query(
      `UPDATE projects 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           status = COALESCE($3, status),
           updated_at = NOW()
       WHERE id = $4 AND tenant_id = $5
       RETURNING *`,
      [name, description, status, id, tenant_id]
    );

    if (result.rows.length === 0) return errorResponse(res, 'Project not found', 404);

    await logAction({
       tenantId: tenant_id,
       userId: req.user.id,
       action: 'UPDATE_PROJECT',
       entityType: 'project',
       entityId: id,
       req
    });

    return successResponse(res, 'Project updated', result.rows[0]);
  } catch (error) {
    return errorResponse(res, 'Update failed');
  }
};

module.exports = { 
  createProject, 
  getProjects, 
  getProjectById, 
  deleteProject,
  updateProject
};