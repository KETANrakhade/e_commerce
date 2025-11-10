// Services Index - Export all services for easy importing

const userService = require('./userService');
const productService = require('./productService');
const orderService = require('./orderService');
const adminService = require('./adminService');
const emailService = require('./emailService');
const paymentService = require('./paymentService');
const categoryService = require('./categoryService');
const subcategoryService = require('./subcategoryService');
const brandService = require('./brandService');

module.exports = {
  userService,
  productService,
  orderService,
  adminService,
  emailService,
  paymentService,
  categoryService,
  subcategoryService,
  brandService
};

// Usage example:
// const { userService, productService } = require('../services');
// or
// const services = require('../services');
// services.userService.createUser(userData);