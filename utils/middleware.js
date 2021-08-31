const morgan = require('morgan');

morgan.token('body', (req) => JSON.stringify(req.body));
const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms :body');

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Unknown endpoint' });
};

module.exports = {
  requestLogger,
  unknownEndpoint
};
