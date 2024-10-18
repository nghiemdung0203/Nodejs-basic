const request = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const userRouter = require("../../routers/userRouter");
const { connect, disconnect, clearDatabase } = require("../test-setup");
const User = require("../../Model/User");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use("/api", userRouter);

beforeAll(async () => {
  await connect();
});

afterAll(async () => {
  await disconnect();
});

beforeEach(async () => {
  await clearDatabase();
});

describe("Create user api", () => {
  let user;
  it("should create a new user", async () => {
    const newUser = {
      name: "John Doe",
      age: 25,
      email: "john@example.com",
      password: "@Password123456",
    };

    const response = await request(app)
      .post("/api/createUser")
      .send(newUser)
      .expect(201);

    // If the test fails, log the response body
    if (response.status !== 201) {
      console.error("Response body:", response.body);
    }
    user = response.body.user;
    expect(response.body.user).toBeDefined();
    expect(response.body.user.name).toBe(newUser.name);
    expect(response.body.user.email).toBe(newUser.email);
    expect(response.body.token).toBeDefined();

    // Verify that the user was actually saved in the database
    const savedUser = await mongoose
      .model("User")
      .findOne({ email: newUser.email });
    expect(savedUser).toBeDefined();
    expect(savedUser.name).toBe(newUser.name);
  });

  it("should return 500 if user creation fails", async () => {
    const invalidUser = {
      name: "John Doe",
      // Missing email and password
    };

    const response = await request(app)
      .post("/api/createUser")
      .send(invalidUser)
      .expect(500);

    expect(response.body.error).toBeDefined();
  });
});

describe("getUserList api", () => {
  beforeEach(async () => {
    // Create some test users
    const users = [
      {
        name: "User 1",
        email: "user1@example.com",
        password: "@Password123456",
        age: 25,
      },
      {
        name: "User 2",
        email: "user2@example.com",
        password: "@Password123456",
        age: 30,
      },
      {
        name: "User 3",
        email: "user3@example.com",
        password: "@Password123456",
        age: 35,
      },
    ];

    await User.insertMany(users);
  });

  it("should return a list of users with pagination", async () => {
    const response = await request(app)
      .get("/api/getUserList")
      .query({ page: 1, limit: 2 })
      .expect(200);

    expect(response.body).toHaveProperty("totalUser", 3);
    expect(response.body).toHaveProperty("currentPage", 1);
    expect(response.body).toHaveProperty("totalPages", 2);
    expect(response.body).toHaveProperty("userList");
    expect(response.body.userList).toHaveLength(2);

    // Check the structure of returned users
    response.body.userList.forEach((user) => {
      expect(user).toHaveProperty("_id");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("age");
      // Ensure password is not returned
      expect(user).not.toHaveProperty("password");
    });
  });

  it("should use default pagination if not provided", async () => {
    const response = await request(app).get("/api/getUserList").expect(200);

    expect(response.body).toHaveProperty("totalUser", 3);
    expect(response.body).toHaveProperty("currentPage", 1);
    expect(response.body).toHaveProperty("totalPages", 1);
    expect(response.body).toHaveProperty("userList");
    expect(response.body.userList).toHaveLength(3); // Assuming default limit is 10
  });

  it("should return the second page of users", async () => {
    const response = await request(app)
      .get("/api/getUserList")
      .query({ page: 2, limit: 2 })
      .expect(200);

    expect(response.body).toHaveProperty("totalUser", 3);
    expect(response.body).toHaveProperty("currentPage", 2);
    expect(response.body).toHaveProperty("totalPages", 2);
    expect(response.body).toHaveProperty("userList");
    expect(response.body.userList).toHaveLength(1);
  });
});

describe("getUser API", () => {
  let user;
  let token;

  beforeEach(async () => {
    // Create a test user
    user = new User({
      name: "Test User",
      email: "test@example.com",
      password: "@Password123456",
      age: 30,
    });
    await user.save();

    // Generate a token for the user
    token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
  });
  it("should return user data when authenticated", async () => {
    const response = await request(app)
      .get("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .expect(201);

    expect(response.body).toHaveProperty("_id", user._id.toString());
    expect(response.body).toHaveProperty("name", "Test User");
    expect(response.body).toHaveProperty("email", "test@example.com");
    expect(response.body).toHaveProperty("age", 30);
    expect(response.body).not.toHaveProperty("password");
  });

  it("should return 401 when no token is provided", async () => {
    const response = await request(app).get("/api/user").expect(401);

    expect(response.body).toHaveProperty(
      "error",
      "No token provided, authorization denied."
    );
  });

  it("should return 401 when an invalid token is provided", async () => {
    const response = await request(app)
      .get("/api/user")
      .set("Authorization", "Bearer invalidtoken")
      .expect(401);

    expect(response.body).toHaveProperty(
      "error",
      "Not authorized to access this resource."
    );
  });

  it("should return 401 when user is not found", async () => {
    // Delete the user to simulate a scenario where the user is not found
    await User.findByIdAndDelete(user._id);

    const response = await request(app)
      .get("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .expect(401);

    expect(response.body).toHaveProperty(
      "error",
      "Not authorized to access this resource."
    );
  });
});

describe("updateUser API", () => {
  let user;
  let token;

  beforeEach(async () => {
    // Create a test user
    user = new User({
      name: "Test User",
      email: "test@example.com",
      password: "@Password123456",
      age: 30,
    });
    await user.save();

    // Generate a token for the user
    token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
  });

  it("should update user data when authenticated", async () => {
    const updatedData = {
      name: "Updated User",
      age: 31,
    };

    const response = await request(app)
      .put("/api/updateUser")
      .set("Authorization", `Bearer ${token}`)
      .send(updatedData)
      .expect(200);

    expect(response.body).toHaveProperty("_id", user._id.toString());
    expect(response.body).toHaveProperty("name", "Updated User");
    expect(response.body).toHaveProperty("age", 31);
    expect(response.body).toHaveProperty("email", "test@example.com");
    expect(response.body).not.toHaveProperty("password");

    // Verify that the user was actually updated in the database
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.name).toBe("Updated User");
    expect(updatedUser.age).toBe(31);
  });

  it("should return 401 when no token is provided", async () => {
    const updatedData = {
      name: "Updated User",
      age: 31,
    };

    const response = await request(app)
      .put("/api/updateUser")
      .send(updatedData)
      .expect(401);

    expect(response.body).toHaveProperty(
      "error",
      "No token provided, authorization denied."
    );
  });

  it("should return 401 when an invalid token is provided", async () => {
    const updatedData = {
      name: "Updated User",
      age: 31,
    };

    const response = await request(app)
      .put("/api/updateUser")
      .set("Authorization", "Bearer invalidtoken")
      .send(updatedData)
      .expect(401);

    expect(response.body).toHaveProperty(
      "error",
      "Not authorized to access this resource."
    );
  });

  it("should return 400 when invalid data is provided", async () => {
    const invalidData = {
      name: "", // Empty name should be invalid
      age: "not a number", // Age should be a number
    };

    const response = await request(app)
      .put("/api/updateUser")
      .set("Authorization", `Bearer ${token}`)
      .send(invalidData)
      .expect(400);

    expect(response.body).toHaveProperty("error");
  });
});

describe("delete user api", () => {
  let user;
  let token;

  beforeEach(async () => {
    // Create a test user
    user = new User({
      name: "Delete User",
      email: "deleteuser@example.com",
      password: "@Password123456",
      age: 30,
    });
    await user.save();

    // Generate a token for the user
    token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({ token });
    await user.save();
  });

  it("should delete user when authenticated", async () => {
    const response = await request(app)
      .delete(`/api/deleteUser/${user._id}`)
      .expect(200);

    expect(response.body).toHaveProperty("message", "User deleted");

    // Verify that the user has been removed from the database
    const deletedUser = await User.findById(user._id);
    expect(deletedUser).toBeNull(); // User should be null after deletion
  });
});
