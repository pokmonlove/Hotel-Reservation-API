CREATE DATABASE hotel;
USE hotel;

/*member 테이블*/
CREATE TABLE member (
    userid VARCHAR(50) PRIMARY KEY,
    userpw VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    hp VARCHAR(15) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    point INT DEFAULT 0,
    regdate DATETIME DEFAULT CURRENT_TIMESTAMP
);


/*reservation 테이블*/
CREATE TABLE reservation (
    no VARCHAR(20) PRIMARY KEY,
    userid VARCHAR(50) NOT NULL,
    roomid VARCHAR(10) NOT NULL,
    startdate DATE NOT NULL,
    enddate DATE NOT NULL,
    count INT NOT NULL,
    method VARCHAR(20) NOT NULL,
    regdate DATETIME DEFAULT CURRENT_TIMESTAMP,
    done VARCHAR(10) NOT NULL,
    FOREIGN KEY (userid) REFERENCES member(userid),
    FOREIGN KEY (roomid) REFERENCES roominfo(roomid)
);
/*roominfo 테이블*/
CREATE TABLE roominfo (
    roomid VARCHAR(10) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    area INT NOT NULL,
    maxcount INT NOT NULL,
    maxprice INT NOT NULL,
    minprice INT NOT NULL
);

INSERT INTO roominfo VALUES 
('201', '스텐다드', 8, 3, 200000, 100000),
('202', '슈페리어', 12, 4, 300000, 200000),
('301', '스텐다드', 8, 3, 200000, 100000),
('302', '슈페리어', 12, 4, 300000, 200000),
('401', '스텐다드', 8, 3, 200000, 100000),
('402', '디럭스', 15, 4, 400000, 300000),
('501', '스위트', 20, 8, 500000, 400000);

SHOW TABLES;
select * from member;
select * from reservation;
SELECT * FROM roominfo;
