const { Pool } = require("pg");
const {alterTable}=require("./public/scripts/alterTable");



// The secret connection string you copied earlier
const connectionString =
  "postgresql://postgres:-b2F1GcGge4DBEbCG5da-Bgd*BB1Bf2F@monorail.proxy.rlwy.net:15576/railway";

const pool = new Pool({
  connectionString,
});
pool.on('connect', () => {
  console.log('Connected to the database');
});

// Listen for the 'error' event - triggered when an error occurs during the connection
pool.on('error', (err) => {
  console.error('Error connecting to the database:', err);
});

// You can also test the connection by executing a query
pool.query('SELECT NOW()', (error, results) => {
  if (error) {
    console.error('Error executing query:', error);
    return;
  }
  console.log('Connection test successful:', results.rows[0].now);
});
const executeQuery = async (query, values) => {
  try {
    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();
    return result.rows; // Or any desired return value
  } catch (error) {
    throw new Error(error.message);
  }
};

// module.exports = { executeQuery };
// pool.query('DROP table users',(err,res)=>{
//   if(err) {
//     console.log("err while dropping ",err);
//     return;

//   }
//   console.log('dropped');

// })
module.exports = { pool, executeQuery };

