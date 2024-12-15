create database portal_database;

use portal_database;

create table USERS(
name varchar(50),
email varchar(50),
id int 
);


alter table users modify column id INT AUTO_INCREMENT PRIMARY KEY;
ALTER TABLE users
ADD COLUMN password VARCHAR(255) NOT NULL,
ADD COLUMN role ENUM('student', 'admin') DEFAULT 'student',
ADD COLUMN course VARCHAR(255);

use portal_database;

alter table users rename students;

CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(100),
    student_id INT,
    grade VARCHAR(10),
    FOREIGN KEY (student_id) REFERENCES students(id)
);


alter table students modify email varchar(100) unique;

-- Table for subjects

CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('Major', 'Minor') NOT NULL,
    course ENUM('BSCS', 'BSIT') NOT NULL
);

-- Table for student-subject enrollment
CREATE TABLE student_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    grade DECIMAL(5, 2) DEFAULT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- Insert predefined subjects
INSERT INTO subjects (name, type, course) VALUES
('CMPSC 116 Database Systems', 'Major', 'BSCS'),
('CMPSC 131 Data Structures', 'Major', 'BSCS'),
('SOCSC 03 Understanding The Self', 'Minor', 'BSCS'),
('HUM 12 Reading Visual Arts', 'Minor', 'BSCS'),
('IT 16 Database Systems', 'Major', 'BSIT'),
('SOCSC 03 Understanding The Self', 'Minor', 'BSIT'),
('HUM 12 Reading Visual Arts', 'Minor', 'BSIT');


-- Rename the students table to users and add role
ALTER TABLE students RENAME TO users;

-- Update the subjects table to allow professors to add subjects
ALTER TABLE subjects ADD COLUMN created_by INT NULL AFTER course;

-- Update the student_subjects table to allow grade modifications
ALTER TABLE student_subjects MODIFY COLUMN grade DECIMAL(5, 2) NULL;

-- Example data for professors creating subjects
INSERT INTO subjects (name, type, course, created_by) VALUES
('Advanced Algorithms', 'Major', 'BSCS', 6), -- Created by Professor ID 6
('Network Security', 'Major', 'BSIT', 7);    -- Created by Professor ID 7