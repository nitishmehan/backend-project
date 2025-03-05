const { restaurant } = require('../util/restaurant-data');

const getRestaurants = (req, res) => {
  res.json(restaurant);
};

const getRestaurantById = (req, res) => {
  const id = parseInt(req.params.id);
  const foundRestaurant = restaurant.find(r => r.id === id);
  
  if (!foundRestaurant) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  res.json(foundRestaurant);
};

const createRestaurant = (req, res) => {
  const newRestaurant = {
    id: restaurant.length + 1,
    ...req.body
  };
  restaurant.push(newRestaurant);
  res.status(201).json(newRestaurant);
};

const updateRestaurant = (req, res) => {
  const id = parseInt(req.params.id);
  const index = restaurant.findIndex(r => r.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  
  restaurant[index] = { ...restaurant[index], ...req.body, id };
  res.json(restaurant[index]);
};

const deleteRestaurant = (req, res) => {
  const id = parseInt(req.params.id);
  const index = restaurant.findIndex(r => r.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: "Restaurant not found" });
  }
  
  restaurant.splice(index, 1);
  res.status(204).send();
};

module.exports = {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
};
