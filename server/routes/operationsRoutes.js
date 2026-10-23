const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  checkIn, checkOut, getArrivals, getDepartures, getTasks, createTask, updateTask,
} = require('../controllers/operationsController');

// All operations routes require staff or admin
router.use(authenticate, authorize('staff', 'admin'));

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/arrivals', getArrivals);
router.get('/departures', getDepartures);

// Service tasks
router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.patch('/tasks/:taskId', updateTask);

module.exports = router;
