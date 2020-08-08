const app = require('./config/express');
const connection = require('./config/db')();

const auth = require('./routes/auth')(connection);

app.use('/auth', auth);

const file = require('./routes/file')(connection);

app.use('/file', file);

const questions = require('./routes/questions')(connection);

app.use('/questions', questions);

app.listen(8000, () => {
	console.log('server 80 start');
});
