const Todo = require("../../Model/Todo");

const createTodoService = async(userId, description, dueDate) => {
    try {
        const newTodo = new Todo({
            user: userId,
            description: description,
            completed: false,
            dueDate: dueDate
        })
        await newTodo.save();
        return newTodo
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = createTodoService;