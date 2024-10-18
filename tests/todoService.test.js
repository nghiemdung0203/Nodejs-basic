const mongoose = require("mongoose");
const { connect, disconnect, clearDatabase } = require("./test-setup");
const createTodoService = require("../service/Todo/createTodoService");
const Todo = require("../Model/Todo");
const getTodoService = require("../service/Todo/getTodoService");
const updateTodoService = require("../service/Todo/updateTodoService");
const deleteTodoService = require("../service/Todo/deleteTodoService");

jest.mock("../middleware/validation/userValidation.js"); // Mock validation schema
beforeAll(async () => {
  await connect();
});

afterAll(async () => {
  await disconnect();
});

afterEach(async () => {
  await clearDatabase();
});

describe("CreateTodo service", () => {
  it("should create a new todo when valid input is provided", async () => {
    const req = {
      user: { _id: new mongoose.Types.ObjectId() }, // Mock the user data
      body: {
        description: "Finish the project",
        dueDate: "2024-10-31T00:00:00.000Z",
      },
    };

    const result = await createTodoService(req);

    expect(result.description).toBe(req.body.description);
    expect(result.completed).toBe(false); // By default, todos are not completed
    expect(result.dueDate.toISOString()).toBe(req.body.dueDate);

    // Check if the todo is actually saved in the database
    const savedTodo = await Todo.findById(result._id);
    expect(savedTodo).not.toBeNull();
    expect(savedTodo.description).toBe(req.body.description);
    expect(savedTodo.dueDate.toISOString()).toBe(req.body.dueDate);
  });

  it("should throw an error if validation fails", async () => {
    const req = {
      user: { _id: new mongoose.Types.ObjectId() }, // Mock the user data
      body: {
        description: "", // Invalid description (empty string)
        dueDate: "2024-10-31T00:00:00.000Z",
      },
    };

    await expect(createTodoService(req)).rejects.toThrow(
      "Description is required"
    ); // Based on validation schema
  });

  it("should assign the current date if dueDate is not provided", async () => {
    const req = {
      user: { _id: new mongoose.Types.ObjectId() }, // Mock the user data
      body: {
        description: "Learn Node.js",
      },
    };

    const result = await createTodoService(req);

    expect(result.description).toBe(req.body.description);
    expect(result.completed).toBe(false); // Default value
    expect(result.dueDate).toBeDefined(); // Should be assigned the current date

    // Check if it's close to the current time (with some margin)
    const now = new Date();
    expect(result.dueDate.getTime()).toBeCloseTo(now.getTime(), -10000); // 10 seconds margin
  });
});

describe("getTodoService", () => {
  it("should return a paginated list of todos", async () => {
    const userId = new mongoose.Types.ObjectId();

    // Create dummy todos
    await Todo.insertMany([
      { user: userId, description: "Todo 1", completed: false },
      { user: userId, description: "Todo 2", completed: false },
      { user: userId, description: "Todo 3", completed: false },
    ]);

    const req = {
      user: { _id: userId },
      query: { page: 1, limit: 2 }, // Pagination parameters
    };

    const result = await getTodoService(req);

    expect(result.todos.length).toBe(2);
    expect(result.totalTodos).toBe(3);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(2);
  });

  it("should throw an error if pagination parameters are invalid", async () => {
    const req = {
      user: { _id: new mongoose.Types.ObjectId() },
      query: { page: "invalid", limit: 2 }, // Invalid page value
    };

    await expect(getTodoService(req)).rejects.toThrow("must be a number");
  });
});

describe("updateUserService", () => {
  it("should update the todo when valid input is provided", async () => {
    // Create a dummy todo for testing
    const userId = new mongoose.Types.ObjectId();
    const todo = new Todo({
      user: userId,
      description: "Initial description",
      completed: false,
      dueDate: new Date("2024-10-31"),
    });

    await todo.save(); // Save the initial todo

    const req = {
      user: { _id: userId }, // Mock the user data
      body: {
        todoId: todo._id.toString(),
        description: "Updated description",
        completed: true,
        dueDate: "2024-11-01T00:00:00.000Z",
      },
    };

    const result = await updateTodoService(req);

    expect(result.description).toBe(req.body.description);
    expect(result.completed).toBe(req.body.completed);
    expect(result.dueDate.toISOString()).toBe(req.body.dueDate);

    // Check if the todo is actually updated in the database
    const updatedTodo = await Todo.findById(todo._id);
    expect(updatedTodo).not.toBeNull();
    expect(updatedTodo.description).toBe(req.body.description);
    expect(updatedTodo.completed).toBe(req.body.completed);
    expect(updatedTodo.dueDate.toISOString()).toBe(req.body.dueDate);
  });
  it("should throw an error if todo is not found", async () => {
    const userId = new mongoose.Types.ObjectId();
    const req = {
      user: { _id: userId },
      body: {
        todoId: new mongoose.Types.ObjectId().toString(), // Random ID, todo not present
        description: "Non-existent todo",
        completed: true,
        dueDate: "2024-11-01T00:00:00.000Z",
      },
    };

    await expect(updateTodoService(req)).rejects.toThrow("Todo not found");
  });
});

describe("deleteTodoService", () => {
  it("should delete the todo when valid input is provided", async () => {
    // Create a dummy todo for testing
    const userId = new mongoose.Types.ObjectId();
    const todo = new Todo({
      user: userId,
      description: "Test Todo for deletion",
      completed: false,
      dueDate: new Date("2024-10-31"),
    });

    await todo.save(); // Save the todo to the database

    const req = {
      user: { _id: userId }, // Mock the user
      body: { todoId: todo._id.toString() }, // Todo ID to delete
    };

    const result = await deleteTodoService(req);

    expect(result._id.toString()).toBe(todo._id.toString()); // Check if the correct todo was deleted
    expect(result.description).toBe("Test Todo for deletion"); // Ensure correct todo was returned
    expect(await Todo.findById(todo._id)).toBeNull(); // Verify the todo is deleted from DB
  });
  it("should throw an error if todo is not found", async () => {
    const userId = new mongoose.Types.ObjectId();
    const req = {
      user: { _id: userId },
      body: { todoId: new mongoose.Types.ObjectId().toString() }, // Non-existent todoId
    };

    await expect(deleteTodoService(req)).rejects.toThrow("Todo not found");
  });
  it("should throw a validation error for invalid todoId", async () => {
    const userId = new mongoose.Types.ObjectId();
    const req = {
      user: { _id: userId },
      body: { todoId: "invalidTodoId" }, // Invalid todoId format
    };

    await expect(deleteTodoService(req)).rejects.toThrow(
      "Invalid todo ID format."
    ); // Validation error message from Joi
  });

  it("should throw a validation error for invalid userId", async () => {
    const invalidUserId = "invalidUserId";
    const req = {
      user: { _id: invalidUserId }, // Invalid userId format
      body: { todoId: new mongoose.Types.ObjectId().toString() },
    };

    await expect(deleteTodoService(req)).rejects.toThrow(
      "Invalid user ID format."
    ); // Validation error message from Joi
  });
});
