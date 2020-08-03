const app = require('./config/express');

const {verifyToken} = require('./middlewares/middlewares')
const auth = require('./routes/auth')();
app.use('/auth', auth)


app.get('/test', verifyToken, (req, res, next) => {
  console.log(req,res)
  res.send(req.decoded)
  
})

app.listen(3000, () => {  
  console.log('server 80 start')
})