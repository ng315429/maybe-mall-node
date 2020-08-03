
module.exports = () => {
  const route = require('express').Router();
  const bcrypt = require('bcryptjs');
  const connection = require('../config/db')()

  
  route.post('/register', (req, res) => {
    const { username, password, name, email, age,  gender } = req.body;    
    const user = {
      username,
      password,
      name,
      email,
      age,
      gender
    };
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        res.status(500).json({
          error,
        });
      } else {        
        user.password = hash;  
        let sql = 'INSERT INTO members SET ?';
        connection.query(sql, user, (error, rows, fields) => {
          if (error) {            
            res.status(500).json({
              error,
            });            
          } else {
            res.json({code: 'S0000', username , message: '회원가입 성공'})
          }
        })
      }      
    })        
  })
  route.get('/login', (req, res) => {
    console.log(req,res)
  })
  return route;
}