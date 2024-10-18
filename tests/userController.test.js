const createUser = require("../controllers/User/createUser");
const deleteUser = require("../controllers/User/deleteUser");
const getUser = require("../controllers/User/getUser");
const getUserList = require("../controllers/User/getUserList");
const updateUser = require("../controllers/User/updateUser");
const authenticate = require("../middleware/authenticate");
const { userService } = require("../service/User/userService");
const { connect, disconnect, clearDatabase } = require("./test-setup");

// Mock the required modules
jest.mock("../Model/User");
jest.mock("../middleware/validation/userValidation", () => ({
  userValidationSchema: {
    validate: jest.fn(),
  },
}));
jest.mock("../service/User/userService");
jest.mock("../middleware/authenticate");

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

describe("createUser Controller", () => {
  it("should create a new user and return 201 status", async () => {
    const req = {
      body: {
        name: "John Doe",
        age: 25,
        email: "john.doe@example.com",
        password: "@password123",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockUserResponse = {
      user: {
        _id: "123",
        name: "John Doe",
        age: 25,
        email: "john.doe@example.com",
      },
      token: "dummyToken",
    };
    userService.createUserService.mockResolvedValue(mockUserResponse);
    await createUser(req, res);

    expect(userService.createUserService).toHaveBeenCalledWith(req);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockUserResponse);
  });

  it("should return 500 status on error", async () => {
    const req = {
      body: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Mock the createUserService to throw an error
    userService.createUserService.mockRejectedValue(
      new Error("Failed to create user")
    );

    await createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to create user" });
  });
});

describe("getListUser Controller", () => {
  it("should return user list and status 200", async () => {
    const req = {
      query: {
        page: 1,
        limit: 10,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockUserListResponse = {
      userList: [
        { _id: "123", name: "User 1" },
        { _id: "124", name: "User 2" },
      ],
      totalUser: 2,
      page: 1,
      limit: 10,
    };

    userService.getUserListService.mockResolvedValue(mockUserListResponse);

    await getUserList(req, res);
    expect(userService.getUserListService).toHaveBeenCalledWith(req);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalUser: 2,
      currentPage: 1,
      totalPages: 1,
      userList: [
        { _id: "123", name: "User 1" },
        { _id: "124", name: "User 2" },
      ],
    });
  });

  it("should return 500 status on service failure", async () => {
    const req = {
      query: {
        page: 1,
        limit: 10,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    // Mock getUserListService to throw an error
    userService.getUserListService.mockRejectedValue(
      new Error("Failed to fetch user list")
    );

    await getUserList(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Failed to fetch user list");
  });
});

describe("getUserService controller", () => {
  it("should return the user and status 201", async () => {
    const req = {
      headers: {
        authorization: "Bearer test_token", // Mocked Bearer token
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

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

    const mockUserResponse = {
      _id: "123",
      name: "khanh",
      age: 18,
      email: "khanhnguyen@gmail.com",
      password: "$2a$08$cBsTyxRU8wV/nD8Mr.WIBuxOAckhA6SEGbQ.un0tU7MD4qKHjDqGu",
      createdAt: "2024-10-09T04:07:28.432Z",
      tokens: [{ token: "dummyToken" }],
    };

    userService.getUserService.mockResolvedValue(mockUserResponse);
    await authenticate(req, res, jest.fn());
    await getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockUserResponse);
  });

  it("should return error for not getting user", async () => {
    const req = {
      headers: {
        authorization: "Bearer test_token", // Mocked Bearer token
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

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
    userService.getUserService.mockRejectedValue(
      new Error("Failed to get user")
    );
    await authenticate(req, res, jest.fn());
    await getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Failed to get user");
  });
});

describe("updateUser controller", () => {
  it("should update the user and return 200 status", async () => {
    const req = {
      headers: {
        authorization: "Bearer test_token", // Mocked Bearer token
      },
      name: "hoang",
      age: 30,
    };
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
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockResponse = {
      _id: "123",
      name: "hoang",
      age: 30,
      email: "khanhnguyen@gmail.com",
      password: "$2a$08$cBsTyxRU8wV/nD8Mr.WIBuxOAckhA6SEGbQ.un0tU7MD4qKHjDqGu",
      createdAt: "2024-10-09T04:07:28.432Z",
      tokens: [{ token: "dummyToken" }],
    };
    userService.updateUserService.mockResolvedValue(mockResponse);
    await authenticate(req, res, jest.fn());
    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it("should fail to update the user and return 400 status", async () => {
    const req = {
      headers: {
        authorization: "Bearer test_token", // Mocked Bearer token
      },
    };
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
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    userService.updateUserService.mockRejectedValue(
      new Error("No information available to update")
    );
    await authenticate(req, res, jest.fn());
    await updateUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "No information available to update",
    });
  });
});

describe("deleteUser controller", () => {
  it("Should delete a user", async() => {
    const req = {
      params: {
        userId: "123", // Mocked user ID
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockResponse = {
      message: "User deleted",
    };
    userService.deleteUserService.mockResolvedValue(mockResponse);
    await deleteUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResponse);
  });

  it("Should fail to delete a user", async () => {
    const req = {
      params: {
        userId: "123", // Mocked user ID
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    userService.deleteUserService.mockRejectedValue(
      new Error("Failed to delete user")
    );
    await deleteUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith("Failed to delete user")
  });
});
