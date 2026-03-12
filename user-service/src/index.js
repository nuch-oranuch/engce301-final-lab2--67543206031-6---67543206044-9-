require('dotenv').config();
const express = require('express');
const cors = require('cors');
const usersRouter = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', usersRouter);

app.listen(PORT, () => {
  console.log(`[task-service] Running on port ${PORT}`);
});