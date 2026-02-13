const express = require('express');
const router = express.Router();
const { getTenant, getAllTenants, updateTenant } = require('../controllers/tenantController');
const { addUser, getTenantUsers } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Super Admin List
router.get('/', protect, authorize('super_admin'), getAllTenants);

// Tenant Details
router.get('/:id', protect, getTenant);
router.put('/:id', protect, updateTenant);

// User Management Routes (Nested here because they relate to a specific tenant)
router.post('/:tenantId/users', protect, addUser);
router.get('/:tenantId/users', protect, getTenantUsers);

module.exports = router;