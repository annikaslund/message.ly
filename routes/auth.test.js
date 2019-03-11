process.env.NODE_ENV = "test";

const routes = require('./auth')
const app = require("../app");

const db = require("../db");
const request = require("supertest");

const bcrypt = require("bcrypt");

let auth = {};

beforeEach(async () => {
    const hashedPassword = await bcrypt.hash("secret", 1);
    const response = await db.query(`
        INSERT INTO users (username, password, first_name, last_name, phone, join_at)
        VALUES ($1, $2, $3, $4, $5, current_timestamp)`,
        ['test', hashedPassword, 'Jane', 'Doe', '1234567890']);

        auth.current_user_id = 'test';  // might delete later
});

describe("POST /auth/register", function(){
    test("Registers new user (everything goes right)", async function(){
        const response = await request(app)
            .post("/auth/register").send({
                username: "test2",
                password: "testing2",
                first_name: "John",
                last_name: "Doe",
                phone: "6781928934"
            });
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({"token": response.body.token});
    })

    test("Registers new user (taken username)", async function(){
        const response = await request(app)
            .post("/auth/register").send({
                username: "test",
                password: "testing2",
                first_name: "John",
                last_name: "Doe",
                phone: "6781928934"
            })
        expect(response.statusCode).toEqual(409);
    })
    
    test("Registers new user (no password)", async function(){
        const response = await request(app)
            .post("/auth/register").send({
                username: "test",
                first_name: "John",
                last_name: "Doe",
                phone: "6781928934"
            })
        expect(response.statusCode).toEqual(409);
    })
})

afterEach(async () => {
    await db.query(`DELETE FROM users`);
  });
  
  afterAll(async function() {
      // close db connection
      await db.end();
  });