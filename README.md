# Hospital Management System

This repository contains a hospital management project with a React frontend and a separate Express backend.

## Project Folders
```text
hospital-ui/    React + Vite frontend
hospital-api/   Express + MongoDB backend
```

## Features Started
- Login
- Admin-only create user
- JWT authentication
- Password hashing
- Role-based access
- Forgot password and reset password
- User model
- DSA example: emergency patient priority queue

## How To Run From Zero
Install Node.js first, then clone the repo:

```bash
git clone https://github.com/Sujal-mankotia/hospital-managment-system.git
cd hospital-managment-system
```

Run the backend:

```bash
cd hospital-api
npm install
copy .env.example .env
npm run dev
```

Run the frontend in a second terminal:

```bash
cd hospital-ui
npm install
npm run dev
```

Open the Vite URL:

```text
http://localhost:5173/
```

## Where To Start Coding
Start with the backend auth files:

```text
hospital-api/models/User.js
hospital-api/controllers/authController.js
hospital-api/routes/authRoutes.js
hospital-api/routes/userRoutes.js
hospital-api/middleware/authMiddleware.js
hospital-api/middleware/roleMiddleware.js
```

Then connect or adjust frontend pages:

```text
hospital-ui/src/pages/Login/LoginPage.jsx
hospital-ui/src/pages/Admin/CreateUserPage.jsx
hospital-ui/src/pages/ForgotPassword/ForgotPasswordPage.jsx
hospital-ui/src/context/AuthContext.jsx
hospital-ui/src/api/authApi.js
```

## Viva Explanation
- `User.js` defines what a user looks like in MongoDB.
- Password hashing happens before saving the user, so plain passwords are not stored.
- Login compares the entered password with the hashed password.
- JWT is created after successful login/signup.
- Admin-only create user uses `POST /api/users`.
- The frontend stores the JWT in `localStorage`.
- Protected API routes read the JWT from the `Authorization` header.
- Role middleware blocks users who do not have the required role.
- Forgot password creates a temporary reset token with an expiry time.
- DSA is used in the emergency queue, where higher-priority patients come first.
