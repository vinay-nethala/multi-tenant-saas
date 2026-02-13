const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

// @desc    Get Tenant Details
// @route   GET /api/tenants/:id
exports.getTenant = async (req, res) => {
  const { id } = req.params;
  const { tenant_id, role } = req.user;

  // Authorization: Must be super_admin OR belong to the tenant
  if (role !== 'super_admin' && tenant_id !== id) {
    return errorResponse(res, 'Not authorized to view this tenant', 403);
  }

  try {
    const result = await pool.query('SELECT * FROM tenants WHERE id = $1', [id]);
    if (result.rows.length === 0) return errorResponse(res, 'Tenant not found', 404);
    
    // Get stats
    const statsQuery = `
      SELECT 
        (SELECT count(*) FROM users WHERE tenant_id = $1) as total_users,
        (SELECT count(*) FROM projects WHERE tenant_id = $1) as total_projects
    `;
    const stats = await pool.query(statsQuery, [id]);

    return successResponse(res, 'Tenant details', {
      ...result.rows[0],
      stats: stats.rows[0]
    });
  } catch (error) {
    return errorResponse(res, 'Server Error');
  }
};

// @desc    List All Tenants (Super Admin Only)
// @route   GET /api/tenants
exports.getAllTenants = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tenants ORDER BY created_at DESC');
    return successResponse(res, 'All tenants', { tenants: result.rows });
  } catch (error) {
    return errorResponse(res, 'Server Error');
  }
};

exports.updateTenant = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body; // Tenant admins can only update name
  const { tenant_id, role } = req.user;

  if (role !== 'super_admin' && tenant_id !== id) {
    return errorResponse(res, 'Not authorized', 403);
  }

  try {
    const result = await pool.query(
      'UPDATE tenants SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [name, id]
    );
    return successResponse(res, 'Tenant updated', result.rows[0]);
  } catch (error) {
    return errorResponse(res, 'Update failed');
  }
};