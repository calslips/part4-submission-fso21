const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const User = require('../models/user');

loginRouter.post('/', async (request, response) => {
  const user = await User.findOne({ username: request.body.username });
  const validPassword = user
    ? await bcrypt.compare(request.body.password, user.passwordHash)
    : false;

  if (!user || !validPassword)  {
    return response.status(401).json({ error: 'invalid username or password' });
  }

  const tokenPayload = {
    username: user.username,
    id: user._id
  };

  const token = jwt.sign(
    tokenPayload,
    process.env.SECRET,
    { expiresIn: 60*60 }
  );

  response.status(200).send({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;
