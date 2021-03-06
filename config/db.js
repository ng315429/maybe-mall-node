module.exports = function() {
  require('dotenv').config();
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
    port     : process.env.DB_POST,
  });
  connection.connect((err)=> {
    if(err) {
      console.log(err)
    } else {
      console.info('db connected');
    }
  });

  return connection
}