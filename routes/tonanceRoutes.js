// routes/tonanceRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controller/taskController');
const userController = require('../controller/userController');
//const leaderboardController = require('../controller/leaderboardController');

// Middleware to check if user is owner (you'll need to implement this)
const isOwner = (req, res, next) => {
  // Implement owner check logic here
};

// Task routes
router.post('/tasks', isOwner, taskController.createTask);
router.get('/tasks', taskController.getTasks);
router.post('/complete-task', taskController.completeTask);

// User routes
//router.post('/register', userController.registerUser);
//router.get('/referrals/:userId', userController.getUserReferrals);

// Leaderboard routes
//router.get('/leaderboard', userController.getLeaderboard);
//router.get('/rank/:username', userController.getUserRank);

module.exports = router;