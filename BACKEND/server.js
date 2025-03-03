const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 7777;
const BLOGS_FILE = path.join(__dirname, 'blogs_card.json');

app.use(express.json());

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

// Get blogs by category
app.get('/api/blogs/category/:categoryName', (req, res) => {
  const blogs = loadBlogs();
  const category = req.params.categoryName.toLowerCase();
  const filteredBlogs = blogs.filter(blog => blog.category.toLowerCase() === category);
  
  res.json(filteredBlogs);
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
