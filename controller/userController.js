// controllers/userController.js
const User = require('../models/User');
const crypto = require('crypto');

exports.registerUser = async (req, res) => {
  try {
    const { telegramUserId, username, referralCode } = req.body;
    let referredBy;
    if (referralCode) {
      referredBy = await User.findOne({ referralCode });
      if (!referredBy) {
        return res.status(400).json({ message: 'Invalid referral code' });
      }
    }
    const newReferralCode = crypto.randomBytes(6).toString('hex');
    const user = new User({ 
      telegramUserId, 
      username, 
      referralCode: newReferralCode,
      referredBy: referredBy ? referredBy._id : null
    });
    await user.save();

    if (referredBy) {
      referredBy.referrals.push(user._id);
      await referredBy.save();
      // Add referral points logic here
    }

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUserReferrals = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('referrals', 'username');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.referrals);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// controllers/leaderboardController.js
const Leaderboard = require('../models/Leaderboard');

exports.getLeaderboard = async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) {
      query.role = role;
    }
    const leaderboard = await Leaderboard.find(query)
      .sort({ score: -1 })
      .limit(10)
      .populate('userId', 'username role');
    res.json(leaderboard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.claimHourlyPoints = async (req, res) => {
  try {
    const { telegramUserId } = req.body;
    const user = await User.findOne({ telegramUserId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.canClaim()) {
      const minutesToNextClaim = 60 - ((Date.now() - user.lastClaimTime) / (1000 * 60));
      return res.status(400).json({ 
        message: 'You can\'t claim yet', 
        minutesToNextClaim: Math.ceil(minutesToNextClaim)
      });
    }

    const claimedAmount = user.claim();
    await user.save();

    res.json({
      message: 'Points claimed successfully',
      claimedAmount,
      newBalance: user.balance,
      claimStreak: user.claimStreak
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
