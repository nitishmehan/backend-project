const { blogs } = require('../util/blog-data');

const getBlogs = (req, res) => {
  res.json(blogs);
};

const getBlogById = (req, res) => {
  const id = parseInt(req.params.id);
  const foundBlog = blogs.find(b => b.id === id);
  
  if (!foundBlog) {
    return res.status(404).json({ message: "Blog not found" });
  }
  res.json(foundBlog);
};

const createBlog = (req, res) => {
  const newBlog = {
    id: blogs.length + 1,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    ...req.body
  };
  blogs.push(newBlog);
  res.status(201).json(newBlog);
};

const updateBlog = (req, res) => {
  const id = parseInt(req.params.id);
  const index = blogs.findIndex(b => b.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: "Blog not found" });
  }
  
  blogs[index] = { ...blogs[index], ...req.body, id };
  res.json(blogs[index]);
};

const deleteBlog = (req, res) => {
  const id = parseInt(req.params.id);
  const index = blogs.findIndex(b => b.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: "Blog not found" });
  }
  
  blogs.splice(index, 1);
  res.status(204).send();
};

module.exports = {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog
};
