const Sequelize = require('sequelize');
const API = require('../../client/public/config.js');
const sequelize = new Sequelize(API.elephantSqlUrl);

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;