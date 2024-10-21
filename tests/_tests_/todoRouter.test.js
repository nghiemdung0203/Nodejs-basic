const request = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const todoRouter = require("../../routers/todoRouter");
const { connect, disconnect, clearDatabase } = require("../test-setup");
const Todo = require("../../Model/Todo");
const jwt = require("jsonwebtoken");
const User = require("../../Model/User");
const redisClient = require("../../redis");
const { MongoMemoryServer } = require("mongodb-memory-server");

const app = express();
app.use(express.json());
app.use("/api", todoRouter);
jest.mock("../../redis", () => ({
  get: jest.fn(),
  setEx: jest.fn(),
}));

beforeAll(async () => {
  await connect();
  let testUser;
  let token;
  let todoId
});

afterAll(async () => {
  jest.clearAllMocks();
  await disconnect();
});


describe("createTodo api", () => {

  beforeAll(async () => {
    const user = new User({
      name: "Shawn Doe",
      age: 20,
      email: "john.doe@example.com",
      password: "@Password123456",
    });
    await user.save();
    
    testUser = user
    token = jwt.sign({ _id: testUser._id }, process.env.JWT_SECRET);
    testUser.tokens = testUser.tokens.concat({ token });
    
  });

  it("should create a new todo when authenticated", async () => {
    const response = await request(app)
      .post("/api/createTodo")
      .set("Authorization", `Bearer ${token}`)
      .send({
        description: "Test todo",
        dueDate: new Date().toISOString(),
      });
      todoId = response.body._id
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.description).toBe("Test todo");
    expect(response.body.completed).toBe(false);
    expect(response.body.user).toBe(testUser._id.toString());

    // Verify the todo was saved in the database
    const todo = await Todo.findById(response.body._id);
    expect(todo).not.toBeNull();
  });

  it("should return 401 if no token is provided", async () => {
    const response = await request(app).post("/api/createTodo").send({
      description: "Unauthorized todo",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "No token provided, authorization denied.",
    });
  });

  it("should return 401 if an invalid token is provided", async () => {
    const response = await request(app)
      .post("/api/createTodo")
      .set("Authorization", "Bearer invalidtoken")
      .send({
        description: "Invalid token todo",
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("jwt malformed");
  });

  it("should return 400 if missing description", async () => {
    const response = await request(app)
      .post("/api/createTodo")
      .set("Authorization", `Bearer ${token}`)
      .send({
        // Missing required 'description' field
        dueDate: new Date().toISOString(),
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Description is required.");
  });
});

describe("getTodo api", () => {

  beforeEach(async () => {

    const todos = [
      {
        description: "Test todo 1",
        dueDate: new Date().toISOString(),
        completed: false,
        user: testUser._id,
      },
      {
        description: "Test todo 2",
        dueDate: new Date().toISOString(),
        completed: false,
        user: testUser._id,
      },
    ];
    await Todo.insertMany(todos);
  });

  it("should get all todos for authenticated user", async () => {
    const response = await request(app)
      .get("/api/getTodoList")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.data.todos.length).toBe(3); // 2 todos were created for this user
    expect(response.body.data.todos[1].description).toBe("Test todo 1");
    expect(response.body.data.todos[2].description).toBe("Test todo 2");
  });

  it("should return 401 if no token is provided", async () => {
    const response = await request(app).get("/api/getTodoList");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe(
      "No token provided, authorization denied."
    );
  });

  it("should return 401 if an invalid token is provided", async () => {
    const response = await request(app)
      .get("/api/getTodoList")
      .set("Authorization", "Bearer invalidtoken");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("jwt malformed");
  });
});

describe("updateTodo api", () => {

  it("should update a todo when authenticated", async () => {
    const updateData = {
      todoId,
      description: "Updated todo description",
      completed: true,
      dueDate: new Date().toISOString(),
    };

    const response = await request(app)
      .put("/api/updateTodo")
      .set("Authorization", `Bearer ${token}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.description).toBe("Updated todo description");
    expect(response.body.completed).toBe(true);

    // Verify that the todo was updated in the database
    const updatedTodo = await Todo.findById(todoId);
    expect(updatedTodo.description).toBe("Updated todo description");
    expect(updatedTodo.completed).toBe(true);
  });

  it("should return 404 if todo is not found", async () => {
    const nonExistentTodoId = new mongoose.Types.ObjectId(); // Generate a random valid ObjectId

    const updateData = {
      todoId: nonExistentTodoId,
      description: "Non-existent todo",
      completed: true,
      dueDate: new Date().toISOString(),
    };

    const response = await request(app)
      .put("/api/updateTodo")
      .set("Authorization", `Bearer ${token}`)
      .send(updateData);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Todo not found" });
  });

  it("should return 401 if no token is provided", async () => {
    const updateData = {
      todoId,
      description: "Test todo",
      completed: false,
      dueDate: new Date().toISOString(),
    };

    const response = await request(app).put("/api/updateTodo").send(updateData);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "No token provided, authorization denied.",
    });
  });

  it("should return 401 if an invalid token is provided", async () => {
    const updateData = {
      todoId,
      description: "Test todo",
      completed: false,
      dueDate: new Date().toISOString(),
    };

    const response = await request(app)
      .put("/api/updateTodo")
      .set("Authorization", "Bearer invalidtoken")
      .send(updateData);

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("jwt malformed");
  });
});

describe("deleteTodo api", () => {

  it("should delete a todo when authenticated", async () => {
    const response = await request(app)
      .delete("/api/deleteTodo")
      .set("Authorization", `Bearer ${token}`)
      .send({
        todoId,
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Todo deleted successfully");
    expect(response.body.deletedTodo).toHaveProperty("_id");

    // Verify that the todo was removed from the database
    const deletedTodo = await Todo.findById(todoId);
    expect(deletedTodo).toBeNull();
  });

  it("should return 404 if todo is not found", async () => {
    const nonExistentTodoId = new mongoose.Types.ObjectId(); // Generate a random valid ObjectId

    const response = await request(app)
      .delete("/api/deleteTodo")
      .set("Authorization", `Bearer ${token}`)
      .send({
        todoId: nonExistentTodoId,
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Todo not found");
  });

  it("should return 400 if todoId is invalid", async () => {
    const invalidTodoId = "invalid-id";

    const response = await request(app)
      .delete("/api/deleteTodo")
      .set("Authorization", `Bearer ${token}`)
      .send({
        todoId: invalidTodoId,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Invalid todo ID format.");
  });

  it("should return 401 if no token is provided", async () => {
    const response = await request(app)
      .delete("/api/deleteTodo")
      .send({
        todoId,
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("No token provided, authorization denied.");
  });

  it("should return 401 if an invalid token is provided", async () => {
    const response = await request(app)
      .delete("/api/deleteTodo")
      .set("Authorization", "Bearer invalidtoken")
      .send({
        todoId,
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("jwt malformed");
  });
});

