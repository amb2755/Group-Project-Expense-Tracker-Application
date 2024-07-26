const User = require('../models/User'); // Import the User model //

// Register a new user //
const registerUser = async (req, res) => {
    const { id, username, password } = req.body;

    const userExists = await User.findOne({ username });

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const user = new User({
        id,
        username,
        password // If this a real world application, you would hash the password before saving //
    });

    try {
        const createdUser = await user.save();
        res.status(201).json(createdUser);
    } catch (error) {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

module.exports = { registerUser };
