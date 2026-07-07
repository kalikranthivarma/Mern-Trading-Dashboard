# MERN Financial & Trading Dashboard

Enterprise-grade MERN trading dashboard scaffold for high-frequency finance applications.

## Structure

- `frontend/` — React + Vite dashboard
- `server/` — Express API, Socket.io, GridFS, auth, trading services

## Features

- JWT authentication with refresh tokens and HttpOnly cookies
- Role-based authorization (Super Admin, Admin, Trader, Analyst, Viewer)
- Trading and portfolio analytics
- Realtime updates via Socket.io
- GridFS file storage for profile images, documents, and reports
- Export reports to CSV and PDF
- Tailwind CSS with glassmorphism UI
- Redux Toolkit + React Query caching
- Security middleware: Helmet, CORS, rate limiting, compression

## Setup

1. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Install backend dependencies:
   ```bash
   cd ../server
   npm install
   ```
3. Copy `.env.example` to `.env` in both folders and configure values.
4. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```
5. Start backend:
   ```bash
   cd server
   npm run dev
   ```

## Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## Notes

This scaffold uses enterprise architecture and modular MVC patterns designed for scalability, testability, and production readiness.
