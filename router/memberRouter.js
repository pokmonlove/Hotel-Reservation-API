import express from 'express';
import { isAuth } from '../middleware/auth.js';  // isAuth 미들웨어
import { registerMember, loginMember, updateMemberInfo } from '../controller/memberController.js';  // member 컨트롤러


const router = express.Router();

router.post('/regist', registerMember);  // POST / member/regist

router.post('/login', loginMember);  // POST /member/login

router.put('/info', isAuth, updateMemberInfo);
//PUT /member/info
export default router;
