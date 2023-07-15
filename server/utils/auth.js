// //starter coded
// const jwt = require('jsonwebtoken');

// // set token secret and expiration date
// const secret = 'mysecretsshhhhh';
// const expiration = '2h';

// module.exports = {
//   // function for our authenticated routes
//   authMiddleware: function (req, res, next) {
//     // allows token to be sent via  req.query or headers
//     let token = req.query.token || req.headers.authorization;

//     // ["Bearer", "<tokenvalue>"]
//     if (req.headers.authorization) {
//       token = token.split(' ').pop().trim();
//     }

//     if (!token) {
//       return res.status(400).json({ message: 'You have no token!' });
//     }

//     // verify token and get user data out of it
//     try {
//       const { data } = jwt.verify(token, secret, { maxAge: expiration });
//       req.user = data;
//     } catch {
//       console.log('Invalid token');
//       return res.status(400).json({ message: 'invalid token!' });
//     }

//     // send to next endpoint
//     next();
//   },
//   signToken: function ({ username, email, _id }) {
//     const payload = { username, email, _id };

//     return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
//   },
// };

const jwt = require('jsonwebtoken');

const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  authMiddleware: function (context) {
    let token = context.req.query.token || context.req.headers.authorization;

    if (context.req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      throw new Error('You have no token!');
    }

    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      context.user = data;
    } catch {
      console.log('Invalid token');
      throw new Error('Invalid token!');
    }
  },
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
