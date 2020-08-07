const app = require('./config/express');
const connection = require('./config/db')()

const auth = require('./routes/auth')(connection);
app.use('/auth', auth)

const file = require('./routes/file')(connection);
app.use('/file', file);


const question = require('./routes/question')(connection);
app.use('/question', question)

app.listen(3000, () => {  
  console.log('server 80 start')
})