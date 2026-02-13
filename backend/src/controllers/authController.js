const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

// Generate JWT Token
const generateToken = (userId, tenantId, role) => {
  return jwt.sign({ userId, tenantId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc    Register a new Tenant and Admin User
// @route   POST /api/auth/register-tenant
// @access  Public
exports.registerTenant = async (req, res) => {
  const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN'); // Start Transaction

    // 1. Check if subdomain exists
    const domainCheck = await client.query('SELECT id FROM tenants WHERE subdomain = $1', [subdomain]);
    if (domainCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return errorResponse(res, 'Subdomain already exists', 409);
    }

    // 2. Create Tenant
    const tenantResult = await client.query(
      `INSERT INTO tenants (name, subdomain, status, subscription_plan) 
       VALUES ($1, $2, 'active', 'free') RETURNING id`,
      [tenantName, subdomain]
    );
    const tenantId = tenantResult.rows[0].id;

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // 4. Create Admin User
    const userResult = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role) 
       VALUES ($1, $2, $3, $4, 'tenant_admin') RETURNING id, email, full_name, role`,
      [tenantId, adminEmail, hashedPassword, adminFullName]
    );
    const user = userResult.rows[0];

    await client.query('COMMIT'); // Commit Transaction

    return successResponse(res, 'Tenant registered successfully', {
      tenantId,
      subdomain,
      adminUser: user
    }, 201);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    return errorResponse(res, 'Registration failed', 500);
  } finally {
    client.release();
  }
};

// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password, tenantSubdomain } = req.body;

  try {
    // 1. Find Tenant (if subdomain provided)
    // Note: Super Admins might not provide subdomain, but requirements imply context usually needed.
    // For this challenge, we assume tenant context is needed for normal users.
    
    let userQuery = `
      SELECT u.*, t.subdomain 
      FROM users u 
      LEFT JOIN tenants t ON u.tenant_id = t.id 
      WHERE u.email = $1
    `;
    
    // If specific subdomain is requested, filter by it (unless super_admin)
    const result = await pool.query(userQuery, [email]);
    
    if (result.rows.length === 0) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const user = result.rows[0];

    // 2. Verify Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // 3. Check Tenant Context (prevent accessing wrong tenant if user exists in multiple)
    if (user.role !== 'super_admin' && tenantSubdomain && user.subdomain !== tenantSubdomain) {
       return errorResponse(res, 'User does not belong to this tenant', 401);
    }

    // 4. Generate Token
    const token = generateToken(user.id, user.tenant_id, user.role);

    return successResponse(res, 'Login successful', {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        tenantId: user.tenant_id
      },
      token,
      expiresIn: 86400 // 24 hours in seconds
    });

  } catch (error) {
    console.error(error);
    return errorResponse(res, 'Login failed', 500);
  }
};

// @desc    Get Current User
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = req.user; // Set by middleware
    
    // Get Tenant details if not super admin
    let tenant = null;
    if (user.tenant_id) {
      const tenantResult = await pool.query('SELECT * FROM tenants WHERE id = $1', [user.tenant_id]);
      tenant = tenantResult.rows[0];
    }

    return successResponse(res, 'User details fetched', {
      ...user,
      tenant
    });
  } catch (error) {
    return errorResponse(res, 'Server Error', 500);
  }
};

exports.logout = async (req, res) => {
  // Since we use stateless JWT, we just send success.
  // The client is responsible for deleting the token.
  const { tenant_id, id } = req.user;

  return successResponse(res, 'Logged out successfully');
};