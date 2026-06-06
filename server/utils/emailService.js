const nodemailer = require("nodemailer");

// Helpful for debugging: print which SMTP env vars are missing.
// Kept lightweight so it won't spam normal operation unless SMTP is not configured.
if (process.env.SMTP_SERVICE || process.env.SMTP_USER || process.env.SMTP_PASS || process.env.SMTP_FROM) {
    // Only normalize if user actually configured something
    if (process.env.SMTP_USER) process.env.SMTP_USER = String(process.env.SMTP_USER).replace(/^['"]|['"]$/g, '').trim();
    if (process.env.SMTP_PASS) process.env.SMTP_PASS = String(process.env.SMTP_PASS).replace(/^['"]|['"]$/g, '').trim();
    if (process.env.SMTP_FROM) process.env.SMTP_FROM = String(process.env.SMTP_FROM).replace(/^['"]|['"]$/g, '').trim();
}

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

    // Allow common "placeholder" values to fail fast.
    const userOk = Boolean(config.user) && !String(config.user).toLowerCase().includes("your-");
    const passOk = Boolean(config.pass) && !String(config.pass).toLowerCase().includes("your-");

    return userOk && passOk;
}

function createTransporter() {
    const config = getEmailConfig();

    // Nodemailer: secure=true for implicit TLS (usually port 465). For STARTTLS (e.g. 587) keep secure=false.
    const explicitSecure = process.env.SMTP_SECURE === "true";
    const inferredSecure = Number(config.port) === 465;
    const secure = typeof explicitSecure === "boolean" ? explicitSecure : inferredSecure;

    // For service-based configs (like gmail), nodemailer typically uses STARTTLS on 587.
    if (config.service) {
        return nodemailer.createTransport({
            service: config.service,
            auth: {
                user: config.user,
                pass: config.pass
            },
            secure
        });
    }

    return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure,
        auth: {
            user: config.user,
            pass: config.pass
        }
    });
}


async function sendPasswordResetEmail(email, code) {
    if (!hasEmailConfig()) {
        throw new Error("Email is not configured. Check SMTP_USER/SMTP_PASS/SMTP_FROM in your .env");
    }

    // Ensure env vars are trimmed even if user put quotes in .env
    if (process.env.SMTP_USER) process.env.SMTP_USER = String(process.env.SMTP_USER).replace(/^['"]|['"]$/g, '').trim();
    if (process.env.SMTP_PASS) process.env.SMTP_PASS = String(process.env.SMTP_PASS).replace(/^['"]|['"]$/g, '').trim();
    if (process.env.SMTP_FROM) process.env.SMTP_FROM = String(process.env.SMTP_FROM).replace(/^['"]|['"]$/g, '').trim();

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
