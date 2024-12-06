import { getAllHotels, makeReservationService, getReservationsByUserId, cancelReservationService } from '../service/hotelService.js'; 

export const getHotelList = async (req, res) => {
    try {
        console.log('Fetching hotel list...');
        const hotels = await getAllHotels();  

        return res.status(200).json({
            code: '200',
            msg: '조회성공',
            count: hotels.length,  // 호텔의 수
            data: hotels,  // 호텔 리스트
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: '500',
            msg: '호텔 리스트 조회 중 오류 발생',
        });
    }
};

// 객실 예약
export const makeReservation = async (req, res) => {
    console.log('Request body:', req.body);  // 요청 데이터 확인
    const { userid, roomid, startdate, enddate, count, method } = req.body;

    // 필수 파라미터 검사
    if (!userid || !roomid || !startdate || !enddate || !count || !method) {
        return res.status(400).json({
            code: '101',
            msg: '비정상 파라미터 전달',
        });
    }

    try {
        // 예약 처리 서비스 호출
        const result = await makeReservationService(userid, roomid, startdate, enddate, count, method);

        if (result === 'roomBooked') {
            return res.status(400).json({
                code: '104',
                msg: '이미 예약된 객실',
            });
        }

        return res.status(200).json({
            code: '204',
            msg: '예약 성공',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: '500',
            msg: '서버 오류',
        });
    }
};

// 지난 예약 확인
export const getUserReservations = async (req, res) => {
    const { userid } = req.body;  // 요청 본문에서 userid 추출

    // 필수 파라미터 검사
    if (!userid) {
        return res.status(400).json({
            code: '101',
            msg: 'userid가 필요합니다.',
        });
    }

    try {
        // 사용자의 예약 목록 조회
        const reservations = await getReservationsByUserId(userid);

        // 날짜 포맷 조정
        const formattedReservations = reservations.map((reservation) => ({
            ...reservation,
            startdate: new Date(reservation.startdate).toISOString().split('T')[0], // YYYY-MM-DD 형식
            enddate: new Date(reservation.enddate).toISOString().split('T')[0],     // YYYY-MM-DD 형식
            regdate: new Date(reservation.regdate).toISOString().split('T')[0],     // YYYY-MM-DD 형식
        }));

        return res.status(200).json({
            code: '200',
            msg: '조회 성공',
            count: reservations.length,
            reservations: formattedReservations,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: '500',
            msg: '서버 오류',
        });
    }
};

//예약 취소
export const cancelReservation = async (req, res) => {
    const { userid, no } = req.body;  // 예약 번호 (no)로 수정, roomid -> no

    // 필수 파라미터 검사
    if (!userid || !no) {
        return res.status(400).json({
            code: '101',
            msg: '비정상 파라미터 전달',
        });
    }

    try {
        const result = await cancelReservationService(userid, no);  // roomid -> no

        if (result === 'noReservation') {
            return res.status(400).json({
                code: '105',
                msg: '예약되지 않은 객실',
            });
        }

        if (result === 'noCancelToday') {
            return res.status(400).json({
                code: '106',
                msg: '당일 취소 불가',
            });
        }

        return res.status(200).json({
            code: '205',
            msg: '취소 성공',
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            code: '500',
            msg: '서버 오류',
        });
    }
};
