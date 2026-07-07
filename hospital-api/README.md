# Hospital API

This backend handles authentication for the hospital management system.

## Features
- Signup with password hashing using `bcryptjs`
- Login with JWT using `jsonwebtoken`
- Protected routes using auth middleware
- Role-based access using role middleware
- Forgot password with reset token
- User model using MongoDB and Mongoose
- DSA example: emergency patient priority queue

## Setup
```bash
cd hospital-api
npm install
copy .env.example .env
npm run dev
```

Update `.env` before running:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hospital_management
JWT_SECRET=write_a_long_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

## Main Routes
```text
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/forgot-password
PATCH  /api/auth/reset-password/:token
GET    /api/auth/admin-only
POST   /api/queue/emergency
GET    /api/queue/emergency/next
```

## Viva Notes
- Password hashing means the real password is never stored in MongoDB.
- JWT is a signed token sent by the backend after login/signup.
- The frontend stores the JWT and sends it in the `Authorization` header.
- `protect` middleware verifies the JWT before allowing protected routes.
- `allowRoles` checks if the logged-in user's role is allowed.
- Forgot password stores a hashed reset token and expiry time.
- The priority queue is a DSA feature that serves the most urgent patient first.
