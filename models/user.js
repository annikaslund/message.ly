/** User class for message.ly */
const db = require("../db");
const bcrypt = require("bcrypt");


/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    let hashedPW = bcrypt.hash(password, 10);
    const newUser = await db.query(`INSERT INTO users (username, password, first_name, last_name, phone)
              VALUES ($1, $2, $3, $4, $5)
              RETURNING username, password, first_name, last_name, phone`,
              [username, hashedPW, first_name, last_name, phone]);  
              
    return newUser;
   }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    // let hashedPW = bcrypt.hash(password, 10); // not perm
    // console.log("@@@@@@@@@@hashed: ", hashedPW);  // not perm
    const result = await db.query(`SELECT password
                           FROM users
                           WHERE username = $1`,
                           [username]);
    const user = result.rows[0];

    if (user){
      return await bcrypt.compare(password, user.password);
    } 
    return false;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() { }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) { }
}


module.exports = User;