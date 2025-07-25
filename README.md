# CampusLink - Student Utility Hub

A comprehensive full-stack web application designed to centralize campus services and utilities for college students.

## 🚀 Features

### Core Modules
- **🔐 Authentication System**: JWT-based secure authentication with role-based access (Student/Admin)
- **📢 Campus Announcements**: Admin-posted announcements with categorization and targeting
- **🔍 Lost & Found**: Smart item reporting system with image uploads and QR codes
- **📅 Timetable Manager**: Personal class scheduling with analytics
- **🏠 Hostel Complaints**: Complaint management system with status tracking
- **🤖 AI Chatbot**: Campus FAQ assistant (planned)

### Innovation Features
- **📧 Email Notifications**: Automated email alerts for announcements and updates
- **📱 QR Code Integration**: Pickup confirmation for lost items
- **📊 Analytics Dashboard**: Class attendance tracking and insights
- **🔒 Security**: Rate limiting, input sanitization, and secure headers
- **📱 PWA Ready**: Offline-first architecture for weak internet areas

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Email Service**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting
- **QR Codes**: qrcode library

### Frontend (Planned)
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **State Management**: Context API / Redux
- **HTTP Client**: Axios
- **UI Components**: Custom components with Tailwind

## 📁 Project Structure

```
server/
├── controllers/          # Request handlers
│   ├── authController.js
│   └── announcementController.js
├── middleware/           # Custom middleware
│   ├── auth.js          # Authentication & authorization
│   └── errorHandler.js  # Error handling & validation
├── models/              # Mongoose schemas
│   ├── User.js
│   ├── Announcement.js
│   ├── LostFound.js
│   ├── Timetable.js
│   └── Complaint.js
├── routes/              # API routes
│   ├── auth.js
│   └── announcements.js
├── utils/               # Utility services
│   ├── emailService.js
│   ├── qrCodeService.js
│   └── fileUploadService.js
├── uploads/             # File storage
├── index.js             # Main server file
└── test-setup.js        # Setup verification script
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Campulse
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/campuslink
   JWT_SECRET=your_super_secret_jwt_key_here
   CLIENT_URL=http://localhost:3000
   ```

4. **Test the setup**
   ```bash
   node test-setup.js
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `node test-setup.js` - Verify server configuration

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Change password
- `POST /api/auth/forgotpassword` - Request password reset
- `PUT /api/auth/resetpassword/:token` - Reset password

### Announcements
- `GET /api/announcements` - Get all announcements
- `GET /api/announcements/:id` - Get single announcement
- `POST /api/announcements` - Create announcement (Admin)
- `PUT /api/announcements/:id` - Update announcement (Admin)
- `DELETE /api/announcements/:id` - Delete announcement (Admin)
- `PUT /api/announcements/:id/like` - Like/unlike announcement
- `POST /api/announcements/:id/comments` - Add comment

### Health Check
- `GET /api/health` - Server health status

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/campuslink` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | `30d` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Email Configuration (Optional)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@campuslink.com
```

## 🗄️ Database Models

### User Schema
- Authentication fields (email, password, role)
- Personal information (name, student ID, department)
- Hostel information and preferences
- Profile settings and notifications

### Announcement Schema
- Content and metadata (title, description, category)
- Targeting options (department, year, hostel)
- Engagement features (likes, comments, views)
- Administrative controls (priority, active status)

### Lost & Found Schema
- Item details (title, description, category)
- Location and contact information
- Images and QR code integration
- Status tracking and expiration

### Timetable Schema
- Weekly schedule structure
- Subject and instructor details
- Analytics and attendance tracking
- Personal preferences and settings

### Complaint Schema
- Issue details and categorization
- Location and priority levels
- Status workflow and history
- Resolution tracking and feedback

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Student and Admin role separation
- **Rate Limiting**: API request throttling
- **Input Sanitization**: XSS protection
- **Secure Headers**: Helmet.js security headers
- **CORS Configuration**: Cross-origin request control
- **File Upload Security**: Type and size validation

## 🚧 Development Status

### ✅ Completed
- [x] Complete backend API structure
- [x] User authentication system
- [x] Announcement management
- [x] Database models and relationships
- [x] File upload system
- [x] Email service integration
- [x] QR code generation
- [x] Security middleware
- [x] Error handling and validation

### 🚧 In Progress
- [ ] Frontend React application
- [ ] Lost & Found routes and controllers
- [ ] Timetable management system
- [ ] Complaint management system
- [ ] AI Chatbot integration

### 📋 Planned
- [ ] Push notifications
- [ ] PWA implementation
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Real-time features with WebSockets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support, email admin@campuslink.com or create an issue in the repository.

---

Built with ❤️ for the campus community
