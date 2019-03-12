const express = require("express");
const router = new express.Router();
const Message = require("../models/message");
const jwt = require("jsonwebtoken");
const {SECRET_KEY} = require("../config");;
const ExpressError = require("../expressError");
const { ensureLoggedIn, ensureCorrectUser, ensureCorrectUserInMessage } = require("../middleware/auth");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

 router.get("/:id", ensureLoggedIn, ensureCorrectUserInMessage, async function(req, res, next){
     try {
        const msgID = req.params.id;
        const msgInfo = await Message.get(msgID);
        
        return res.json(msgInfo);
     } catch (err) {
         return next(err);
     }
 })

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

 router.post("/", ensureLoggedIn, async function(req, res, next){
    try {
        const { from_username, to_username, body } = req.body;

        if (from_username !== req.user.username){
            throw new ExpressError("Cannot post messages for other users", 401);
        } 

        let newMsg = await Message.create({ from_username, to_username, body });

        return res.json({ message: newMsg })

    } catch (err) {
        return next(err);
    }
 })

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

module.exports = router