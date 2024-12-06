// app.js

import express from 'express';
import hotelRouter from './router/hotelRouter.js';  // 호텔 라우터
import memberRouter from './router/memberRouter.js';
import { config } from './config.js';
import { initSocket } from './connection/socket.js';

const app = express();

app.use(express.json());

app.use('/hotel', hotelRouter);  // 호텔 관련 라우팅 설정
app.use('/member', memberRouter); // 회원 관련 API 라우터

app.use((req, res, next) => {
    res.sendStatus(404);  // 경로가 존재하지 않으면 404 반환
});

const server = app.listen(config.host.port, () => {
    console.log(`Server is running on port ${config.host.port}`);
});
initSocket(server);  // 소켓 초기화
