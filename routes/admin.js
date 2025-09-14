const { Router } = require("express");
const { adminModel, courseModel } = require("../db");
const bcryp = require("bcrypt");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const { adminMiddleware } = require("../middileware/admin");

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

adminRouter.post("/course",adminMiddleware,async (req,res) => {
    const adminId = req.userId;

    const { title, description, price, imageUrl}  = req.body;

    try {
        const course = await courseModel.create({
            title,
            description,
            price,
            imageUrl,
            creatorId: adminId
        });
        
        res.json({
            message: "Course created",
            courseId: course._id
        });

    } catch(e) {
        res.status(403).json({
            message: "Error while Course created",
        });
    }
    
});

adminRouter.put("/course",adminMiddleware, async (req,res) => {
    const adminId = req.userId;
    const { title, description, price, imageUrl, courseId}  = req.body;

    try {
        const course = await courseModel.updateOne({
            _id: courseId,
            creatorId: adminId
        },{
            title,
            description,
            price,
            imageUrl
        });
        
        res.json({
            message: "Course Updated",
            courseId: course._id
        });

    } catch(e) {
        res.status(403).json({
            message: "Error while Course created",
        });
    }
});

adminRouter.get("/course/bulk", adminMiddleware, async (req,res) => {
    const adminId = req.userId;

    const courses = await courseModel.find({
        creatorId: adminId
    });

    res.json({
        message: "courses are",
        courses
    });
});

module.exports = {
    adminRouter: adminRouter
}

