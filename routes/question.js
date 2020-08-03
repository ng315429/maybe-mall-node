module.exports = () => {
  const route = require('express').Router();
  const bcrypt = require('bcryptjs');
  const connection = require('../config/db')()

  return route;
}