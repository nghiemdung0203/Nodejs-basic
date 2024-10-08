const Todo = require("../../Model/Todo");

const createTodo = async(req, res) => {
    const userId = req.params.userId;
    try {
        const newTodo = new Todo({
            user: userId,
            description: req.body.description,
            completed: false,
            dueDate: req.body.dueDate
        })
        await newTodo.save();
        res.status(201).json(newTodo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = createTodo;