# Installation & Setup Guide

## Prerequisites
- Node.js (v12 or higher)
- npm (Node Package Manager)
- Git (optional, for version control)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

This will install all required packages:
- express: Web server framework
- cors: Cross-Origin Resource Sharing
- bcryptjs: Password hashing
- jsonwebtoken: JWT token generation
- sqlite3: Database
- nodemailer: Email sending
- dotenv: Environment variable management

### 2. Configure Environment Variables
Edit or create the `.env` file in the project root:

```bash
# Copy the template if not exists
cp .env.example .env
```

Then update the `.env` file with your settings:
```env
JWT_SECRET=your-secret-key-here-change-in-production

# Email Configuration (for password recovery)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM=noreply@school-system.com
```

### 3. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start at `http://localhost:5000`

## First-Time Setup

### 1. Access the Application
Open your browser and navigate to:
```
http://localhost:5000
```

You'll be redirected to the login page.

### 2. Admin Login
- Click on "Admin Access" tab
- Username: `admin`
- Password: `admin`

⚠️ **Important**: Change the default admin password immediately:
1. Click "Settings" button
2. Enter current password: `admin`
3. Enter new password
4. Save changes

### 3. Create Teacher Account
- Click on "Teacher Access" tab
- Click "Register"
- Fill in Name, Email, and Password
- Click "Create Account"
- Login with your teacher credentials

### 4. Add Subjects (Optional)
Subjects need to be added to the database before teachers can use them.

You can add subjects via API or database directly. Here's a sample cURL command:
```bash
curl -X POST http://localhost:5000/api/subjects \
  -H "Content-Type: application/json" \
  -d '{"subject_name": "Mathematics"}'
```

Or add them directly to SQLite database using an SQLite client.

### 5. Register Students
- Login as a teacher
- Click "Register Student" button
- Fill in student details (Name, Class)
- Click "Register Student"

### 6. Submit Results
- Select Class and Subject
- Click "Load Students"
- Enter marks for each student
- Click "Save All Results"

### 7. View Admin Analytics
- Login as admin
- Access the dashboard
- View charts and performance metrics

## Database

### Database File
The SQLite database is created automatically at:
```
school_system.db
```

Located in the project root directory.

### Database Schema
The following tables are created automatically:
- `admins`: Admin credentials
- `teachers`: Teacher information
- `students`: Student information
- `subjects`: Subject list
- `results`: Result entries
- `teacher_subjects`: Teacher-subject assignments

## API Endpoints

### Authentication
```
POST   /api/auth/register              # Teacher registration
POST   /api/auth/login                 # Teacher login
POST   /api/auth/forgot-password       # Request password reset code
POST   /api/auth/reset-password        # Reset password with code
POST   /api/admin/login                # Admin login
```

### Teacher Routes (Auth Required)
```
GET    /api/teachers/me                # Get logged-in teacher profile
GET    /api/teachers/subjects          # Get teacher's subjects
PUT    /api/teachers/subject           # Assign subject to teacher
```

### Student Routes
```
POST   /api/students                   # Add student (admin)
GET    /api/students                   # Get all students
POST   /api/students/register          # Teacher registers student (Auth Required)
GET    /api/students/by-teacher        # Get students by teacher (Auth Required)
```

### Results Routes
```
POST   /api/results                    # Add single result (Auth Required)
POST   /api/results/batch              # Add batch results (Auth Required)
GET    /api/results                    # Get all results
GET    /api/results/teacher            # Get teacher's results (Auth Required)
GET    /api/results/class/:className/subject/:subjectId  # Get class results (Auth Required)
GET    /api/results/status             # Get submission status
```

### Analytics Routes (Admin Auth Required)
```
GET    /api/analytics/subject-performance
GET    /api/analytics/teacher-performance
GET    /api/analytics/class-performance
GET    /api/analytics/underperforming
GET    /api/analytics/top-performers
```

### Subject Routes
```
POST   /api/subjects                   # Add subject
GET    /api/subjects                   # Get all subjects
```

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, modify the `.env` file:
```env
PORT=5001
```

### Database Issues
If you encounter database errors:
1. Delete `school_system.db` file
2. Restart the server
3. Database will be recreated with new schema

### SMTP/Email Issues
If password reset emails don't send:
1. Verify SMTP credentials in `.env`
2. For Gmail, use [App Passwords](https://support.google.com/accounts/answer/185833)
3. Check firewall/network settings
4. Enable "Less secure app access" if using regular Gmail password

### Token Expired
If you see "Invalid or expired token":
1. Clear browser cache
2. Login again to get a new token

## File Structure
```
school-system/
├── server/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── routes/
├── client/
│   └── css/
│       ├── style.css
│       └── js/
│           ├── pages/
│           └── [page scripts]
├── package.json
├── .env
├── FEATURES.md
└── README.md
```

## Performance Optimization

### For Production
1. Set `NODE_ENV=production` in `.env`
2. Minify client-side JavaScript
3. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server/server.js --name school-system
   ```
4. Set up reverse proxy (nginx/Apache)
5. Configure CORS properly for your domain

### Database Optimization
For large datasets:
1. Add indexes to frequently queried columns
2. Archive old results
3. Consider upgrading to PostgreSQL or MySQL

## Backup & Recovery

### Backup Database
```bash
# Copy the database file
cp school_system.db school_system.backup.db
```

### Restore Database
```bash
# Copy backup back
cp school_system.backup.db school_system.db
```

## Support & Documentation

For more information, see:
- [FEATURES.md](FEATURES.md) - Feature documentation
- API responses are in JSON format
- Check browser console (F12) for detailed error messages

## Getting Help

If you encounter issues:
1. Check error messages in server console
2. Check browser console (F12)
3. Review the FEATURES.md file
4. Verify all dependencies are installed
5. Ensure database file exists
