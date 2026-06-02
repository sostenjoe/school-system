const nodemailer = require("nodemailer");

function getEmailConfig() {
    const service = process.env.SMTP_SERVICE || "gmail";
    const user = process.env.SMTP_USER || "";
    let rawPass = process.env.SMTP_PASS || "";
    
    // Remove surrounding quotes from password if present
    rawPass = rawPass.replace(/^["']|["']$/g, '').trim();
    
    // For Gmail, remove spaces from the password (app passwords are often written with spaces)
    const pass = service.toLowerCase() === "gmail" ? rawPass.replace(/\s+/g, "") : rawPass;

    return {
        service,
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user,
            pass
        },
        from: process.env.SMTP_FROM || user
    };
}

function hasEmailConfig() {
    const config = getEmailConfig();

    return Boolean(
        config.user &&
        config.pass &&
        !config.user.includes("your-") &&
        !config.pass.includes("your-")
    );
}

function createTransporter() {
    const config = getEmailConfig();

    if (config.service) {
        return nodemailer.createTransport({
            service: config.service,
            auth: {
                user: config.user,
                pass: config.pass
            }
        });
    }

    return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: config.user,
            pass: config.pass
        }
    });
}

async function sendPasswordResetEmail(email, code) {
    if (!hasEmailConfig()) {
        throw new Error("Email is not configured.");
    }

    const config = getEmailConfig();
    const transporter = createTransporter();

    await transporter.sendMail({
        from: config.from,
        to: email,
        subject: "Teacher Portal Password Reset Code",
        text: `Your password reset code is ${code}. It expires in 15 minutes.`,
        html: `
            <p>Your password reset code is <strong>${code}</strong>.</p>
            <p>This code expires in 15 minutes.</p>
            <p>If you did not request this reset, you can ignore this email.</p>
        `
    });
}

module.exports = {
    hasEmailConfig,
    sendPasswordResetEmail
};
