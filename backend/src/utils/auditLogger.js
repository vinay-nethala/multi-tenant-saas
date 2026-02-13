const { pool } = require('../config/db');

/**
 * Logs an action to the audit_logs table
 * @param {Object} params - { tenantId, userId, action, entityType, entityId, ipAddress }
 */
const logAction = async ({ tenantId, userId, action, entityType, entityId, req }) => {
  try {
    // specific IP extraction logic if behind proxy, otherwise remoteAddress
    const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || null;

    await pool.query(
      `INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [tenantId, userId, action, entityType, entityId, ipAddress]
    );
    console.log(`[AUDIT] ${action} on ${entityType} ${entityId}`);
  } catch (error) {
    // We don't want to crash the request if logging fails, just error to console
    console.error('Audit Logging Failed:', error);
  }
};

module.exports = logAction;