import express from 'express';
import { getHotelList, makeReservation, getUserReservations, cancelReservation } from '../controller/hotelController.js';
import { isAuth } from '../middleware/auth.js';  // 인증 미들웨어

const router = express.Router();

router.get('/list', isAuth, getHotelList);  // 호텔 객실 리스트 조회

router.post('/reservation', isAuth, makeReservation);
// 호텔 객실 예약

router.get('/isreservation', isAuth, getUserReservations); // 지난 예약 확인

router.delete('/cancel', cancelReservation); // 예약 취소

export default router;
