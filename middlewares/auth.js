const jwt = require('jsonwebtoken');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(token, process.env.NODE_ENV === 'production' ? process.env.SECRET_KEY : 'dev-secret');
  } catch (err) {
    err.statusCode = 401;
    err.message = 'Необходима авторизация';
    next(err);
  }
  req.user = payload;

  next();

};
