/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const db = require("../db");
const { SECRET_KEY } = require("../config");

/** Middleware: Authenticate user. */

function authenticateJWT(req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    req.user = payload; // create a current user
    return next();
  } catch (err) {
    return next();
  }
}
// end

/** Middleware: Requires user is authenticated. */

function ensureLoggedIn(req, res, next) {
  debugger;
  if (!req.user) {
    return next({ status: 401, message: "Unauthorized" });
  } else {
    return next();
  }
}

// end

/** Middleware: Requires correct username. */

function ensureCorrectUser(req, res, next) {
  try {
    if (req.user.username === req.params.username) {
      return next();
    } else {
      return next({ status: 401, message: "Unauthorized" });
    }
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized" });
  }
}

async function ensureCorrectUserInMessage(req, res, next) {
  try {
    const msgID = req.params.id;
    const msgInfo = await db.query(`SELECT from_username, to_username FROM messages WHERE id = $1`, [msgID]);

    if (!msgInfo.rows[0]) {
      return next({ status: 404, message: "Message not found."});
    }

    let from_username = msgInfo.rows[0].from_username;
    let to_username = msgInfo.rows[0].to_username;

    if ((req.user.username === from_username) || (req.user.username === to_username)) {
      return next();

    } else {
      return next({ status: 401, message: "Unauthorized" });
    }
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: err.status || 401, message: err.message || "Unauthorized" });
  }
}

// end

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
  ensureCorrectUserInMessage
};
