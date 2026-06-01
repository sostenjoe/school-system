const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

exports.loginAdmin = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    Admin.findByUsername(username, async (err, admin) => {
        if (err) {
            console.error("Admin login query error:", err);
            return res.status(500).json({ message: "Server error during login." });
        }

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        try {
            const isMatch = await bcrypt.compare(password, admin.password);

            if (!isMatch) {
                return res.status(401).json({ message: "Wrong password" });
            }

            const token = jwt.sign(
                { id: admin.id, username: admin.username, role: "admin" },
                process.env.JWT_SECRET || "secretkey",
                { expiresIn: "1d" }
            );

            res.json({ message: "Login successful", token });
        } catch (compareError) {
            console.error("Admin login compare error:", compareError);
            res.status(500).json({ message: "Server error during login." });
        }
    });
};

exports.updateCredentials = (req, res) => {
    const { newUsername, oldPassword, newPassword } = req.body;
    const adminId = req.admin?.id;

    if (!adminId) {
        return res.status(401).json({ message: "Unauthorized access." });
    }

    if (!oldPassword || (!newUsername && !newPassword)) {
        return res.status(400).json({ message: "Old password and at least one new credential required." });
    }

    Admin.findById(adminId, async (err, admin) => {
        if (err) {
            return res.status(500).json({ message: "Server error." });
        }

        if (!admin) {
            return res.status(404).json({ message: "Admin not found." });
        }

        try {
            const isMatch = await bcrypt.compare(oldPassword, admin.password);

            if (!isMatch) {
                return res.status(401).json({ message: "Current password is incorrect." });
            }

            let newHashedPassword = admin.password;
            if (newPassword) {
                newHashedPassword = await bcrypt.hash(newPassword, 10);
            }

            const finalUsername = newUsername || admin.username;

            Admin.updateCredentials(adminId, finalUsername, newHashedPassword, (err) => {
                if (err) {
                    return res.status(500).json({ message: "Failed to update credentials." });
                }

                res.json({ message: "Credentials updated successfully" });
            });
        } catch (error) {
            console.error("Credentials update error:", error);
            res.status(500).json({ message: "Server error." });
        }
    });
};

exports.getAdminProfile = (req, res) => {
    const adminId = req.admin?.id;

    if (!adminId) {
        return res.status(401).json({ message: "Unauthorized access." });
    }

    Admin.findById(adminId, (err, admin) => {
        if (err) {
            return res.status(500).json({ message: "Server error." });
        }

        if (!admin) {
            return res.status(404).json({ message: "Admin not found." });
        }

        res.json({ id: admin.id, username: admin.username });
    });
};
