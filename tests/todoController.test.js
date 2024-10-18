const createTodo = require("../controllers/Todo/createTodo");
const getTodo = require("../controllers/Todo/getTodo");
const authenticate = require("../middleware/authenticate");
const { todoService } = require("../service/Todo/todoService");
const { connect, disconnect, clearDatabase } = require("./test-setup");
const redisClient = require("../redis");
const updateTodo = require("../controllers/Todo/updateTodo");
const deleteTodo = require("../controllers/Todo/deleteTodo");

jest.mock("../Model/Todo");
jest.mock("../middleware/authenticate");
jest.mock("../service/Todo/todoService.js");
jest.mock("../redis", () => ({
  setEx: jest.fn(), // Mock setEx function
}));

beforeAll(async () => {
  await connect();
});

afterAll(async () => {
  await disconnect();
});

afterEach(async () => {
  await clearDatabase();
  jest.clearAllMocks();
});

authenticate.mockImplementation((req, res, next) => {
  req.user = {
    _id: "123",
    name: "khanh",
    age: 18,
    email: "khanhnguyen@gmail.com",
    tokens: [{ token: "dummyToken" }],
  };
  req.token = "dummyToken";
  next();
});
describe("createTodoController", () => {
  it("should create a new Todo and return status 200", async () => {
    const req = {
      headers: {
        authorization: "Bearer test_token", // Mocked Bearer token
      },
      description: "Training at bh",
      dueDate: "10/09/2024",
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockResponse = {
      user: "123",
      description: "Training at bh",
      completed: false,
      dueDate: "10/09/2024",
      _id: "670f78939b407dacbae6c1dc",
      createdAt: "2024-10-16T08:25:55.673Z",
      __v: 0,
    };
    await authenticate(req, res, jest.fn());
    todoService.createTodoService.mockResolvedValue(mockResponse);
    await createTodo(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
    expect(todoService.createTodoService).toHaveBeenCalledWith(req);
  });

  it("should return status 400 if description is missing", async () => {
    const req = {
      headers: {
        authorization: "Bearer test_token",
      },
      body: {
        dueDate: "10/09/2024",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockError = {
      message: "Description is required",
    };

    todoService.createTodoService.mockRejectedValue(mockError);
    await authenticate(req, res, jest.fn());
    await createTodo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Description is required",
    }); // Adjust according to your error handling
  });
});

describe("getTodoList controller", () => {
  const req = {
    headers: {
      authorization: "Bearer test_token", // Mocked Bearer token
    },
    query: {
      page: 1,
      limit: 10,
    },
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  it("should retrieve todos successfully and return status 200", async () => {
    const mockTodos = [
      { _id: "1", description: "Todo 1", completed: false },
      { _id: "2", description: "Todo 2", completed: false },
    ];
    const totalTodos = 2;

    todoService.getTodoService.mockResolvedValue({
      todos: mockTodos,
      totalTodos,
      page: 1,
      limit: 10,
    });
    await authenticate(req, res, jest.fn());
    await getTodo(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      isCached: false,
      data: {
        todos: mockTodos,
        totalTodos,
        currentPage: 1,
        totalPages: Math.ceil(totalTodos / req.query.limit),
      },
    });
    expect(redisClient.setEx).toHaveBeenCalledWith(
      "todos",
      3600,
      JSON.stringify({
        todos: mockTodos,
        totalTodos,
        currentPage: 1,
        totalPages: Math.ceil(totalTodos / req.query.limit),
      })
    );
  });

  it("should return status 400 if pagination parameters are invalid", async () => {
    req.query.page = "invalid"; // Simulate invalid page parameter
    req.query.limit = "invalid"; // Simulate invalid limit parameter

    // Mock the error thrown during validation in the service
    todoService.getTodoService.mockImplementation(() => {
      throw new Error("Invalid pagination parameters");
    });
    await authenticate(req, res, jest.fn());
    await getTodo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid pagination parameters",
    });
  });
});

describe("updateTodo controller", () => {
  const req = {
    headers: {
      authorization: "Bearer test_token",
    },
    body: {
      todoId: "todoId123",
      description: "Updated description",
    },
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  it("should update a Todo successfully and return status 200", async () => {
    const mockUpdatedTodo = {
      _id: "todoId123",
      description: "Updated description",
      completed: false,
      dueDate: "10/09/2024",
      user: "123",
      createdAt: "2024-10-16T08:25:55.673Z",
      __v: 0,
    };

    todoService.updateTodoService.mockResolvedValue(mockUpdatedTodo);
    await authenticate(req, res, jest.fn());
    await updateTodo(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUpdatedTodo);
    expect(todoService.updateTodoService).toHaveBeenCalledWith(req);
  });
  it("should return status 404 if the Todo is not found", async () => {
    todoService.updateTodoService.mockRejectedValue(
      new Error("Todo not found")
    );
    await authenticate(req, res, jest.fn());
    await updateTodo(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Todo not found" });
  });
  it("should return status 500 for any other errors", async () => {
    todoService.updateTodoService.mockRejectedValue(
      new Error("Some other error")
    );

    await authenticate(req, res, jest.fn());
    await updateTodo(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Some other error" });
  });
});

describe("deleteTodo controller", () => {
  const req = {
    headers: {
      authorization: "Bearer test_token",
    },
    body: {
      todoId: "todoId123",
    },
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  it("should delete a Todo successfully and return status 200", async () => {
    const mockDeletedTodo = {
      _id: "todoId123",
      description: "Sample Todo",
      completed: false,
      dueDate: "10/09/2024",
      user: "123",
      createdAt: "2024-10-16T08:25:55.673Z",
      __v: 0,
    };

    todoService.deleteTodoService.mockResolvedValue(mockDeletedTodo);
    await authenticate(req, res, jest.fn())
    await deleteTodo(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Todo deleted successfully", deletedTodo: mockDeletedTodo });
    expect(todoService.deleteTodoService).toHaveBeenCalledWith(req);
  });

  it("should return status 404 if the Todo is not found", async () => {
    todoService.deleteTodoService.mockRejectedValue(new Error("Todo not found"));
    await authenticate(req, res, jest.fn());
    await deleteTodo(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Todo not found" });
  });

  it("should return status 400 for validation errors", async () => {
    todoService.deleteTodoService.mockRejectedValue(new Error("Invalid Todo ID"));
    await authenticate(req, res, jest.fn())
    await deleteTodo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid Todo ID" });
  });
});
