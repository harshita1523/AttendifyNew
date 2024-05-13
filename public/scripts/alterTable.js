
const {pool} = require("../../db");

// SQL query to add columns to the 'users' table
// const alterQuery = `
//     CREATE TABLE users
//     ALTER TABLE users 
//     ADD COLUMN name VARCHAR(50) NOT NULL,
//     ADD COLUMN email VARCHAR(255) NOT NULL,
//     ADD COLUMN password VARCHAR(255) NOT NULL,
//     ADD COLUMN role VARCHAR(50) NOT NULL

// `;
// const alterQuery=`
//     CREATE TABLE users (
//         id BIGINT PRIMARY KEY,
//         name VARCHAR(50) NOT NULL,
//         email VARCHAR(255) NOT NULL,
//         password VARCHAR(255) NOT NULL,
//         role VARCHAR(50) NOT NULL,
//         status BOOLEAN NOT NULL
//     );
// `;
//  const alterQuery=`
//     CREATE TYPE status AS ENUM ('present', 'absent', 'late');
//     CREATE TABLE attendance (
//         attendance_id SERIAL PRIMARY KEY,
//         user_id BIGINT NOT NULL,
//         date DATE NOT NULL,
//         subject VARCHAR(50) NOT NULL,
//         status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late')),
//         FOREIGN KEY (user_id) REFERENCES users(id)
//     );
// `
// const alterQuery=`
//     CREATE TABLE student AS SELECT * FROM users WHERE role = 'student' AND status = TRUE;
// `
// const alterQuery=`
// CREATE TABLE faculty AS SELECT * FROM users WHERE role = 'faculty';
// `
// const alterQuery=`
//     ALTER TABLE attendance
//     RENAME COLUMN date TO attendance_date;

// `
// const alterQuery=`
// DELETE FROM attendance
// WHERE attendance_date = '2024-01-10';
// `
// const alterQuery=`
// CREATE TABLE subjects (
//     subject_id SERIAL PRIMARY KEY,
//     subject_name VARCHAR(50) NOT NULL,
//     class_date DATE NOT NULL
// );

// `
// console.log("Successfully executed alterTable.js");
// const alterQuery=`DELETE TABLE attendance`;

// const alterQuery=`
//     DELETE FROM attendance
//     WHERE attendance_date = '2024-02-22'
// `

// pool.query(alterQuery, (error, results) => {
//     if (error) {
//         console.error('Error altering table:', error);
//         return;
//     }
//     console.log('Columns added to the table successfully.');
// });