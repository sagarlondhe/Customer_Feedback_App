const express = require('express');
const router = express.Router();
const feedbackcontroller = require('../controller/feedback.controller');

router.post("/addFeedback", feedbackcontroller.addFeedback);
router.post("/updateFeedback", feedbackcontroller.updateFeedback);
router.post("/deleteFeedback", feedbackcontroller.deleteFeedback);
router.post("/getFeedback", feedbackcontroller.getFeedback);
router.post("/getAllFeedback", feedbackcontroller.getAllFeedback);

module.exports = router;