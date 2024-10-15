const { connect, disconnect, clearDatabase } = require("./test-setup");
const createUserService = require("../service/User/createUserService");
const User = require("../Model/User");
const { userValidationSchema } = require("../middleware/validation/userValidation");
const { userService } = require("../service/User/userService");
const getUserList = require("../controllers/User/getUserList");

// Mock the required modules
jest.mock("../Model/User");
jest.mock("../middleware/validation/userValidation", () => ({
  userValidationSchema: {
    validate: jest.fn()
  }
}));
jest.mock("../service/User/userService");

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

describe("User Controller - create user", () => {
  it("should create a new user and return a token", async () => {
    // Mock the validation to pass
    userValidationSchema.validate.mockReturnValue({ error: null, value: {} });

    const mockUser = {
      save: jest.fn(),
      generateAuthToken: jest.fn().mockResolvedValue("mock-token"),
    };
    User.mockImplementation(() => mockUser);

    const req = {
      body: {
        name: "Test User",
        age: 25,
        email: "test@example.com",
        password: "StrongPass1!",
      },
    };

    const result = await createUserService(req);

    expect(result).toEqual({
      user: mockUser,
      token: "mock-token",
    });
    expect(User).toHaveBeenCalledWith(req.body);
    expect(mockUser.save).toHaveBeenCalled();
    expect(mockUser.generateAuthToken).toHaveBeenCalled();
  });

  it("should return validation error if input is invalid", async () => {
    const mockError = { details: [{ message: 'Validation error' }] };
    userValidationSchema.validate.mockReturnValue({ error: mockError });

    const req = {
      body: {
        // Invalid user data
      },
    };

    const result = await createUserService(req);

    expect(result).toEqual({ error: "Validation error" });
    expect(User).not.toHaveBeenCalled();
  });
});

describe("User Controller - getUserList", () => {  // Removed async here
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockRequest = {
      query: {
        page: "1",
        limit: "10"
      }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
  });

  it("should return user list successfully", async () => { // Keep async here
    const mockUserList = [
      { id: 1, name: "User 1" },
      { id: 2, name: "User 2" },
    ];
    const mockTotalUser = 20;
    const mockPage = 1;
    const mockLimit = 10;

    jest.spyOn(userService, 'getUserListService').mockResolvedValue({
      userList: mockUserList,
      totalUser: mockTotalUser,
      page: mockPage,
      limit: mockLimit
    });

    // Call the getUserList function
    await getUserList(mockRequest, mockResponse);

    // Assert the response status and body
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      totalUser: mockTotalUser,
      currentPage: mockPage,
      totalPages: Math.ceil(mockTotalUser / mockLimit),
      userList: mockUserList,
    });
  });
});

  