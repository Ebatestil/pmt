Project Management Tool

A modern full-stack project management application built with Laravel and React. This application enables teams to organize projects, manage members, assign tasks, and monitor progress through a role-based permission system.

Features
🔐 User Authentication
👥 Role-Based Access Control (Owner, Manager, Member)
📁 Project Management
👤 Project Member Management
✅ Task Creation and Assignment
📌 Task Status Tracking
📊 Dashboard Overview
📱 Responsive Interface
Tech Stack
Backend
Laravel 12
PHP 8.2+
Laravel Sanctum
MySQL
REST API
Frontend
React 19
TypeScript
Vite
React Router
Axios
SweetAlert2
Prerequisites

Install the following before running the project:

PHP 8.2 or later
Composer
Node.js 18 or later
npm
MySQL
Getting Started
1. Clone the Repository
git clone https://github.com/Ebatestil/pmt.git
cd pmt
2. Backend Setup

Navigate to the backend directory.

cd backend

Install Composer dependencies.

composer install

Since the repository already includes the environment configuration, you can proceed with generating the application key.

php artisan key:generate

Create a MySQL database named:

pmt

Run the database migrations.

php artisan migrate

If your project contains seeders, run:

php artisan db:seed

Start the Laravel development server.

php artisan serve

The backend will be available at:

http://127.0.0.1:8000
3. Frontend Setup

Open another terminal.

Navigate to the frontend directory.

cd frontend

Install dependencies.

npm install

Start the development server.

npm run dev

The frontend will run at:

http://localhost:5173
Running the Project

Run both servers at the same time.

Backend
cd backend
php artisan serve
Frontend
cd frontend
npm run dev

Database Configuration

By default, the backend is configured to use:

Setting	Value
Database	pmt
Host	127.0.0.1
Port	3306

If your MySQL credentials differ, update the backend .env file before running the migrations.

API

The frontend communicates with the Laravel backend using:

http://127.0.0.1:8000/api

Make sure the backend server is running before starting the frontend.

Future Improvements
File attachments
Project deadlines
Email notifications
Activity logs
Team invitations
Kanban board
Calendar view
License

This project was developed for educational and portfolio purposes.

Visit:

http://localhost:5173
