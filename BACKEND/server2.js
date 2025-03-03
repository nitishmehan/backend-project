const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
const BLOGS_FILE = path.join(__dirname, 'blogs_card.json');

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


// Utility function to load blogs
const loadBlogs = () => {
    try {
      const data = fs.readFileSync(BLOGS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error("Error loading blogs:", error);
      return [];
    }
  };
  
  // Utility function to save blogs
  const saveBlogs = (blogs) => {
    try {
      fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2));
    } catch (error) {
      console.error("Error saving blogs:", error);
    }
  };
  
  // Get all blogs
  app.get('/api/blogs', (req, res) => {
    res.json(loadBlogs());
  });
  
  // Get a single blog by ID
  app.get('/api/blogs/:id', (req, res) => {
    const blogs = loadBlogs();
    const blog = blogs.find(blog => blog.id === parseInt(req.params.id));
    
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    res.json(blog);
  });
  
  // Create a new blog
  app.post('/api/blogs', (req, res) => {
    const blogs = loadBlogs();
    const newBlog = {
      id: blogs.length ? blogs[blogs.length - 1].id + 1 : 1,
      ...req.body,
    };
    
    blogs.push(newBlog);
    saveBlogs(blogs);
    
    res.status(201).json(newBlog);
  });
  
  // Delete a blog by ID
  app.delete('/api/blogs/:id', (req, res) => {
    let blogs = loadBlogs();
    const blogId = parseInt(req.params.id);
    const initialLength = blogs.length;
  
    blogs = blogs.filter(blog => blog.id !== blogId);
  
    if (blogs.length === initialLength) {
      return res.status(404).json({ message: "Blog not found" });
    }
  
    saveBlogs(blogs);
    res.json({ message: `Blog with ID ${blogId} deleted successfully` });
  });
  
  // Update a blog by ID
  app.put('/api/blogs/:id', (req, res) => {
    let blogs = loadBlogs();
    const blogId = parseInt(req.params.id);
    const index = blogs.findIndex(blog => blog.id === blogId);
  
    if (index === -1) {
      return res.status(404).json({ message: "Blog not found" });
    }
  
    blogs[index] = { ...blogs[index], ...req.body };
    saveBlogs(blogs);
  
    res.json({ message: `Blog with ID ${blogId} updated successfully`, blog: blogs[index] });
  });

const server = app.listen(5000, () => {
    console.log('Server running on port 5000');
});