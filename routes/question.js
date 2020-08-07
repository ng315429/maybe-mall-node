module.exports = (connection) => {
  const route = require('express').Router();  
  // const connection = require('../config/db')()
  const {verifyToken} = require('../middlewares/middlewares')

  route.post('/', verifyToken, (req, res) => {   
    
    const { title, description, category, item01, item02 } = req.body;    
    const memberId = req.decoded.member_id;
    
    const questionData = {
      title: title,
      description, description,
      category: category,
      member_id: memberId
    }    

    let questionSql = 'INSERT INTO questions SET ?';    
    connection.query(questionSql, questionData, (error, questionRows) => {
      if (error) {
        res.status(500).json({
          error,
        });
      } else {                
        const questionId = questionRows.insertId;
        const questionItems =[
          [questionId, item01.name, item01.brand, item01.price, item01.link, item01.img],
          [questionId, item02.name, item02.brand, item02.price, item02.link, item02.img]
        ];
        let questionItemSql = 'INSERT INTO question_items(question_id, name, brand, price, link, img) VALUES ?'
        connection.query(questionItemSql, [questionItems], (err, itemRows) => {
          if (err) {            
            res.status(500).json({
              err,
            });
          } else {        
            res.json({code: 200, message: '질문등록 성공'})
          }
        })
        
      }
    })    
  })
  return route;
}