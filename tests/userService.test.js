const createUserService = require("../service/User/createUserService");
const {
  userValidationSchema,
  userIdValidationSchema,
  updateUserValidationSchema,
} = require("../middleware/validation/userValidation");
const User = require("../Model/User");
const getUserListService = require("../service/User/getUserListService");
const getUserService = require("../service/User/getUserService");
const updateUserService = require("../service/User/updateUserService");
const deleteUserService = require("../service/User/deleteUserService");
const { connect, disconnect, clearDatabase } = require("./test-setup");
const mongoose = require("mongoose");

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

describe("createUserService", () => {
  let req;

  beforeEach(() => {
    req = {
      body: {
        name: "John Doe",
        age: 25,
        email: "john.doe@example.com",
        password: "@Password123456",
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new user and return the user and token", async () => {
    // Mock the validation to resolve
    userValidationSchema.validate.mockReturnValue({ error: null });

    // Call the service to create the user
    const result = await createUserService(req);

    // Verify the user was saved by querying the mock MongoDB
    const savedUser = await User.findOne({ email: req.body.email });

    // Assertions
    expect(userValidationSchema.validate).toHaveBeenCalledWith(req.body);
    expect(savedUser).not.toBeNull(); // Check if the user was saved in the database
    expect(savedUser.name).toBe(req.body.name);
    expect(savedUser.email).toBe(req.body.email);
    expect(result).toHaveProperty("token"); // Check if token is generated
  });

  it("should throw an error and return 500 if token generation fails", async () => {
    // Mock the validation schema to pass
    userValidationSchema.validate.mockReturnValue({ error: null });

    // Spy on the `save` method to allow normal behavior
    const userSaveSpy = jest.spyOn(User.prototype, "save").mockResolvedValue();

    // Spy on `generateAuthToken` to simulate failure
    const userTokenSpy = jest
      .spyOn(User.prototype, "generateAuthToken")
      .mockRejectedValue(new Error("Failed to generate token"));

    // Call the service and expect it to throw an error due to token generation failure
    await expect(createUserService(req)).rejects.toThrow(
      "Failed to generate token"
    );

    // Ensure the user was saved
    expect(userSaveSpy).toHaveBeenCalled();

    // Ensure the token generation attempt was made
    expect(userTokenSpy).toHaveBeenCalled();
  });
});

describe("getUserList service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return userList, totalUser, page, and limit", async () => {
    const req = {
      query: {
        page: "1",
        limit: "10", // This means limit should be 10
      },
    };

    // Insert users directly into the in-memory database without specifying _id
    const mockUserList = [
      {
        name: "John Doe",
        email: "john@example.com",
        password: "@Password123456",
        age: 15,
      },
      {
        name: "Jane Doe",
        email: "jane@example.com",
        password: "@Password123456",
        age: 16,
      },
    ];

    await User.insertMany(mockUserList); // Insert users into MongoDB

    const mockTotalUser = await User.countDocuments(); // Get total user count

    // Call the service to get the user list
    const result = await getUserListService(req);

    // Assertions
    expect(result.userList).toHaveLength(2);
    expect(result.totalUser).toBe(mockTotalUser);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);

    expect(result.userList[0].name).toBe("John Doe");
    expect(result.userList[1].name).toBe("Jane Doe");
  });

  it("should throw an error if the database query fails", async () => {
    const req = {
      query: {
        page: "1",
        limit: "10",
      },
    };

    const userFindSpy = jest.spyOn(User, "find").mockImplementation(() => {
      throw new Error("Database error");
    });

    await expect(getUserListService(req)).rejects.toThrow("Database error");
    expect(userFindSpy).toHaveBeenCalled();
    userFindSpy.mockRestore();
  });

  it("should use default page and limit values if not provided in query", async () => {
    const req = { query: {} }; // No page or limit specified

    // Insert users directly into the in-memory database
    const mockUserList = [
      {
        name: "John Doe",
        email: "john@example.com",
        password: "@Password123456",
        age: 25,
      },
      {
        name: "Jane Doe",
        email: "jane@example.com",
        password: "@Password123456",
        age: 26,
      },
    ];

    await User.insertMany(mockUserList); // Insert users into MongoDB

    const mockTotalUser = await User.countDocuments(); // Get total user count

    // Call the service to get the user list
    const result = await getUserListService(req);

    // Assertions
    expect(result.userList).toHaveLength(2); // Should return both users
    expect(result.totalUser).toBe(mockTotalUser); // Check total user count
    expect(result.page).toBe(1); // Default page is 1
    expect(result.limit).toBe(10); // Default limit is 10

    expect(result.userList[0].name).toBe("John Doe");
    expect(result.userList[1].name).toBe("Jane Doe");
  });
});

describe("getUserService", () => {
  let req;

  beforeEach(() => {
    req = {
      user: {
        _id: new mongoose.Types.ObjectId(), // Generate a valid ObjectId
      },
    };
  });

  it("should return a user when given a valid user ID", async () => {
    // Mock the validation schema to return no error
    userIdValidationSchema.validate.mockReturnValue({ error: null });

    // Insert a user into the in-memory MongoDB
    const mockUser = await User.create({
      _id: req.user._id,
      name: "John Doe",
      age: 15,
      email: "john.doe@example.com",
      password: "@Password123",
    });

    // Call the service to get the user
    const result = await getUserService(req);

    // Assertions
    expect(result).toMatchObject({
      _id: mockUser._id,
      name: "John Doe",
      email: "john.doe@example.com",
      age: 15,
    });
  });

  it("should return a validation error if the user ID is invalid", async () => {
    req.user._id = ""; // Invalid user ID (empty string)

    // Call the service to get the user
    const result = await getUserService(req);

    // Assertions
    expect(result).toHaveProperty("error");
    expect(result.error).toBe("Invalid user ID format");
  });

  it("should return an error if the user is not found", async () => {
    jest.spyOn(User, "findById").mockResolvedValue(null);

    const result = await getUserService(req);

    expect(result).toHaveProperty("error");
    expect(result.error).toBe("User not found");
  });

  it("should throw an error if there's a database error", async () => {
    jest.spyOn(User, "findById").mockRejectedValue(new Error("Database error"));

    await expect(getUserService(req)).rejects.toThrow(
      "An error occurred while fetching the user"
    );
  });
});

describe("updateUserService", () => {
  let req;

  beforeEach(async () => {
    req = {
      user: {
        _id: new mongoose.Types.ObjectId(), // Generate a valid ObjectId
      },
      body: {
        name: "John Doe Updated",
        age: 16,
      },
    };

    // Insert a user into the in-memory MongoDB
    await User.create({
      _id: req.user._id,
      name: "John Doe",
      age: 15,
      email: "john.doe@example.com",
      password: "@Password123",
    });
  });

  it("should update the user when given valid input", async () => {
    // Call the service to update the user
    const result = await updateUserService(req);

    expect(result).not.toBeNull(); // Check if the user was updated in the database
    expect(result.name).toBe("John Doe Updated");
    expect(result.age).toBe(16);
  });

  it("should throw an error if there's a database error", async () => {
    const userUpdateSpy = jest
      .spyOn(User, "findOneAndUpdate")
      .mockRejectedValue(new Error("Database error"));
  
    const req = {
      user: { _id: new mongoose.Types.ObjectId() }, // Mocking a user ID
      body: { name: "Updated Name", age: 30 }, // Mocking request body
    };
  
    await expect(updateUserService(req)).rejects.toThrow("Database error during user update"); // Expecting the specific error message
  
    // Ensure the update method was called
    expect(userUpdateSpy).toHaveBeenCalled();
  
    userUpdateSpy.mockRestore();
  });

  it("should return a validation error if the user ID is invalid", async () => {
    const invalidUserId = ""; // Invalid user ID
    req.user._id = invalidUserId;

    // Call the service to update the user
    const result = await updateUserService(req);

    // Assertions
    expect(result).toHaveProperty("error");
    expect(result.error).toBe("User ID is required"); // Ensure the error message is as expected
  });
});


describe("deleteUserService", () => {
  let req;

  beforeEach(async () => {
    req = {
      params: {
        userId: new mongoose.Types.ObjectId().toString(), // Generate a valid ObjectId as a string
      },
    };
  
    // Create a user that you will delete later
    await User.create({
      _id: req.params.userId,
      name: "haha Doe",
      email: "haha.doe@example.com",
      password: "@Password123",
      age: 25,
    });
  });
  
  it("should delete a user when given a valid user ID", async () => {
    // Validate the schema (assuming no validation errors)
    userIdValidationSchema.validate.mockReturnValue({ error: null });

    // Run the real service (without mocking User.deleteOne)
    const result = await deleteUserService(req);

    // Assuming your deleteUserService interacts with the real database
    expect(result).toEqual({ message: "User deleted" });
  });

  it("should return a validation error if the user ID is invalid", async () => {
    req.params.userId = ""; // Invalid user ID

    // Simulate validation error for invalid user ID
    const mockValidationError = {
      details: [{ message: "User ID is required" }],
    };
    userIdValidationSchema.validate.mockReturnValue({
      error: mockValidationError,
    });

    // Call the service with invalid ID
    const result = await deleteUserService(req);

    // Expect the service to return a validation error
    expect(result).toHaveProperty("error");
    expect(result.error).toBe("User ID is required");
  });
});