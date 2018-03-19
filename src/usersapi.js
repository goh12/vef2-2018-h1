const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const users = require('./users');
const { uploadImage } = require('./cloudinary_controller');


const upload = multer({ dest: 'uploads/' });
const router = express.Router();


const {
  JWT_SECRET: jwtSecret,
  TOKEN_LIFETIME: tokenLifetime = 86400 * 5,
} = process.env;

if (!jwtSecret) {
  console.error('JWT_SECRET not registered in .env');
  process.exit(1);
}

router.use(express.json());

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

async function strat(data, next) {
  const user = await users.findById(data.id);

  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
}

function authenticate(req, res, next) {
  return passport.authenticate(
    'jwt',
    { session: false },
    (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        const error = info.name === 'TokenExpiredError' ? 'expired token' : 'invalid token';
        req.unauthenticatedError = error;
        req.authenticated = false;
        return next();
      }

      req.user = user;
      req.authenticated = true;
      return next();
    },
  )(req, res, next);
}

passport.use(new Strategy(jwtOptions, strat));

router.use(passport.initialize());
router.use(authenticate);

// JWT_SECRET=$dk3Ae9dknv#Gposiuhvkjkljd
async function loginRoute(req, res) {
  const { username, password } = req.body;
  if (!username || username.length < 1) return res.status(400).json({ username: 'Username can not be the empty string' });
  if (!password || password.length < 1) return res.status(400).json({ password: 'Password can not be the empty string' });

  const user = await users.findByUsername(username);
  if (!user) {
    return res.status(401).json({ error: 'No such user' });
  }
  const passwordIsCorrect = await users.comparePasswords(password, user.password);

  if (passwordIsCorrect) {
    const payload = { id: user.id };
    const tokenOptions = { expiresIn: tokenLifetime };
    const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
    return res.json({ token });
  }

  return res.status(401).json({ error: 'Invalid password' });
}

function requireAuthentication(req, res, next) {
  if (!req.authenticated) {
    return res.status(401).json({ error: req.unauthenticatedError });
  }
  return next();
}


async function validateUser(username, password, name) {
  const errors = [];
  if (typeof username !== 'string' || username.length < 2) {
    errors.push({
      field: 'username',
      message: 'username verður að vera amk 2 stafir',
    });
  }

  const user = await users.findByUsername(username);

  if (user) {
    errors.push({
      field: 'username',
      message: 'Username is required and must be at least three letters',
    });
  }

  if (typeof password !== 'string' || password.length < 6) {
    errors.push({
      field: 'password',
      message: 'Password must be at least six letters',
    });
  }

  if (typeof name !== 'string' || name.length < 1) {
    errors.push({
      field: 'name',
      message: 'Name is required and must not be empty',
    });
  }

  return errors;
}


async function register(req, res) {
  const { username, password, name } = req.body;

  const validationMessage = await validateUser(username, password, name);

  if (validationMessage.length > 0) {
    return res.status(401).json({ errors: validationMessage });
  }

  const result = await users.createUser(username, password, name);

  return res.status(200).json({ result });
}

async function usersRoute(req, res) {
  const limit = req.get('paginglimit') || 10;
  const offset = req.get('pagingoffset') || 0;

  const result = await users.getUsers(limit, offset);

  return res.status(200).json({ result });
}

async function userRoute(req, res) {
  const { id } = req.params;
  const result = await users.findById(id);

  if (!result) {
    return res.status(404).json({ error: 'No user found by that id' });
  }
  return res.status(200).json({ result });
}

async function userMeRoute(req, res) {
  const { user } = req;
  return res.status(200).json({ user });
}

async function userMePatchRoute(req, res) {
  const { user } = req;
  const { name, password } = req.body;
  const result = await users.updateUser(user.id, name, password);

  return res.status(200).json({ result });
}

async function userNewRead(req, res) {
  const { user } = req;
  const { bookid, userrating, userreview } = req.body;
  const result = await users.addUserRead(user.id, bookid, userrating, userreview);
  if (result.errors) res.status(400).json(result);
  return res.status(200).json({ result });
}

async function userGetRead(req, res) {
  const { user } = req;
  const limit = req.get('paginglimit') || 10;
  const offset = req.get('pagingoffset') || 0;

  const result = await users.getUserRead(user.id, limit, offset);

  if (!result.length) {
    return res.status(200).json({ result: 'No books read' });
  }

  return res.status(200).json({ result });
}

async function userIdGetRead(req, res) {
  const { id } = req.params;
  const limit = req.get('paginglimit') || 10;
  const offset = req.get('pagingoffset') || 0;

  const result = await users.getUserRead(id, limit, offset);

  if (!result) {
    return res.status(404).json({ error: 'No user found by that id' });
  }
  return res.status(200).json({ result });
}

async function usersUploadImage(req, res) {
  const result = await uploadImage(req.file.path);
  if (!result) return res.status(400).json({ error: 'Failure uploading image' });

  const imgurl = await users.saveImageProfilePath(req.user.id, result);
  if (!imgurl) return res.status(400).json({ error: 'Failure saving image' });
  return res.status(200).json(imgurl);
}

async function userDelete(req, res) {
  const { id } = req.params;
  const { user } = req;

  const result = await users.userDeleteRead(id, user.id);

  if (result) {
    return res.status(200).json({ result: 'Book-reading successfully deleted' });
  }

  return res.status(400).json({ error: 'Failure deleting data' });
}

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

router.post('/register', catchErrors(register));
router.post('/login', catchErrors(loginRoute));
router.get('/users', requireAuthentication, catchErrors(usersRoute));
router.get('/users/me', requireAuthentication, catchErrors(userMeRoute));
router.patch('/users/me', requireAuthentication, catchErrors(userMePatchRoute));
router.post('/users/me/read', requireAuthentication, catchErrors(userNewRead));
router.get('/users/me/read', requireAuthentication, catchErrors(userGetRead));
router.delete('/users/me/read/:id', requireAuthentication, catchErrors(userDelete));
router.post('/users/me/profile', requireAuthentication, upload.single('profile'), catchErrors(usersUploadImage));
router.get('/users/:id', requireAuthentication, catchErrors(userRoute));
router.get('/users/:id/read', requireAuthentication, catchErrors(userIdGetRead));

module.exports = router;
