const app = require('./config/express');


const auth = require('./routes/auth')();
app.use('/auth', auth)



app.listen(3000, () => {  
  console.log('server 80 start')
})