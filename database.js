import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql2.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function get_all() {
  try {
    const [rows] = await pool.query("SELECT * FROM shows");
    return rows;
  } catch (error) {
    console.error('Error fetching shows:', error);
    throw error;
  }
}

export async function get_t() {
  try {
    const [rows] = await pool.query("SELECT * FROM screen");
    return rows;
  } catch (error) {
    console.error('Error fetching screens:', error);
    throw error;
  }
}

export async function get_t_by_id() {
  try {
    const [rows] = await pool.query("SELECT * FROM theater");
    return rows;
  } catch (error) {
    console.error('Error fetching theaters:', error);
    throw error;
  }
}

export async function get_user_by_email(email) {
  try {
    const [rows] = await pool.query('SELECT * FROM user WHERE Email = ?', [email]);
    return rows;
  } catch (error) {
    console.error('Error in get_user_by_email:', error.message);
    throw error;
  }
}

export async function insert_user(name, email, password) {
  try {
      const [maxIdResult] = await pool.query("SELECT MAX(UserID) AS maxId FROM user");
      const maxId = maxIdResult[0].maxId || 130; 
      const newUserId = maxId + 1;
      const query = "INSERT INTO user (UserID, name, email, password) VALUES (?, ?, ?, ?)";
      const [result] = await pool.query(query, [newUserId, name, email, password]);

      return result;
  } catch (error) {
      console.error('Error inserting user:', error);
      throw error;
  }
}