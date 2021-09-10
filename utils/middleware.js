const morgan = require('morgan');

morgan.token('body', (req) => JSON.stringify(req.body));
const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms :body');

const retrieveToken = (req, res, next) => {
  const auth = req.headers['authorization'];
  console.log('### auth header:', auth);
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    console.log('### coded token value:', auth.split(' ')[1]);
    req.token = auth.split(' ')[1];
  } else {
    req.token = null;
  }

  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Unknown endpoint' });
};

const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'invalid id format' });
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  } else if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'invalid token' });
  }

  next(err);
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  retrieveToken
};
