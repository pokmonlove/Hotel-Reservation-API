import { Server } from 'socket.io';

export const initSocket = (server) => {
  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('클라이언트가 연결되었습니다.');

    socket.on('disconnect', () => {
      console.log('클라이언트가 연결을 끊었습니다.');
    });
  });
};
