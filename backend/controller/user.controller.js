const User = require("../model/user.model.js");
const bcrypt =  require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {
    register: async (req, res) => {
        try {
        const { username, email, password, confirm_password,role } = req.body;

        if (!username || !email || !password || !confirm_password || !role) {
            return res.status(400).json({
            message: "Please fill in all fields.",
            success: false,
            });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
            message: "User Already exist with this email",
            success: false,
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            username,
            email,
            password: hashedPassword,
            confirm_password: hashedPassword,
            role
        });

        return res.status(200).json({
            message: "Account created successfully.",
            success: true,
        });
        } catch (error) {
        console.log(error);
        }
    },

    login: async (req, res) => {
        try {
            const { email, password  } = req.body;
            if (!email || !password ) {
            return res.status(400).json({
                message: "Something is missing.",
                success: false,
            });
            }
            let user = await User.findOne({ email });
            if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password ",
                success: false,
            });
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            });
            }

            const tokendata = {
            userId: user._id,
            };
            const token = await jwt.sign(tokendata, process.env.SECRET_KEY, {
            expiresIn: "1d",
            });

            user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            };

            return res
            .status(200)
            .cookie("token", token, {
                maxAge: 1 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: "strict",
            })
            .json({
                message: `Welcome back ${user.username}`,
                user,
                success: true,
            });
        } catch (error) {
            console.log(error);
        }
    },

    logout: async (req, res) => {
        try {
            return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully",
            success: true,
            });
        } catch (error) {
            console.log(error);
        }
    },
}



