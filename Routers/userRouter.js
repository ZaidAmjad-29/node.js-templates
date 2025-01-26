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
const userController = require('./../controllers/userController');

const router = express.Router();
router.post('/signup', signUp);
router.post('/signin', login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.route('/').get(getAllUsers).post(newUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
