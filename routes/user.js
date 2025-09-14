const { Router } = require("express");
const { userModel, purchaseModel, courseModel } = require("../db");
const bcryp = require("bcrypt");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const { userMiddleware } = require("../middileware/user");

const userRouter = Router()

userRouter.post("/signup",async (req,res) => {
    const signUpVal = z.object({
        email: z.string().min(3).max(40).email(),
        password: z.string().min(6).max(100),
        firstName: z.string().min(3).max(20),
        lastName: z.string().min(3).max(20)
    });
    const parseresult = signUpVal.safeParse(req.body);

    if(!parseresult.success) {
        res.status(403).json({
            message: "wrong inputs"
        });
        return;
    }

    const { email, password, firstName, lastName } = req.body;

    try {
        const hashpassword = await bcryp.hash(password,5);

        await userModel.create({
            email: email,
            password: hashpassword,
            firstName: firstName,
            lastName: lastName
        });
        res.json({
            message: "Regestered"
        });

    } catch(e) {
        res.status(403).json({
            message: "error while signUp"
        });
    }
});

userRouter.post("/signin",async (req,res) => {
    const signUpVal = z.object({
        email: z.string().min(3).max(40).email(),
        password: z.string().min(6).max(100),
    });
    const parseresult = signUpVal.safeParse(req.body);

    if(!parseresult.success) {
        res.status(403).json({
            message: "wrong inputs"
        });
        return;
    }

    const { email, password } = req.body;

    try {

        const user = await userModel.findOne({
            email:email
        });

        if(user) {
            const matchPassword = await bcryp.compare(password, user.password);
            if(!matchPassword) {
                res.status(403).json({
                    message: "wrong credentials"
                });
                return;
            }

            const token = jwt.sign({
                id: user._id
            },process.env.USER_JWT);

            // TODO: cookie logic

            res.json({
                token: token
            });
        } else {
            res.status(403).json({
                message: "wrong credentials"
            });
        }

    } catch(e) {
        res.status(403).json({
            message: "error while signIn"
        });
    }
});

userRouter.get("/purchases",userMiddleware, async (req,res) => {
    const userId = req.userId;
    
    const purchases = await purchaseModel.find({
        userId
    });
    const courses = await courseModel.find({
        _id: { $in: purchases.map(x => x.courseId)}
    });

    res.json({
        purchases,
        courses
    });

});

module.exports = {
    userRouter: userRouter
}