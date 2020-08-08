module.exports = connection => {
	const route = require('express').Router();
	// const connection = require('../config/db')()
	const { verifyToken } = require('../middlewares/middlewares');

	const dbCall = async (query, condition) => {
		return new Promise((resolve, reject) => {
			connection.query(query, condition, (error, rows, results) => {
				if (error) return reject(error);
				return resolve(rows);
			});
		});
	};
	const dbInsertQuestionItems = async array => {
		const itemSql = `SELECT * FROM question_items WHERE question_id = ?`;
		const rows = [];
		rows.push(...array);
		for (const item of rows) {
			item.items = await dbCall(itemSql, [item.id]);
		}
		return rows;
	};
	route.get('/', async (req, res) => {
		const pageNum = Number(req.query.page) || 1; // NOTE: 쿼리스트링으로 받을 페이지 번호 값, 기본값은 1
		const contentSize = 20; // NOTE: 페이지에서 보여줄 컨텐츠 수.
		const skipSize = (pageNum - 1) * contentSize; // NOTE: 다음 페이지 갈 때 건너뛸 리스트 개수

		connection.query(
			'SELECT count(*) as count FROM questions',
			async (countError, countRows) => {
				const questionsSql = `SELECT * FROM questions ORDER BY id DESC LIMIT ?,?`;
				try {
					const totalCount = Number(countRows[0].count);
					const pageTotal = Math.ceil(totalCount / contentSize);

					if (pageNum > pageTotal) {
						res.status(500).json({
							error: '더이상 페이지가 없습니다',
						});
					}
					const qRows = await dbCall(questionsSql, [skipSize, contentSize]);

					const rows = await dbInsertQuestionItems(qRows);

					res.json({
						total_count: totalCount,
						page_total: pageTotal,
						page_num: pageNum,
						questions: rows,
					});
				} catch (error) {
					res.status(500).json({
						error,
					});
				}
			},
		);
	});

	route.put('/:id', verifyToken, (req, res) => {
		const { id } = req.params;

		const { title, description, category } = req.body;
		let { item01, item02 } = req.body;
		item01 = JSON.parse(item01);
		item02 = JSON.parse(item02);
		const updateQuestionSql = `UPDATE questions SET ? WHERE id=?`;
		const updateQuestionItemSql = `UPDATE question_items SET ? WHERE id = ? AND question_id = ?`;

		const questionData = { title, description, category };

		connection.query(
			updateQuestionSql,
			[questionData, id],
			(error, questionRows) => {
				if (error) {
					res.status(500).json({
						error,
					});
				} else {
					const questionItems = [item01, item02];
					questionItems.forEach(item => {
						console.log(item);
						connection.query(
							updateQuestionItemSql,
							[item, item.id, id],
							(err, itemRows) => {
								if (err) {
									console.log(err);
									res.status(500).json({ error: err });
								}
							},
						);
					});

					res.json({
						code: 200,
						message: '질문수정 성공',
					});
				}
			},
		);
	});

	// 질문상세
	route.get('/:id', (req, res) => {
		const { id } = req.params;
		console.log(id);

		const questionSql = `SELECT q.id, q.title, q.description, c.id as category_id, c.name as category_name, 
												a.id as age_id, a.name as age_name,  
                        date_format(q.created_at, '%Y-%m-%d %H:%i:%s') FROM questions as q
                        LEFT JOIN category c on q.category = c.id
                        INNER JOIN members m on q.member_id = m.id
                        LEFT JOIN age a on m.id = a.id
                        WHERE q.id = ?`;

		connection.query(questionSql, [id], (error, questionRows) => {
			if (error) {
				res.status(500).json({
					error,
				});
			} else {
				const questionItemsSql = `SELECT id, name, price, link, brand, img,
                                  date_format(created_at, '%Y-%m-%d %H:%i:%s')                                   
                                  FROM question_items WHERE question_id = ? ORDER BY id ASC`;
				connection.query(questionItemsSql, [id], (err, questionItemsRows) => {
					if (err) {
						res.status(500).json({
							error: err,
						});
					} else {
						// res.send(questionItemsRows);
						res.json({
							code: 200,
							question: questionRows,
							items: questionItemsRows,
						});
					}
				});
			}
		});
	});

	// 질문등록
	route.post('/', verifyToken, (req, res) => {
		const { title, description, category, item01, item02 } = req.body;
		const memberId = req.decoded.member_id;

		const questionData = {
			title,
			description,
			category,
			member_id: memberId,
		};

		const questionSql = 'INSERT INTO questions SET ?';
		connection.query(questionSql, questionData, (error, questionRows) => {
			if (error) {
				res.status(500).json({
					error,
				});
			} else {
				const questionId = questionRows.insertId;
				const questionItems = [
					[
						questionId,
						item01.name,
						item01.brand,
						item01.price,
						item01.link,
						item01.img,
					],
					[
						questionId,
						item02.name,
						item02.brand,
						item02.price,
						item02.link,
						item02.img,
					],
				];
				const questionItemSql = `INSERT INTO question_items(question_id, name, brand, price, link, img) VALUES ?`;
				connection.query(questionItemSql, [questionItems], (err, itemRows) => {
					if (err) {
						res.status(500).json({
							error: err,
						});
					} else {
						res.json({
							code: 200,
							message: '질문등록 성공',
						});
					}
				});
			}
		});
	});
	return route;
};
