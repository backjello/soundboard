# 🎵 Soundboard Application

A full-stack web application for managing and playing audio files, built with Angular frontend and AdonisJS backend.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- 🎵 **Audio Management**: Upload, play, rename, and delete audio files
- 🔍 **Search & Filter**: Search audio files by name and filter favorites
- ⭐ **Favorites System**: Mark audio files as favorites for quick access
- 👤 **User Authentication**: Secure login and registration system
- 🔒 **Authorization**: Users can only edit/delete their own uploads
- 📱 **Responsive Design**: Works on desktop and mobile devices

### Audio Features
- Multiple audio format support (MP3, WAV, etc.)
- Real-time audio playback
- Audio file metadata management
- Bulk operations support
- Server-side audio output for office-wide playback

## 🛠 Tech Stack

### Backend (`/be`)
- **Framework**: [AdonisJS 6](https://adonisjs.com/) - Node.js web framework
- **Database**: MySQL with [Lucid ORM](https://lucid.adonisjs.com/)
- **Authentication**: AdonisJS Auth with API tokens
- **Language**: TypeScript
- **Audio Processing**: Audic library
- **Validation**: VineJS

### Frontend (`/fe`)
- **Framework**: [Angular 15](https://angular.io/)
- **UI Components**: Angular Material
- **Styling**: SCSS
- **HTTP Client**: Angular HttpClient
- **Language**: TypeScript

## 📁 Project Structure

```
soundboard/
├── be/                          # Backend (AdonisJS)
│   ├── app/
│   │   ├── controllers/         # HTTP controllers
│   │   ├── middleware/          # Custom middleware
│   │   └── models/              # Database models
│   ├── audio/                   # Uploaded audio files
│   ├── config/                  # Configuration files
│   ├── database/
│   │   └── migrations/          # Database migrations
│   ├── start/                   # Application bootstrap
│   └── package.json
├── fe/                          # Frontend (Angular)
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/      # Angular components
│   │   │   ├── guards/          # Route guards
│   │   │   ├── models/          # TypeScript interfaces
│   │   │   └── services/        # Angular services
│   │   ├── assets/              # Static assets
│   │   └── environments/        # Environment configs
│   └── package.json
└── README.md
```

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)
- **MySQL** (v8.0 or higher)
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd soundboard
```

### 2. Backend Setup

```bash
cd be

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate application key
node ace generate:key

# Run database migrations
node ace migration:run
```

### 3. Frontend Setup

```bash
cd ../fe

# Install dependencies
npm install
```

## 🔊 Audio Output Setup

### Office-Wide Audio Playback

This soundboard application is designed to play audio files through the **server's audio output**, not through individual client browsers. This means:

**Requirements for Office-Wide Playback:**
- The server must have **audio output capabilities** (AUX/jack output, speakers, or audio interface)
- Connect the server's audio output to your office sound system, speakers, or PA system
- The server should be running on a machine with proper audio drivers installed

**How it Works:**
1. When a user clicks "play" on an audio file, the request is sent to the backend server
2. The server processes the audio file using the `audic` library
3. Audio is played through the **server's audio output** (not the user's browser)
4. This allows everyone in the office to hear the sound, regardless of their device's audio settings

**Hardware Setup:**
```
[Server with Audio Output] → [Office Sound System/Speakers]
                ↑
        [Users access via web browser]
```

**Important Notes:**
- Individual users' devices do **not** need speakers or audio output
- All audio playback happens server-side
- Multiple users can trigger sounds that play through the central office audio system
- Ensure your server has appropriate audio permissions and drivers

## ⚙️ Configuration

### Backend Configuration

Edit the `.env` file in the `be` directory:

```env
# Server Configuration
TZ=UTC
PORT=3333
HOST=localhost
LOG_LEVEL=info
NODE_ENV=development

# Application
APP_KEY=your-generated-app-key

# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_DATABASE=soundboard
```

### Frontend Configuration

Update the environment files in `fe/src/environments/`:

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3333'
};
```

### Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE soundboard;
```

2. Run migrations:
```bash
cd be
node ace migration:run
```

## 🎮 Usage

### Starting the Application

#### Development Mode

**Backend:**
```bash
cd be
npm run dev
```
The backend will start on `http://localhost:3333`

**Frontend:**
```bash
cd fe
npm start
```
The frontend will start on `http://localhost:4200`

#### Production Mode

**Backend:**
```bash
cd be
npm run build
npm start
```

**Frontend:**
```bash
cd fe
npm run build
```

### Using the Application

1. **Register/Login**: Create an account or login with existing credentials
2. **Upload Audio**: Click the upload button to add new audio files
3. **Play Audio**: Click on any audio file to play it
4. **Manage Files**: Rename or delete your uploaded files
5. **Favorites**: Star audio files to mark them as favorites
6. **Search**: Use the search bar to find specific audio files

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login user |
| GET | `/auth/me` | Get current user info |

### Audio Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/audio` | Get all audio files | No |
| GET | `/audio/:id` | Get specific audio file | No |
| GET | `/audio/play/:id` | Play audio file | No |
| POST | `/audio` | Upload new audio file | Yes |
| PUT | `/audio/:id` | Update audio file | Yes |
| DELETE | `/audio/:id` | Delete audio file | Yes |
| POST | `/audio/:id/favorite` | Add to favorites | Yes |
| DELETE | `/audio/:id/favorite` | Remove from favorites | Yes |

### Request Examples

**Register User:**
```bash
curl -X POST http://localhost:3333/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password","fullName":"John Doe"}'
```

**Upload Audio:**
```bash
curl -X POST http://localhost:3333/audio \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "audio=@path/to/audio.mp3" \
  -F "name=My Audio File"
```

## 🔧 Development

### Backend Development

```bash
cd be

# Start development server with hot reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run typecheck
```

### Frontend Development

```bash
cd fe

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Run linting
ng lint
```

### Database Operations

```bash
cd be

# Create new migration
node ace make:migration create_table_name

# Run migrations
node ace migration:run

# Rollback migrations
node ace migration:rollback

# Check migration status
node ace migration:status
```

### Adding New Features

1. **Backend**: Add controllers, models, and routes in the `be` directory
2. **Frontend**: Add components, services, and models in the `fe/src/app` directory
3. **Database**: Create migrations for schema changes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the UNLICENSED License - see the package.json files for details.

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error:**
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists

**Audio Output Issues:**
- Verify server has audio output capabilities (speakers/AUX jack)
- Check audio drivers are installed on server
- Ensure server audio output is connected to office sound system
- Test server audio with: `speaker-test -t sine -f 1000 -l 1` (Linux)
- On Windows, verify audio service is running

**File Upload Issues:**
- Check file permissions in `be/audio` directory
- Verify supported audio formats
- Check file size limits

**CORS Issues:**
- Verify frontend URL in backend CORS configuration
- Check API endpoints are correctly configured

**Authentication Issues:**
- Verify JWT token is being sent in headers
- Check token expiration
- Ensure user is properly logged in

### Getting Help

If you encounter any issues:

1. Check the console logs for error messages
2. Verify all dependencies are installed
3. Ensure database migrations have been run
4. Check that all environment variables are set correctly

For additional support, please open an issue in the repository.

---

**Happy Coding! 🎵**