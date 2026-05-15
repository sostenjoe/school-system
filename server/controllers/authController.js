const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const Teacher = require("../models/Teacher");

const passwordResetCodes = new Map();

const smtpTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.example.com",
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER || "your-smtp-user",
        pass: process.env.SMTP_PASS || "your-smtp-pass"
    }
});

async function sendResetEmail(email, code) {
    const mailOptions = {
        from: process.env.SMTP_FROM || "no-reply@school-system.com",
        to: email,
        subject: "Teacher Portal Password Reset Code",
        text: `Your password reset code is: ${code}. It expires in 15 minutes.`,
        html: `<p>Your password reset code is: <strong>${code}</strong>.</p><p>The code expires in 15 minutes.</p>`
    };

    await smtpTransport.sendMail(mailOptions);
}


exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        Teacher.create(
            {
                name,
                email,
                password: hashedPassword
            },
            (err) => {
                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    message: "Teacher registered successfully"
                });
            }
        );
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    Teacher.findByEmail(email, async (err, teacher) => {
        if (err) {
            console.error("Login query error:", err);
            return res.status(500).json({ message: "Server error during login." });
        }

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        try {
            const isMatch = await bcrypt.compare(password, teacher.password);

            if (!isMatch) {
                return res.status(401).json({ message: "Wrong password" });
            }

            const token = jwt.sign(
                { id: teacher.id },
                process.env.JWT_SECRET || "secretkey",
                { expiresIn: "1d" }
            );

            res.json({ message: "Login successful", token });
        } catch (compareError) {
            console.error("Login compare error:", compareError);
            res.status(500).json({ message: "Server error during login." });
        }
    });
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Please provide your email." });
    }

    Teacher.findByEmail(email, async (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        if (!result || result.length === 0) {
            return res.status(404).json({ message: "Teacher not found." });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 15 * 60 * 1000;

        passwordResetCodes.set(email, { code, expiresAt });

        try {
            await sendResetEmail(email, code);
            res.json({ message: "Reset code sent to your email. Check your inbox." });
        } catch (emailError) {
            console.error("SMTP error:", emailError);
            res.status(500).json({ message: "Unable to send reset code email. Please try again later." });
        }
    });
};

exports.resetPassword = async (req, res) => {
    const { email, code, password } = req.body;

    if (!email || !code || !password) {
        return res.status(400).json({ message: "Email, code and new password are required." });
    }

    const savedCode = passwordResetCodes.get(email);

    if (!savedCode) {
        return res.status(400).json({ message: "No reset request found for this email." });
    }

    if (Date.now() > savedCode.expiresAt) {
        passwordResetCodes.delete(email);
        return res.status(400).json({ message: "Reset code has expired. Please request a new one." });
    }

    if (savedCode.code !== code) {
        return res.status(400).json({ message: "Invalid reset code." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        Teacher.updatePasswordByEmail(email, hashedPassword, (err) => {
            if (err) {
                return res.status(500).json(err);
            }

            passwordResetCodes.delete(email);
            res.json({ message: "Password reset successful. You can now log in." });
        });
    } catch (error) {
        res.status(500).json(error);
    }
};