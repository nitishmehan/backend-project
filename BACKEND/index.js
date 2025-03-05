const express = require("express");
const cors = require("cors");
const restaurantRoutes = require('./routes/restaurantRoutes');
const blogRoutes = require('./routes/blogRoutes');
const userRoutes = require('./routes/userRoutes');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/restaurants', restaurantRoutes);
app.use('/blogs', blogRoutes);
app.use('/users', userRoutes);

const server = app.listen(5000, () => {
  console.log("Server running on port 5000");
});