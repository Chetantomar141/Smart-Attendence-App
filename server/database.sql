-- Create Database
CREATE DATABASE IF NOT EXISTS smart_school_attendance;
USE smart_school_attendance;

-- Note: Sequelize will automatically create these tables.
-- This file is for manual reference or initial setup if not using Sequelize sync.

-- Users Table
-- Roles: admin, teacher, student
-- teacherId links students to their teachers

-- Attendance Table
-- Links to Users (student)

-- Fees Table
-- Links to Users (student)
