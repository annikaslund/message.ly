const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const SECRET = "ASDADHWWKD";
const ExpressError = require("../expressError");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async function(req, res, next){
    try {
        let { username, password } = req.body;
        if (await User.authenticate(username, password)) {
            let token = jwt.sign({ username }, SECRET);
            User.updateLoginTimestamp(username)
            return res.json({token});
        } else {
            throw new ExpressError("Invalid credentials", 400);
        }
    } catch (err) {
        return next(err);
    }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

 router.post("/register", async function(req, res, next){
    try {
        let { username, password, first_name, last_name, phone } = req.body;
        let newUser = await User.register({username, password, first_name, last_name, phone});
        let token = jwt.sign({ username: newUser.username }, SECRET);
        return res.json({token});
    } catch (err) {
        return next(err);
    }
 })

 module.exports = router;