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

// router.param('id', checkID);

router.route('/top-5-cheap').get(cheapTours, getAllTours);
// router.route('/monthly-plan').get(getMonthlyPlan);
router.route('/tour-stats').get(getTourStat);
router.route('/:id').get(getTour).delete(deleteTour).patch(updateTour);
router.route('/').get(getAllTours).post(createTour);

module.exports = router;
