const Feedback = require("../model/feedback.model.js");
const bcrypt =  require("bcryptjs");
const jwt = require("jsonwebtoken");
const user = require("../model/user.model.js");

module.exports = {
    addFeedback: async (req, res) => {
        try {
         const {feedback,username} = req.body;
            if (!feedback || !username) {
            return res.status(400).json({
                message: "Something is missing.",
                success: false,
            });
            }

        const userId = await user.findOne({ username: username }).select("_id");
        if (!userId) {
            return res.status(404).json({
                message: "User not found.",
                success: false,
            });
        }


        const newFeedback = await Feedback.create({
            feedback,
            username,
            userId: userId._id,
        });
        return res.status(200).json({
            message: "Feedback added successfully.",
            success: true,
            data: newFeedback
        });
        } catch (error) {
            return res.status(500).json({
                message: "Internal server error.",
                success: false,
            });
        }
    },
    updateFeedback: async (req, res) => {
        try {
            const { feedbackId } = req.body;
            if (!feedbackId) {
                return res.status(400).json({
                    message: "Feedback ID is required.",
                    success: false,
                });
            }
            const feedback = await Feedback.findById(feedbackId);
            if (!feedback) {
                return res.status(404).json({
                    message: "Feedback not found.",
                    success: false,
                });
            }   

            const updatedFeedback = await Feedback.findByIdAndUpdate(
                feedbackId,
                { feedback: req.body.feedback, username: req.body.username },
                { new: true }
            );
            return res.status(200).json({
                message: "Feedback updated successfully.",
                success: true,
                data: updatedFeedback
            });
        } catch (error) {
            return res.status(500).json({
                message: "Internal server error.",
                success: false,
            });
        }
    },

    deleteFeedback: async (req, res) => {
        try {
            const { feedbackId } = req.body;
            if (!feedbackId) {
                return res.status(400).json({   
                    message: "Feedback ID is required.",
                    success: false,
                });
            }
            const feedback = await Feedback.findById(
                feedbackId
            );
            if (!feedback) {
                return res.status(404).json({
                    message: "Feedback not found.",
                    success: false,
                });
            }
            await Feedback.findByIdAndDelete(feedbackId);
            return res.status(200).json({
                message: "Feedback deleted successfully.",
                success: true,
            });
        }     
        catch (error) {
            return res.status(500).json({
                message: "Internal server error.",
                success: false,
            });
        }

    },
    getFeedback: async (req, res) => {
        try {
            const { feedbackId } = req.body;
            if (!feedbackId) {
                return res.status(400).json({
                    message: "Feedback ID is required.",
                    success: false,
                });
            }
            const feedback = await Feedback
                .findById(feedbackId);
            if (!feedback) {
                return res.status(404).json({
                    message: "Feedback not found.",
                    success: false,
                });
            }
            return res.status(200).json({
                message: "Feedback retrieved successfully.",
                success: true,
                data: feedback
            });
        } catch (error) {
            return res.status(500).json({
                message: "Internal server error.",
                success: false,
            });
        }
    },
    getAllFeedback: async (req, res) => {
        try {
            const feedback = await Feedback.find();
            return res.status(200).json({
                message: "Feedback retrieved successfully.",
                success: true,
                data: feedback
            });
        } catch (error) {
            return res.status(500).json({
                message: "Internal server error.",
                success: false,
            });
        }   
    },

    getFeedbackByUserId: async (req, res) => {
        try {
            const { userId } = req.query;
            if (!userId) {
                return res.status(400).json({
                    message: "User ID is required.",
                    success: false,
                });
            }

            const feedbacks = await Feedback.find({ userId: userId });
            return res.status(200).json({
                message: "Feedback retrieved successfully.",
                success: true,
                data: feedbacks
            });
        }
        catch (error) {
            return res.status(500).json({
                message: "Internal server error.",
                success: false,
            });
        }
    },
}



