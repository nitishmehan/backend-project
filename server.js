const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

let restaurants = {};
let users = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'user.json'), 'utf-8')
);

const restaurantData = JSON.parse(fs.readFileSync('data.json'));
restaurants = {};
restaurantData.forEach(restaurant => {
    restaurants[restaurant.id] = restaurant;
});



app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }


    if (users.find(user => user.username === username)) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    const newUser = {
        id: users.length + 1,
        username,
        password
    };

    users.push(newUser);
    fs.writeFileSync(
        path.join(__dirname, 'user.json'),
        JSON.stringify(users)
    );

    res.status(201).json({ message: 'User registered successfully' });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', userId: user.id });
});

app.put('/users/:username', (req, res) => {
    const { username } = req.params;
    const{ oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Old and new passwords required' });
    }

    const userIndex = users.findIndex(u => u.username === username);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (users[userIndex].password !== oldPassword) {
        return res.status(401).json({ error: 'Invalid old password' });
    }

    users[userIndex].password = newPassword;
    fs.writeFileSync(
        path.join(__dirname, 'user.json'),
        JSON.stringify(users)
    );

    res.json({ message: 'Password updated successfully' });
});

app.get('/restaurant', (req, res) => {
    const restaurantList = Object.values(restaurants).map(({ id, name }) => ({
        id,
        name
    }));
    res.json(restaurantList);
});

app.get('/restaurant/:id', (req, res) => {
    const { id } = req.params;
    if (!restaurants[id]) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }
    res.json(restaurants[id].menu);
});

function getNextId(collection) {
    let maxId = 0;
    Object.values(collection).forEach(item => {
        if (item.id > maxId) maxId = item.id;
    });
    return Object.keys(collection).length;;
}

app.post('/restaurant', (req, res) => {
    const newRestaurant = req.body;

    if (!newRestaurant.name) {
        return res.send('<h1> Your Menu is empty. Update it </h1>');
    }

    const nextId = getNextId(restaurants);
    
    const restaurantWithId = {
        id: nextId,
        name: newRestaurant.name,
        menu: newRestaurant.menu || []
    };

    restaurants[nextId] = restaurantWithId;
    const restaurantArray = Object.values(restaurants);
    fs.writeFileSync(
        path.join(__dirname, 'data.json'),
        JSON.stringify(restaurantArray, null,2)
    );

    res.status(201).json({
        message: 'Restaurant created successfully',
    });
});


app.post('/restaurant/:id', (req, res) => {
    const { id } = req.params;
    const newMenu = req.body;

    if (!restaurants[id]) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (!Array.isArray(newMenu)) {
        return res.status(400).json({ error: 'Menu must be an array' });
    }

    try {

        restaurants[id].menu = newMenu;
        const restaurantArray = Object.values(restaurants);
        fs.writeFileSync(
            path.join(__dirname, 'data.json'),
            JSON.stringify(restaurantArray),
            'utf-8'
        );

        res.json({ message: 'Menu updated successfully' });
    } catch (error) {
        console.error('Error updating menu:', error);
        res.status(500).json({ error: 'Failed to update menu' });
    }
});


const server = app.listen(5000, () => {
    console.log('Server running on port 5000');
});