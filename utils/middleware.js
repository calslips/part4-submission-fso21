const jwt = require('jsonwebtoken');
const User = require('../models/user');
const morgan = require('morgan');

morgan.token('body', (req) => JSON.stringify(req.body));
const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms :body');

const retrieveToken = (req, res, next) => {
  const auth = req.headers['authorization'];

  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    req.token = auth.split(' ')[1];
  } else {
    req.token = null;
  }

  next();
};

const retrieveUser = async (req, res, next) => {
  const decodedToken = jwt.verify(req.token, process.env.SECRET);
  req.user = await User.findById(decodedToken.id);

  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Unknown endpoint' });
};

const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(err.message);
  }

  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'invalid id format' });
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  } else if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'invalid token' });
  } else if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'token expired' });
  }

  next(err);
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  retrieveToken,
  retrieveUser
};
