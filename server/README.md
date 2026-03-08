# UAV Online Course Platform Backend

Production-ready Node.js + Express + MongoDB (Mongoose) backend with JWT auth, bcrypt password hashing, and role-based access control (Student/Admin).

## Requirements

- Node.js 18+ recommended
- MongoDB running locally or a hosted MongoDB URI

## Setup

1. Create environment file:

   - Copy `server/.env.example` to `server/.env`
   - Fill in `MONGO_URI` and `JWT_SECRET`

2. Install dependencies:

```bash
cd server
npm install
```

3. Run the backend:

```bash
npm run dev
```

The API will run on `http://localhost:5000` by default and is configured to accept requests from a Vite frontend on `http://localhost:3000`.

## API

- `POST /auth/register`
- `POST /auth/login`
- `GET /courses`
- `POST /courses` (Admin)
- `PUT /courses/:id` (Admin)
- `DELETE /courses/:id` (Admin)
- `POST /modules` (Admin)
- `POST /lessons` (Admin)
- `POST /enrollments/enroll` (Student)
- `GET /enrollments/my-courses` (Student)
- `POST /enrollments/complete-lesson` (Student)
- `GET /analytics/overview` (Admin)

## Auth Header

Send JWT as:

- `Authorization: Bearer <token>`

