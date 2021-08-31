const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const blogsRouter = require('./controllers/blogs');
const morgan = require('morgan');

const mongoUrl = process.env.MONGODB_URI;
console.log('Connecting to', mongoUrl);

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB', error.message);
  });

app.use(cors());
app.use(express.json());
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.use('/api/blogs', blogsRouter);

module.exports = app;
