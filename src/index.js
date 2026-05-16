const app = require('./app');
const { pool } = require('./shared/config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Check DB connection
    await pool.query('SELECT NOW()');
    console.log('Database connection established successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
