module.exports = connection => {
	const route = require('express').Router();
	const bcrypt = require('bcryptjs');
	// const connection = require('../config/db')()
	const jwt = require('jsonwebtoken');
	const { refreshVerifyToken } = require('../middlewares/middlewares');

	const generatorRefreshToken = user =>
		// const tokenInfo = jwt.verify(payLoad, process.env.JWT_SECRET);
		jwt.sign(
			{
				username: user.username,
				member_id: user.member_id,
				name: user.name,
			},
			process.env.JWT_SECRET,
			{
				expiresIn: 60 * 60 * 24 * 1000 * 7,
				issuer: 'maybemall',
			},
		);

	route.get('/refresh', refreshVerifyToken, (req, res) => {
		const refreshTokenInfo = req.decoded;
		const token = jwt.sign(
			{
				username: refreshTokenInfo.username,
				member_id: refreshTokenInfo.member_id,
				name: refreshTokenInfo.name,
			},
			process.env.JWT_SECRET,
			{
				// expiresIn: 60*60,
				expiresIn: '3000',
				issuer: 'maybemall',
			},
		);
		const refreshToken = generatorRefreshToken(refreshTokenInfo);
		res.json({
			access_token: token,
			refresh_token: refreshToken,
			username: refreshTokenInfo.username,
			name: refreshTokenInfo.name,
			message: '토큰 발행 성공',
		});
	});

	route.post('/register', (req, res) => {
		const { username, password, name, email, age, gender } = req.body;
		const user = {
			username,
			password,
			name,
			email,
			age,
			gender,
		};
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(password, salt, (err, hash) => {
				if (err) {
					res.status(500).json({
						err,
					});
				} else {
					user.password = hash;
					const sql = 'INSERT INTO members SET ?';
					connection.query(sql, user, (error, rows, fields) => {
						if (error) {
							res.status(500).json({
								error,
							});
						} else {
							res.json({ username, code: 200, message: '회원가입 성공' });
						}
					});
				}
			});
		});
	});
	route.post('/access', (req, res) => {
		const { username, password } = req.body;
		if (!username || username === '') {
			res.status(400).json({
				error: {
					message: '아이디를 확인하세요',
				},
			});
		}
		if (!password || password === '') {
			res.status(400).json({
				error: {
					message: '비밀번호를 확인하세요',
				},
			});
		}
		const sql =
			'SELECT id, username, password, name FROM members WHERE username = ?';
		connection.query(sql, [username], (error, rows) => {
			if (error) {
				res.status(500).json({
					error,
				});
			} else {
				const user = rows[0];
				if (user) {
					// const { username } = user;
					const userPassword = user.password;

					bcrypt.compare(password, userPassword, (err, compareRes) => {
						if (err) {
							res.status(500).json({
								error: err,
							});
						} else if (compareRes) {
							const token = jwt.sign(
								{
									username: user.username,
									member_id: user.id,
									name: user.name,
								},
								process.env.JWT_SECRET,
								{
									expiresIn: 60 * 60 * 24 * 1000,
									issuer: 'maybemall',
								},
							);
							const refreshToken = generatorRefreshToken(token);
							res.json({
								access_token: token,
								refresh_token: refreshToken,
								username: user.username,
								name: user.name,
								message: '로그인 성공',
							});
						} else {
							res.status(400).json({
								error: {
									message: '사용자 데이터가 유효하지 않습니다',
								},
							});
						}
					});
				} else {
					res.status(400).json({
						error: {
							message: '아이디를 확인하세요',
						},
					});
				}
			}
		});
	});
	return route;
};
