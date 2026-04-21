const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },

    // email:{
    //     type:String,
    //     required: true,
    // },

    feedback:{
        type:String,
        required: true,
    },

   is_delete:{
        type: Number,
        default:1,
    },

    is_active:{
        type:Number,
        default:0,
    },

    created_at:{
        type:Date,
        default:Date.now,
    },

    Updated_at:{
        type:Date,
        default:Date.now,
    }
});


const feedback = mongoose.model("feedback", feedbackSchema);

module.exports = feedback;







