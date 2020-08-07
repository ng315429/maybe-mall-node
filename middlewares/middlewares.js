const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  // 액세스 토큰 검증
  try {    
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    console.log(error)    
    if (error.name === 'TokenExpiredError') {
      // code 10004 액세스 토큰 만료
      return res.status(401).json({
        code: '10004',        
        message: '토큰이 만료되었습니다'
      });
    }

    // 토큰의 비밀키가 일치하지 않는 경우
    // code 10006 유효하지 않은 토큰
    return res.status(401).json({
      code: '10006', 
      message: '유효하지 않은 토큰입니다'
    });
  }
}

exports.refreshVerifyToken = (req, res, next) => {
  // 리프레시 토큰 검증
  try {    
    req.decoded = jwt.verify(req.headers.refresh_token, process.env.JWT_SECRET);
    return next();
  } catch (error) {    
    if (error.name === 'TokenExpiredError') {
      // code 10005 리프레시 토큰 만료
      return res.status(401).json({
        code: '10005',        
        message: '리프레시 토큰이 만료되었습니다'
      });
    }
    // 토큰의 비밀키가 일치하지 않는 경우
    // code 10006 유효하지 않은 토큰
    return res.status(401).json({
      code: '10006', 
      message: '유효하지 않은 토큰입니다'
    });
  }
}

