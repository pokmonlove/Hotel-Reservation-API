import jwt from 'jsonwebtoken';
import { config } from '../config.js';  // config.js에서 secretKey 가져오기

// JWT 토큰 생성 함수
export const createJwtToken = (id) => {
  return jwt.sign({ id }, config.jwt.secretKey, { expiresIn: config.jwt.expiresInSec });
};
