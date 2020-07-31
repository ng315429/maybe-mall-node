const express = require('express');
const app = express();
const connection = require('./config/db')()

app.locals.pretty = true;

app.locals.pretty = true;

app.use(express.static('public'));
app.use(express.json()); 
app.use(express.urlencoded( {extended : false } )); 


app.get('/db', (req, res) => {
  console.log(connection)
})
app.listen(80, () => {  
  console.log('server 80 start')
})