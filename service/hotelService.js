import { db } from '../db/database.js';  // 데이터베이스 연결

// 호텔 리스트 조회
export const getAllHotels = async () => {
    try {
        const [rows] = await db.execute('SELECT * FROM roominfo');  // 'roominfo' 테이블에서 모든 호텔 데이터 조회
        return rows;
    } catch (error) {
        console.error("호텔 리스트 조회 중 오류 발생", error);
        throw new Error('호텔 리스트 조회 중 오류 발생');
    }
};

// 예약 처리
export const makeReservationService = async (userid, roomid, startdate, enddate, count, method) => {
    try {
        // 예약하려는 객실이 이미 예약된 상태인지 확인
        const [existingReservation] = await db.execute(
            'SELECT * FROM reservation WHERE roomid = ? AND ((startdate BETWEEN ? AND ?) OR (enddate BETWEEN ? AND ?))',
            [roomid, startdate, enddate, startdate, enddate]
        );

        if (existingReservation.length > 0) {
            // 이미 예약된 객실인 경우
            return 'roomBooked';
        }

        // 예약 번호 생성
        const reservationNo = generateReservationNo(); // 예약 번호 생성

        // 예약 정보 저장
        const [result] = await db.execute(
            'INSERT INTO reservation (no, userid, roomid, startdate, enddate, count, method, done) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                reservationNo,  // 생성한 예약 번호 삽입
                userid,
                roomid,
                startdate,
                enddate,
                count,
                method,
                'pending', // 예약 상태 (예: pending, confirmed 등)
            ]
        );

        return result;  // 예약 성공 시 결과 반환
    } catch (error) {
        throw new Error('예약 처리 중 오류 발생');
    }
};

// 예약 번호 생성 함수 (hotelService.js에 추가)
const generateReservationNo = () => {
    const now = new Date();
    return now.toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);  // '20241206071725' 형식
};


// 사용자의 예약 내역 조회
export const getReservationsByUserId = async (userid) => {
    try {
        // 해당 사용자의 예약 내역 조회
        const [rows] = await db.execute(
            'SELECT r.roomid, r.type, r.area, r.maxcount, res.startdate, res.enddate, res.regdate ' +
            'FROM reservation res ' +
            'JOIN roominfo r ON res.roomid = r.roomid ' +
            'WHERE res.userid = ? ORDER BY res.startdate DESC',
            [userid]
        );

        return rows;
    } catch (error) {
        throw new Error('예약 조회 중 오류 발생');
    }
};

export const cancelReservationService = async (userid, no) => {
    try {
        // 예약 확인: 예약번호(no)와 userid를 모두 조건으로 사용
        const [reservations] = await db.execute(
            'SELECT * FROM reservation WHERE no = ? AND userid = ?',
            [no, userid]
        );

        console.log('조회된 예약 내역:', reservations);  // 예약 내역 확인

        // 예약이 없을 경우 처리
        if (reservations.length === 0) {
            console.log('예약되지 않은 객실입니다.');
            return { code: "105", msg: "예약되지 않은 객실" };
        }

        const reservation = reservations[0];
        const today = new Date();

        // 예약 시작 날짜를 'yyyy-mm-dd' 형식으로 변환
        const startDate = new Date(reservation.startdate);
        const formattedStartDate = startDate.toISOString().slice(0, 10);  // 'yyyy-mm-dd'

        // 오늘 날짜를 'yyyy-mm-dd' 형식으로 변환
        const formattedToday = today.toISOString().slice(0, 10);  // 'yyyy-mm-dd'

        // 당일 취소 불가 (현재 날짜와 예약 시작 날짜가 같은 경우)
        if (formattedToday === formattedStartDate) {
            return { code: "106", msg: "당일 취소 불가" };
        }

        // 예약 취소 (삭제) 전에 로그를 찍어보세요.
        console.log(`예약 취소를 위한 DELETE 쿼리 실행: no = ${no}, userid = ${userid}`);

        // DELETE 쿼리 실행
        const [deleteResult] = await db.execute(
            'DELETE FROM reservation WHERE no = ? AND userid = ?',
            [no, userid]
        );

        // DELETE 실행 결과 확인
        console.log('DELETE 쿼리 실행 결과:', deleteResult);

        // affectedRows가 0이면 삭제되지 않았음을 알림
        if (deleteResult.affectedRows === 0) {
            console.log('삭제된 행이 없습니다. 조건을 다시 확인해보세요.');
            return { code: "105", msg: "예약되지 않은 객실" };
        }

        console.log('예약 취소 완료');
        return { code: "205", msg: "취소 성공" };
    } catch (error) {
        console.error('예약 취소 중 오류 발생:', error);
        throw new Error('예약 취소 중 오류 발생');
    }
};