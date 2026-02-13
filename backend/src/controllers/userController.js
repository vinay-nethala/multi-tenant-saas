const bcrypt = require('bcrypt');
const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const logAction = require('../utils/auditLogger');

// @desc    Add User to Tenant
// @route   POST /api/tenants/:tenantId/users
exports.addUser = async (req, res) => {
  const { tenantId } = req.params;
  const { email, password, fullName, role } = req.body;
  const currentUser = req.user;

  // Authorization: Only tenant_admin of this tenant can add users
  if (currentUser.role !== 'tenant_admin' || currentUser.tenant_id !== tenantId) {
    return errorResponse(res, 'Not authorized to add users', 403);
  }

  try {
    // 1. Check Plan Limits
    const limitCheck = await pool.query(
      `SELECT t.max_users, count(u.id) as current_count 
       FROM tenants t 
       LEFT JOIN users u ON t.id = u.tenant_id 
       WHERE t.id = $1 
       GROUP BY t.id`,
      [tenantId]
    );
    const { max_users, current_count } = limitCheck.rows[0];
    
    if (parseInt(current_count) >= max_users) {
      return errorResponse(res, 'User limit reached for your plan', 403);
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User
    const result = await pool.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role, created_at`,
      [tenantId, email, hashedPassword, fullName, role || 'user']
    );

    return successResponse(res, 'User added successfully', result.rows[0], 201);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return errorResponse(res, 'Email already exists in this tenant', 409);
    }
    return errorResponse(res, 'Failed to add user');
  }
};

// @desc    List Users of a Tenant
// @route   GET /api/tenants/:tenantId/users
exports.getTenantUsers = async (req, res) => {
  const { tenantId } = req.params;
  const currentUser = req.user;

  if (currentUser.tenant_id !== tenantId && currentUser.role !== 'super_admin') {
    return errorResponse(res, 'Not authorized', 403);
  }

  try {
    const result = await pool.query(
      'SELECT id, email, full_name, role, is_active, created_at FROM users WHERE tenant_id = $1',
      [tenantId]
    );
    return successResponse(res, 'Users fetched', { users: result.rows });
  } catch (error) {
    return errorResponse(res, 'Server Error');
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params; // ID of user to delete
  const { tenant_id, role, id: currentUserId } = req.user;

  try {
    // 1. Authorization Check
    if (role !== 'tenant_admin') {
      return errorResponse(res, 'Only admins can delete users', 403);
    }

    // 2. Prevent Self-Deletion
    if (id === currentUserId) {
      return errorResponse(res, 'You cannot delete yourself', 403);
    }

    // 3. Delete User (Ensure they belong to your tenant)
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 AND tenant_id = $2 RETURNING *',
      [id, tenant_id]
    );

    if (result.rowCount === 0) {
      return errorResponse(res, 'User not found', 404);
    }

    // 4. Audit Log
    await logAction({
       tenantId: tenant_id,
       userId: currentUserId,
       action: 'DELETE_USER',
       entityType: 'user',
       entityId: id,
       req
    });

    return successResponse(res, 'User deleted successfully');
  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Failed to delete user');
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { fullName, role, isActive } = req.body;
  const { tenant_id, role: currentUserRole, id: currentUserId } = req.user;

  try {
    // Only admin or self can update
    if (currentUserRole !== 'tenant_admin' && currentUserId !== id) {
        return errorResponse(res, 'Not authorized', 403);
    }

    const result = await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name), 
           role = COALESCE($2, role), 
           is_active = COALESCE($3, is_active),
           updated_at = NOW()
       WHERE id = $4 AND tenant_id = $5
       RETURNING id, full_name, email, role`,
      [fullName, role, isActive, id, tenant_id]
    );

    if (result.rows.length === 0) return errorResponse(res, 'User not found', 404);

    await logAction({
       tenantId: tenant_id,
       userId: currentUserId,
       action: 'UPDATE_USER',
       entityType: 'user',
       entityId: id,
       req
    });

    return successResponse(res, 'User updated', result.rows[0]);
  } catch (error) {
    return errorResponse(res, 'Update failed');
  }
};