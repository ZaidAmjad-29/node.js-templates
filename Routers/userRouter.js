const express = require('express');
const route = require('./tourRouter');
const { signUp, login } = require('../controllers/authController');
const {
  getAllUsers,
  newUser,
  getUser,
  updateUser,
  deleteUser,
} = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.post('/signup', signUp);
router.post('/signin', login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.route('/').get(getAllUsers).post(newUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
