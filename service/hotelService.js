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

        // 예약 정보 저장
        const [result] = await db.execute(
            'INSERT INTO reservation (no, userid, roomid, startdate, enddate, count, method, done) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                generateReservationNo(), // 예약 번호 생성 함수
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

// 예약 번호 생성 함수
const generateReservationNo = () => {
    return 'R' + Date.now(); // 간단한 예약 번호 예시
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

// 예약 취소 서비스
export const cancelReservationService = async (userid, roomid) => {
    try {
        // 예약 확인
        const [reservations] = await db.execute(
            'SELECT * FROM reservation WHERE userid = ? AND roomid = ?',
            [userid, roomid]
        );

        if (reservations.length === 0) {
            // 예약된 객실이 없음
            return 'noReservation';
        }

        const reservation = reservations[0];
        const today = new Date().toISOString().split('T')[0];
        const startDate = new Date(reservation.startdate).toISOString().split('T')[0];

        // 당일 취소 불가
        if (today === startDate) {
            return 'noCancelToday';
        }

        // 예약 취소
        await db.execute('DELETE FROM reservation WHERE userid = ? AND roomid = ?', [userid, roomid]);

        return 'success';
    } catch (error) {
        console.error('예약 취소 중 오류 발생:', error);
        throw new Error('예약 취소 중 오류 발생');
    }
};