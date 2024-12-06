import bcrypt from 'bcryptjs';
import { db } from '../db/database.js';  // DB 연결 추가
import { createJwtToken } from '../service/authService.js';  // JWT 생성 함수

// 회원가입 처리
export const registerMember = async (req, res) => {
  const { userid, userpw, name, hp, gender } = req.body;

  // 필수 값이 없으면 에러 처리
  if (!userid || !userpw || !name || !hp || !gender) {
    return res.status(400).json({
      code: '101',
      msg: '비정상 파라미터 전달'
    });
  }

  // 비밀번호 암호화
  const hashedPassword = await bcrypt.hash(userpw, 10);

  // SQL 쿼리: 회원 가입
  const query = `INSERT INTO member (userid, userpw, name, hp, gender) VALUES (?, ?, ?, ?, ?)`;

  try {
    await db.execute(query, [userid, hashedPassword, name, hp, gender]);

    // JWT 토큰 생성
    const token = createJwtToken(userid);  // JWT 토큰 생성

    res.status(201).json({
      code: '201',
      msg: '회원가입 성공',
      token  // 생성된 JWT 토큰 포함
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      code: '500',
      msg: '서버 오류'
    });
  }
};

// 로그인 처리
export const loginMember = async (req, res) => {
  const { userid, userpw } = req.body;

  if (!userid || !userpw) {
    return res.status(400).json({
      code: "101",
      msg: "비정상 파라미터 전달"
    });
  }

  try {
    // 사용자 정보 조회
    const [rows] = await db.execute('SELECT * FROM member WHERE userid = ?', [userid]);

    if (rows.length === 0) {
      return res.status(401).json({
        code: "102",
        msg: "아이디 또는 비밀번호 오류"
      });
    }

    const user = rows[0];

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(userpw, user.userpw);
    if (!isMatch) {
      return res.status(401).json({
        code: "102",
        msg: "아이디 또는 비밀번호 오류"
      });
    }

    // JWT 토큰 생성
    const token = createJwtToken(user.userid);

    return res.status(200).json({
      code: "202",
      msg: "로그인 성공",
      token
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: "500",
      msg: "서버 오류"
    });
  }
};

//회원정보수정
export const updateMemberInfo = async (req, res) => {
    const { hp } = req.body;  // 수정할 정보는 휴대폰 번호만

    // 토큰에서 user 정보 추출
    const { userid } = req.user;  // 'isAuth' 미들웨어에서 이미 토큰을 검증하고 user 정보를 담았음

    if (!hp) {
        return res.status(400).json({
            code: '101',
            msg: '비정상 파라미터 전달'
        });
    }

    try {
        // 휴대폰 번호 수정
        const [result] = await db.execute(
            'UPDATE member SET hp = ? WHERE userid = ?',
            [hp, userid]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({
                code: '103',
                msg: '인증에러'
            });
        }

        // 성공적으로 수정되었을 때 응답
        res.json({
            code: '203',
            msg: '회원수정 성공'
        });
    } catch (error) {
        res.status(500).json({
            code: '500',
            msg: '서버 오류'
        });
    }
};