const bcrypt = require('bcrypt');
const { users } = require('../util/user-data');



// Get all users
const getUsers = (req, res) => {
    res.json(users.map(u => ({ id: u.id, email: u.email })));
};

// Get user by ID
const getUserById = (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user.id, email: user.email });
};

// Register new user
const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if user already exists
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = {
            id: String(users.length + 1),
            email,
            password: hashedPassword
        };

        users.push(newUser);
        res.status(201).json({ id: newUser.id, email: newUser.email });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(400).json({ message: 'User not found~' });
        }

        // Since we're using plain text passwords in our data, compare directly
        if (password !== user.password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({ 
            message: 'Logged in successfully', 
            user: {
                id: user.id, 
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update user
const updateUser = (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.email = req.body.email || user.email;
    res.json({ id: user.id, email: user.email });
};

// Delete user
const deleteUser = (req, res) => {
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'User not found' });
    
    users.splice(index, 1);
    res.json({ message: 'User deleted' });
};

module.exports = {
    getUsers,
    getUserById,
    createUser: registerUser,
    updateUser,
    deleteUser,
    registerUser,
    loginUser
};
