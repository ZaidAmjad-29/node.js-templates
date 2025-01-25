const express = require('express');
const router = express.Router();

const {
  getAllTours,
  getTour,
  deleteTour,
  createTour,
  updateTour,
  cheapTours,
  getTourStat,
  // getMonthlyPlan,
} = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

router.route('/top-5-cheap').get(cheapTours, getAllTours);
// router.route('/monthly-plan').get(getMonthlyPlan);
router.route('/tour-stats').get(getTourStat);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(authController.protect, authController.restricTo('admin', 'lead-guide'), deleteTour);
router.route('/').get(authController.protect, getAllTours).post(createTour);

module.exports = router;
