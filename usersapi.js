const express = require('express');

const router = express.Router();
const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');
const users = require('./users');

const {
  JWT_SECRET: jwtSecret,
  TOKEN_LIFETIME: tokenLifetime = 86400,
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

passport.use(new Strategy(jwtOptions, strat));

router.use(passport.initialize());


// JWT_SECRET=$dk3Ae9dknv#Gposiuhvkjkljd
async function loginRoute(req, res) {
  const { username, password } = req.body;

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
  return passport.authenticate(
    'jwt',
    { session: false },
    (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        const error = info.name === 'TokenExpiredError' ? 'expired token' : 'invalid token';
        return res.status(401).json({ error });
      }

      req.user = user;
      return next();
    },
  )(req, res, next);
}

// hér væri hægt að bæta við enn frekari (og betri) staðfestingu á gögnum
async function validateUser(username, password) {
  if (typeof username !== 'string' || username.length < 2) {
    return 'Notendanafn verður að vera amk 2 stafir';
  }

  const user = await users.findByUsername(username);

  if (user) {
    return 'Notendanafn er þegar skráð';
  }

  if (typeof password !== 'string' || password.length < 6) {
    return 'Lykilorð verður að vera amk 6 stafir';
  }

  return null;
}


async function register(req, res) {
  const { username, password, name } = req.body;

  const validationMessage = await validateUser(username, password);

  if (validationMessage) {
    return res.status(401).json({ validationMessage });
  }

  const result = await users.createUser(username, password, name);

  return res.status(200).json({ result });
  // ég átti mig ekki alveg á því, er þetta eitthvað sem við þurfum
  // næsta middleware mun sjá um að skrá notanda inn því hann verður til
  // og `username` og `password` verða ennþá sett sem rétt í `req`
  // next();
}

async function usersRoute(req, res) {
  const result = await users.getUsers();

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

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

router.post(
  '/register',
  catchErrors(register),
  passport.authenticate('local', {
    failureRedirect: '/register',
  }),
);
router.post('/login', catchErrors(loginRoute));
router.get('/users', requireAuthentication, catchErrors(usersRoute));
router.get('/users/me', requireAuthentication, catchErrors(userMeRoute));
router.get('/users/:id', requireAuthentication, catchErrors(userRoute));
router.patch('/users/me', requireAuthentication, catchErrors(userMePatchRoute));

module.exports = router;
