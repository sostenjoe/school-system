Dev note: user requested checking email configuration correctness.

Current implementation files found:
- server/utils/emailService.js
  - builds transporter using env vars SMTP_SERVICE/SMTP_USER/SMTP_PASS/SMTP_HOST/SMTP_PORT/SMTP_SECURE/SMTP_FROM
  - for Gmail it removes spaces in SMTP_PASS.

To verify correctness we need env values in .env (not provided in repo view). Next step: read .env if exists or inspect SETUP/README instructions for expected env var names.

