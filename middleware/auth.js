import jwt from 'jsonwebtoken';
import { config } from '../config.js';

// JWT 인증 미들웨어
export const isAuth = (req, res, next) => {
  // Authorization 헤더에서 토큰 추출 (Bearer <token>)
  const token = req.headers['authorization']?.split(' ')[1];

  // 토큰이 없는 경우
  if (!token) {
    return res.status(403).json({ code: '103', msg: '인증에러' });
  }

  // 토큰 검증
  jwt.verify(token, config.jwt.secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ code: '103', msg: '인증에러' });
    }

    // 인증된 사용자 정보 저장
    req.user = decoded;  // 토큰에서 디코딩된 사용자 정보
    next();  // 인증 성공 시, 다음 미들웨어로 넘어갑니다.
  });
};
