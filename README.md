# Smart Attend SaaS - Advanced School Attendance System 🎓

A professional, full-stack SaaS platform for modern school management. Built with a premium Glassmorphism UI, real-time notifications, and comprehensive academic modules.

## 🚀 Key Features

### 👨‍💼 Admin Panel
- **Global Stats**: Real-time analytics for teachers, students, attendance, and fees.
- **Analytics**: Beautiful charts (Recharts) for trends and financial tracking.
- **Management**: Central control for faculty and student directories.
- **Communications**: Post school-wide notices and calendar events.

### 👨‍🏫 Teacher Panel
- **Student Management**: Detailed directory of assigned students.
- **Attendance**: Manual attendance marking with instant synchronization.
- **Academic Modules**: Create assignments, set deadlines, and grade submissions.
- **Notice Board**: Post class-specific notices and updates.
- **Exports**: Export attendance history to CSV/Excel.

### 👨‍🎓 Student Panel
- **Smart Dashboard**: Visual attendance percentage and fee status tracking.
- **Location Attendance**: Secure GPS-based marking (must be within school radius).
- **Academics**: View and submit assignments with file upload support.
- **Notifications**: Real-time alerts for new assignments, fee reminders, and notices.

### 📍 Location-Based Attendance
- Uses Browser Geolocation API.
- Secure radius check (100m) around school coordinates.
- Error handling for disabled GPS or out-of-bounds attempts.

### 🎨 Premium UI/UX
- **Glassmorphism**: Modern transparent design with high-quality blurs.
- **Animations**: Smooth transitions using Framer Motion.
- **Real-time**: Instant updates via Socket.io.
- **Responsive**: Fully optimized for Desktop, Tablet, and Mobile.

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS v4, Framer Motion, Recharts, Socket.io-client.
- **Backend**: Node.js, Express.js, Socket.io, Multer (File Uploads).
- **Database**: MySQL, Sequelize ORM.
- **Security**: JWT Authentication, Bcrypt Password Hashing, Role-Based Access Control (RBAC).

## 📦 Setup Instructions

### 1. Database Setup
- Create a MySQL database named `smart_school_attendance`.

### 2. Backend Setup
```bash
cd server
npm install
# Update .env with your MySQL credentials
node seed.js # Initialize and seed sample data
npm start
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

## 🔑 Default Accounts (Seeded)
- **Admin**: `admin` / `admin123`
- **Teacher**: `teacher` / `teacher123`
- **Student**: `student` / `student123`

## 📁 Architecture
- `/client/src/services`: Centralized API service.
- `/client/src/context`: Auth, Notification, and Theme contexts.
- `/server/controllers`: Business logic for all modules.
- `/server/routes`: Secure, role-protected endpoints.
- `/server/uploads`: Secure storage for assignments and profile photos.
