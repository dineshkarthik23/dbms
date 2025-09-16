import express from 'express';
import session from 'express-session';
import path from 'path';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url'; 
import { get_all, get_t, get_t_by_id, get_user_by_email, insert_user } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/html/index.html'));
});

app.get('/movie.html', (req, res) => {
  if (req.session.userId) {
    res.sendFile(path.join(__dirname, '/html/movie.html'));
  } else {
    res.redirect('/');
  }
});

app.get('/get-user', (req, res) => {
  if (req.session.userId) {
      const user = {
          username: req.session.name, 
      };
      res.json(user);
  } else {
      res.json({});
  }
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
      const existingUsers = await get_user_by_email(email);
      if (existingUsers.length > 0) {
          return res.status(400).send('User with this email already exists.');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await insert_user(username, email, hashedPassword);

      const newUser = await get_user_by_email(email);
      if (!newUser[0]) {
          throw new Error('Failed to retrieve newly created user.');
      }
      req.session.userId = newUser[0].UserID;
      req.session.username = newUser[0].name; 
      req.session.email = newUser[0].Email;

      res.redirect('/html/movie.html');
  } catch (error) {
      console.error('Error during registration:', error.message, error.stack);
      res.status(500).send('An error occurred during registration.');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).send('Email and password are required.');
    }

    const rows = await get_user_by_email(email);
    if (rows.length > 0) {
      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.Password);

      if (isMatch) {
        req.session.userId = user.UserID;
        req.session.email = user.Email;
        res.redirect('/html/movie.html');
      } else {
        res.send('Invalid email or password.');
      }
    } else {
      res.send('Invalid email or password.');
    }
  } catch (error) {
    console.error('Error during login:', error.message, error.stack);
    res.status(500).send('An error occurred during login.');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).send('An error occurred during logout.');
    }
    res.redirect('/');
  });
});

app.get('/movies', async (req, res) => {
  try {
    const movies = await get_all();
    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies', details: error.message });
  }
});

app.get('/theaters', async (req, res) => {
  try {
    const theaters = await get_t_by_id();
    res.json(theaters);
  } catch (error) {
    console.error('Error fetching theaters:', error);
    res.status(500).json({ error: 'Failed to fetch theaters', details: error.message });
  }
});

/*app.get('/seats.html', (req, res) => {
  if (req.session.userId) {
    res.sendFile(path.join(__dirname, 'seats.html'));
  } else {
    res.redirect('/');
  }
});

/*app.get('/payment.html', (req, res) => {
  if (req.session.userId) {
    res.sendFile(path.join(__dirname, 'payment.html'));
  } else {
    res.redirect('/');
  }
});

app.get('/booking-success.html', (req, res) => {
  if (req.session.userId) {
    res.sendFile(path.join(__dirname, 'booking-success.html'));
  } else {
    res.redirect('/');
  }
});*/

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});