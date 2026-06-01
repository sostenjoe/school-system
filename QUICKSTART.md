# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install & Run
```bash
npm install
npm start
```

### 2. Access the Application
Open browser and go to: `http://localhost:5000`

### 3. Default Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin`

⚠️ Change this immediately in Settings!

**Teacher Account:**
- Create a new account using the "Register" tab

### 4. Configure Email (Optional)
Edit `.env` file for password recovery email:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 📊 Admin Features

### Login
1. Click "Admin Access" tab
2. Enter admin/admin
3. Click "Admin Login"

### Dashboard
- View total students, teachers, subjects
- See subject performance charts
- View class performance trends
- Check underperforming students
- Monitor teacher performance

### Settings
1. Click "Settings" button
2. Change username and/or password
3. Click "Save Changes"

---

## 👨‍🏫 Teacher Features

### Register Account
1. Click "Teacher Access" tab
2. Click "Register" button
3. Fill in Name, Email, Password
4. Click "Create Account"

### Register Students
1. Click "Register Student" button
2. Enter student name and class
3. Click "Register Student"
4. Student appears in your student list

### Submit Results
1. Select student class from dropdown
2. Select subject from dropdown
3. Click "Load Students"
4. Enter marks for each student
5. Click "Save All Results"

### Forgot Password
1. Click "Forgot Password" tab
2. Enter email address
3. Check email for reset code
4. Use code to reset password

---

## 🗄️ Database

Database file: `school_system.db` (auto-created)

Reset database:
```bash
# Delete the database file
rm school_system.db

# Restart the server
npm start
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `.env` | Configuration (SMTP, JWT, Port) |
| `server/app.js` | Express app setup |
| `client/css/js/pages/login.html` | Login page |
| `client/css/js/pages/admin-dashboard.html` | Admin dashboard |
| `FEATURES.md` | Detailed feature documentation |
| `SETUP.md` | Installation & setup guide |

---

## 🔍 Common Tasks

### Add a Subject
```bash
curl -X POST http://localhost:5000/api/subjects \
  -H "Content-Type: application/json" \
  -d '{"subject_name": "Mathematics"}'
```

### Create Admin Account (SQL)
Already created automatically in the database.

### View Admin Password Reset
Admin settings page: Click Settings button on admin dashboard.

### Logout
Click "Logout" button (available on all protected pages)

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 in use | Change PORT in .env |
| Email not sending | Check SMTP config in .env |
| Database errors | Delete school_system.db and restart |
| Login fails | Clear browser cache and try again |
| Charts not showing | Ensure data exists (subjects, results) |

---

## 📚 File Locations

**Frontend:**
```
client/css/js/pages/
  - login.html
  - admin-dashboard.html
  - admin-settings.html
  - teacher-portal.html
  - student-register.html
```

**Backend:**
```
server/
  - controllers/ (admin, auth, analytics, etc.)
  - models/ (Admin, Teacher, Student, etc.)
  - routes/ (admin, auth, analytics, etc.)
  - middleware/ (auth, admin)
  - config/db.js
```

---

## 🎯 Next Steps

1. ✅ Start the application
2. ✅ Login as admin with default credentials
3. ✅ Change admin password
4. ✅ Create a teacher account
5. ✅ Register some students
6. ✅ Add results
7. ✅ View analytics in admin dashboard

---

## 📞 Support

For detailed information, see:
- `FEATURES.md` - Complete feature documentation
- `SETUP.md` - Installation & setup details
- API responses are in JSON format

Check browser console (F12) for detailed error messages.
