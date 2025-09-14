const { Router } = require("express");
const { adminModel } = require("../db");
const bcryp = require("bcrypt");
const { z } = require("zod");
const jwt = require("jsonwebtoken");

const adminRouter = Router();

adminRouter.post("/signup",async (req,res) => {
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

        await adminModel.create({
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

adminRouter.post("/signin",async (req,res) => {
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

        const admin = await adminModel.findOne({
            email:email
        });

        if(admin) {
            const matchPassword = await bcryp.compare(password, admin.password);
            if(!matchPassword) {
                res.status(403).json({
                    message: "wrong credentials"
                });
                return;
            }

            const token = jwt.sign({
                id: admin._id
            },process.env.ADMIN_JWT);

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

adminRouter.post("/course", (req,res) => {
    res.json({
        message: "signin endpoint"
    });
});

adminRouter.put("/course", (req,res) => {
    res.json({
        message: "signin endpoint"
    });
});

adminRouter.get("/course/bulk", (req,res) => {
    res.json({
        message: "signin endpoint"
    });
});

module.exports = {
    adminRouter: adminRouter
}

