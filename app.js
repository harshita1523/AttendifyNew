const express = require("express");
const app = express();
const { pool, executeQuery } = require('./db');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
var cors = require("cors");
const path = require('path');
// var flush=require("connect-flash");



app.set('view engine', 'ejs');
// app.set('views', './views');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());

// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')))

// Body parser setup

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'needynerd01', // Change this to a more secure random string
  resave: false,
  saveUninitialized: true
}));

// app.use(flush());

const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);


const PORT = 8000;
app.set('view engine', 'ejs');
app.use(express.static('public'));




async function generateRandomId() {
  const min = 1000000000; // Minimum 10-digit number
  const max = 9999999999; // Maximum 10-digit number
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

app.post('/createUser', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if the email already exists
    const emailExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (emailExists.rows.length > 0) {
      console.log('User already exists');
      return res.status(409).send('User already exists');
    }

    // Hash the password
    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).send('Error creating user');
      }
      const id = await generateRandomId();
      let status = true; // Default status for non-student users

      if (role === 'student') {
        status = false; // Set status to false for student users
      }
      // Use the hashed password in the query to create a new user
      const newUser = await pool.query('INSERT INTO users (id, name, email, password, role, status) VALUES ($1, $2, $3, $4, $5, $6)', [id, name, email, hash, role, status]);

      const user = {
        id: id,
        name: name,
        email: email,
        password: hash, // Avoid storing the plain password in the user object
        role: role,
        status: status
      };

      // console.log(user);
      // console.log(user.role);
      // console.log(user.role==='student');
      // res.status(200).send('User created successfully' + JSON.stringify(user));
      res.redirect('/login');
      // if (user.role === 'faculty') {
      //   res.redirect('/faculty');
      // } else if (user.role==='student') {
      //   res.redirect('/student');
      // } else {
      //   res.render('login'); // Redirect to a default page or handle other roles
      // }
      
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).send('Error creating user');
  }
});
// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

//     if (user.rows.length === 0) {
//       // Send a JSON response to the frontend indicating login failure
//       return res.status(401).json({ success: false, message: 'Invalid email or password' });
//     }

//     const hashedPassword = user.rows[0].password;

//     bcrypt.compare(password, hashedPassword, (err, result) => {
//       if (err) {
//         console.error('Error comparing passwords:', err);
//         return res.status(500).json({ success: false, message: 'Server error' });
//       }

//       if (!result) {
//         // Send a JSON response to the frontend indicating login failure
//         return res.status(401).json({ success: false, message: 'Invalid email or password' });
//       }

//       const userRole = user.rows[0].role;
//       const userData = {
//         id: user.rows[0].id,
//         name: user.rows[0].name,
//         email: user.rows[0].email,
//         role: user.rows[0].role,
//         status: user.rows[0].status
//       };

//       req.session.user = userData;
//       // console.log(user);
//       // console.log(userData);
//       // console.log(user.role);
//       // console.log(typeof(user.role));
//       // console.log(userData.role=='student');

//       // Check if it's an API request
//       if (req.headers.accept && req.headers.accept.includes('application/json')) {
//         // Send a JSON response to the frontend indicating login success
//         return res.status(200).json({ success: true, userData });
//       }

//       // Not an API request, continue with your existing redirection logic
//       if (userRole === 'faculty') {
//         res.redirect('/faculty');
//       } else if (userRole === 'student') {
//         res.redirect('/student');
//       } else {
//         res.render('login'); // Redirect to a default page or handle other roles
//       }

//       console.log("Login successful");
//     });
//   } catch (error) {
//     console.error('Error finding user:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // console.log(email);
  pool.query('SELECT * FROM users WHERE email = $1', [email], async (error, user) => {
    if (error) {
      console.error('Error finding user:', error);
      // return res.redirect('/login?error=Server error');

      return res.status(500).send('Server error');
    }

    if (user.rows.length === 0) {
      // return res.redirect('/login?error=Invalid email or password');
      return res.status(401).send(`'Invalid email or password user.rows.length' ${user.rows.length}`);
    }
    // console.log(user);


    const hashedPassword = user.rows[0].password; // Fetch hashed password from the database

    // Compare the provided password with the hashed password from the database
    bcrypt.compare(password, hashedPassword, (err, result) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).send('Server error');
        // return res.redirect('/login?error=Server error');
      }

      if (!result) {
        // res.redirect('/login',{ success: false, message: 'Invalid email or password' });
        req.session.errorMessage = 'Invalid email or password';
        return res.redirect('/login');
        // return res.redirect('/login?success=false&message=Invalid email or password');

        // return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      // Passwords match - authentication successful
      const userRole = user.rows[0].role;
      const userData = {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        role: user.rows[0].role,
        status: user.rows[0].status
      };

      req.session.user = userData;
      // console.log(userData.role);

      if (userRole === 'faculty') {

        res.redirect('/faculty');
      } else if (userRole === 'student') {
        res.redirect('/student');
      } else {
        res.render('login'); // Redirect to a default page or handle other roles
      }
      console.log("Login successfull");
    });
  });
});
const requireLogin = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    // User is not logged in, redirect to the login page or handle as needed
    // res.redirect('/login',{message:flash('message')}); // Redirect to the login page
    res.redirect('/login');
  }
};

// Apply the middleware to the '/faculty' route
app.get('/faculty', requireLogin, (req, res) => {
  res.render('facultyPage', { username: req.session.user.name, email: req.session.user.email });
});
app.get('/student', requireLogin, (req, res) => {
  // console.log(req.session.user.status);
  res.render('studentPage', { username: req.session.user.name, id: req.session.user.id, email: req.session.user.email, status: req.session.user.status }); // Assuming 'studentPanel.ejs' is your student interface
});


function isTeacher(req, res, next) {
  // Assuming user role is stored in the token or session

  const userRole = req.session.user.role; // Get user role from authentication
  console.log(userRole);
  // Check if the user is a teacher (or any other role with access)
  if (userRole === 'faculty') {
    return next(); // User is a teacher, proceed to the next middleware
  } else {
    return res.status(403).json({ message: 'Forbidden' }); // User doesn't have access
  }
}



app.get('/students', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE role = $1', ['student']);
    const students = result.rows;
    client.release();
    res.json(students);
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).send('Error fetching data');
  }
});
app.put('/api/registerStudent/:studentId', async (req, res) => {
  const studentId = req.params.studentId;

  try {
    // Perform the database update query
    const updateQuery = 'UPDATE users SET status = true WHERE id = $1';
    const { rowCount } = await pool.query(updateQuery, [studentId]);

    if (rowCount === 1) {
      res.sendStatus(200); // Successfully updated
    } else {
      res.status(404).send('Student not found'); // Student with given ID not found
    }
  } catch (err) {
    console.error('Error registering student:', err);
    res.status(500).send('Error registering student'); // Error during registration
  }
});

app.post('/addAttendance', async (req, res) => {
  const scannedData = req.body.scannedData;
  // const date = new Date().toISOString().split('T')[0];
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(now.getDate()).padStart(2, '0');
  const date = `${year}-${month}-${day}`;
  console.log(date);
  const subject = scannedData.subject;
  // console.log(scannedData);
  console.log(date);
  console.log(Date());
  // console.log(Date().toISOString());
  // console.log(Date().toISOString().split('T'));

  // Check if attendance for this student on this date and subject already exists
  const existingAttendance = await executeQuery(
    `SELECT * FROM attendance WHERE user_id = $1 AND attendance_date = $2 AND subject = $3`,
    [scannedData.id, date, subject]
  );

  if (existingAttendance.length > 0) {
    res.status(400).send('Attendance for this student on this date and subject already exists.');
  } else {
    const insertQuery = `
        INSERT INTO attendance (user_id, attendance_date, subject, status)
        VALUES ($1, $2, $3, $4)
      `;
    // Insert attendance record into the database
    executeQuery(insertQuery, [scannedData.id, date, subject, 'present'])
      .then(() => {
        res.status(200).send('Attendance added successfully.');
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send('Error adding attendance:', error);
      });
  }
});
// app.use('/attendance', attendanceRoutes);
// app.get('/attendanceData', (req, res) => {
//   const { subject } = req.query;
//   // Use the subject to query the database for attendance data
//   // Replace this with your database logic
//   // const attendanceData = /* Logic to retrieve attendance data based on subject */;
//   res.json(attendanceData);
// });
// app.get('/attendance', async (req, res) => {
//   try {
//     const students = await db.query("SELECT id, name FROM users WHERE status = true AND role = 'faculty'");

//     const attendanceData = {};

//     for (const student of students) {
//       const { id } = student;
//       const attendance = await db.query("SELECT date, attendance_status FROM attendance WHERE student_id = $1 AND subject = $2", [id, 'Maths']);

//       const processedAttendance = {};
//       attendance.forEach(({ date, attendance_status }) => {
//         processedAttendance[date] = attendance_status === 'P' ? 'P' : 'A';
//       });

//       attendanceData[id] = {
//         id,
//         name: student.name,
//         attendance: processedAttendance,
//       };
//     }

//     res.json({ students: Object.values(attendanceData) });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


app.get('/attendance/:subject', async (req, res) => {
  try {
    const { subject } = req.params;
    // console.log(subject);
    const students = await executeQuery("SELECT id, name FROM users WHERE status = true AND role = 'student'");

    const attendanceData = {};

    for (const student of students) {
      const { id } = student;
      const attendanceDates = await executeQuery("SELECT attendance_date FROM attendance WHERE user_id = $1 AND subject = $2 AND status = 'present'", [id, subject]);
      // console.log(attendanceDates);
      const dates = attendanceDates.map(({ attendance_date }) => {
        const date = new Date(attendance_date);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      });
      // console.log(dates);
      attendanceData[id] = {
        id,
        name: student.name,
        subject: subject,
        dates, // Storing only the dates when the student was marked present for 'Maths'
      };
    }
    res.json({ students: Object.values(attendanceData) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/faculty', async (req, res) => {
  try {
    const { subjectName, classDate } = req.body;

    // Perform the SQL INSERT operation to add data to the subjects table
    const query = {
      text: 'INSERT INTO subjects (subject_name, class_date) VALUES ($1, $2)',
      values: [subjectName, classDate],
    };

    await pool.query(query);

    res.status(200).json({ message: 'Data added to subjects table' });
  } catch (error) {
    console.error('Error adding data to subjects table:', error);
    res.status(500).json({ error: 'Failed to add data to subjects table' });
  }
});

app.delete('/students/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Delete attendance records for the user first
    const deleteAttendanceQuery = {
      text: 'DELETE FROM attendance WHERE user_id = $1',
      values: [userId],
    };
    await pool.query(deleteAttendanceQuery);

    // Then delete the user from the users table
    const deleteUserQuery = {
      text: 'DELETE FROM users WHERE id = $1',
      values: [userId],
    };
    await pool.query(deleteUserQuery);

    res.status(200).json({ message: 'User and associated attendance data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user and attendance data:', error);
    res.status(500).json({ error: 'Failed to delete user and attendance data' });
  }
});


// Backend route to fetch attendance for a specific student
app.get('/student/:studentId/attendance', async (req, res) => {
  try {
    const studentId = req.params.studentId;
    // Assuming you have a function to fetch attendance data for a specific student from your database
    const attendanceData = await getStudentAttendanceFromDB(studentId);
    const totalClasses=await getTotalClasses();
    // console.log(totalClasses);
    res.json({ attendance: attendanceData, totalClasses: totalClasses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to fetch student attendance' });
  }
});
async function getTotalClasses(){
  const totalClasses = await executeQuery(
    'SELECT subject_name AS subject, COUNT(DISTINCT class_date) AS total_days FROM subjects GROUP BY subject_name;',
    []
  );
  // console.log(totalClasses)
  return totalClasses;
}
// Function to fetch attendance data for a specific student from the database
// async function getStudentAttendanceFromDB(studentId) {
//   try {
//     const attendanceQueryResult = await executeQuery(
//       "SELECT subject, COUNT(attendance_date) AS attendedClasses, ARRAY_AGG(attendance_date) AS attendanceDates FROM attendance WHERE user_id = $1 GROUP BY subject",
//       [studentId]
//     );
//     const totalClasses=await executeQuery(
//     "SELECT subject_name AS subject,COUNT(DISTINCT class_date) AS total_day FROM subjects GROUP BY subject_name;",
//     [subject,total_day]
//     );

//     console.log(totalClasses);

//     return {attendanceQueryResult,totalClasses};
//   } catch (error) {
//     console.error('Error fetching student attendance from DB:', error);
//     throw new Error('Failed to fetch student attendance');
//   }
// }
async function getStudentAttendanceFromDB(studentId) {
  try {
    const attendanceQueryResult = await executeQuery(
      'SELECT subject, COUNT(DISTINCT attendance_date) AS attendedClasses, ARRAY_AGG(DISTINCT attendance_date) AS attendanceDates FROM attendance WHERE user_id = $1 GROUP BY subject',
      [studentId]
    );
    console.log(attendanceQueryResult);
    return attendanceQueryResult;
  } catch (error) {
    throw error;
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`)
});
