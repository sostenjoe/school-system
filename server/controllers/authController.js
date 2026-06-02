const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Teacher = require("../models/Teacher");
const { sendPasswordResetEmail } = require("../utils/emailService");

const passwordResetCodes = new Map();

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        await Teacher.create({
            name,
            email,
            password: hashedPassword
        });

        res.json({
            message: "Teacher registered successfully"
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: error.message || "Registration failed" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const teacher = await Teacher.findByEmail(email);

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

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
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const email = req.body.email?.trim();

        if (!email) {
            return res.status(400).json({ message: "Please provide your email." });
        }

        const teacher = await Teacher.findByEmail(email);

        // Always return success message for security (don't reveal if email exists)
        if (!teacher) {
            return res.json({ message: "If that teacher account exists, a reset code has been sent to the email." });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 15 * 60 * 1000;

        await sendPasswordResetEmail(email, code);
        passwordResetCodes.set(email, { code, expiresAt });
        
        res.json({ message: "Reset code sent to your email. Check your inbox." });
    } catch (error) {
        console.error("Password reset error:", error);
        res.status(500).json({ 
            message: "Unable to send reset code email. Please check the email configuration." 
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const email = req.body.email?.trim();
        const { code, password } = req.body;

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

        const hashedPassword = await bcrypt.hash(password, 10);
        await Teacher.updatePasswordByEmail(email, hashedPassword);

        passwordResetCodes.delete(email);
        res.json({ message: "Password reset successful. You can now log in." });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: error.message || "Reset failed" });
    }
};