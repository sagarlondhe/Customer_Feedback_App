const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },

    email:{
        type:String,
        required: true,
    },

    password:{
        type: String,
        required: true,
    },

    confirm_password:{
        type:String,
        required: true,
    },
    role:{
        type:String,
        required:true,
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

const user = mongoose.model("Users", userSchema);

module.exports = user;







