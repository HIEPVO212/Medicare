-- TẠO BẢNG VÀ NẠP DỮ LIỆU CHUẨN MYSQL
CREATE TABLE VaiTro (
    id_vai_tro INT PRIMARY KEY AUTO_INCREMENT,
    ten_vai_tro VARCHAR(50) NOT NULL
);

CREATE TABLE NguoiDung (
    id_nguoi_dung INT PRIMARY KEY AUTO_INCREMENT,
    ho_ten VARCHAR(100) NOT NULL,
    so_dien_thoai VARCHAR(15) UNIQUE NOT NULL,
    id_vai_tro INT,
    FOREIGN KEY (id_vai_tro) REFERENCES VaiTro(id_vai_tro)
);

CREATE TABLE BenhVien (
    id_benh_vien INT PRIMARY KEY AUTO_INCREMENT,
    ten_benh_vien VARCHAR(200) NOT NULL,
    tinh_thanh VARCHAR(100),
    hinh_anh VARCHAR(255)
);

CREATE TABLE ChuyenKhoa (
    id_chuyen_khoa INT PRIMARY KEY AUTO_INCREMENT,
    ten_chuyen_khoa VARCHAR(100) NOT NULL
);

CREATE TABLE BacSi (
    id_bac_si INT PRIMARY KEY AUTO_INCREMENT,
    ho_ten VARCHAR(100) NOT NULL,
    hoc_vi VARCHAR(50),
    id_benh_vien INT,
    id_chuyen_khoa INT,
    hinh_anh VARCHAR(255),
    FOREIGN KEY (id_benh_vien) REFERENCES BenhVien(id_benh_vien),
    FOREIGN KEY (id_chuyen_khoa) REFERENCES ChuyenKhoa(id_chuyen_khoa)
);

CREATE TABLE LichHen (
    id_lich_hen INT PRIMARY KEY AUTO_INCREMENT,
    id_bac_si INT,
    ngay_hen DATE,
    ho_ten TEXT,
    trang_thai VARCHAR(50) DEFAULT 'Chờ xác nhận',
    FOREIGN KEY (id_bac_si) REFERENCES BacSi(id_bac_si)
);

-- NẠP DỮ LIỆU MẪU ĐỂ TEST
INSERT INTO VaiTro (ten_vai_tro) VALUES ('Bệnh nhân'), ('Bác sĩ');
INSERT INTO ChuyenKhoa (ten_chuyen_khoa) VALUES ('Nội Tổng Quát'), ('Khoa Cấp Cứu');
INSERT INTO BenhVien (ten_benh_vien, tinh_thanh, hinh_anh) VALUES ('Bệnh viện TW Quân đội 108', 'Hà Nội', 'images/Hospital/108.jpg');
INSERT INTO BacSi (ho_ten, hoc_vi, id_benh_vien, id_chuyen_khoa, hinh_anh) VALUES ('Lê Văn Anh', 'PGS.TS', 1, 1, 'images/bs1.png');
USE medicare;
-- Xóa sạch cũ để nạp mới
DELETE FROM LichHen; DELETE FROM BacSi; DELETE FROM BenhVien; DELETE FROM ChuyenKhoa;
-- Reset ID
ALTER TABLE ChuyenKhoa AUTO_INCREMENT = 1;
ALTER TABLE BenhVien AUTO_INCREMENT = 1;
ALTER TABLE BacSi AUTO_INCREMENT = 1;

-- Nạp 10 chuyên khoa
INSERT INTO ChuyenKhoa (ten_chuyen_khoa) VALUES ('Nội Tổng Quát'), ('Khoa Cấp Cứu'), ('Nhi Khoa'), ('Sản Phụ Khoa'), ('Tim Mạch'), ('Thần Kinh'), ('Da Liễu'), ('Nhãn Khoa'), ('Răng Hàm Mặt'), ('Chấn Thương');

-- Nạp 10 bệnh viện
INSERT INTO BenhVien (ten_benh_vien, tinh_thanh, hinh_anh) VALUES 
('BV TW Quân đội 108', 'Hà Nội', 'images/Hospital/108.jpg'),
('BV Chợ Rẫy', 'TP.HCM', 'images/Hospital/choray.jpg'),
('BV Bạch Mai', 'Hà Nội', 'images/Hospital/bachmai.jpg'),
('BV Đa khoa Bình Dương', 'Bình Dương', 'images/Hospital/binhduong.jpg'),
('BV Đa khoa Đà Nẵng', 'Đà Nẵng', 'images/Hospital/danang.jpg'),
('BV Việt Đức', 'Hà Nội', 'images/Hospital/vietduc.jpg'),
('BV Ung Bướu', 'TP.HCM', 'images/Hospital/ungbuou.jpg'),
('BV Nhi Đồng 1', 'TP.HCM', 'images/Hospital/nhidong1.jpg'),
('BV Từ Dũ', 'TP.HCM', 'images/Hospital/tudu.jpg'),
('BV Thống Nhất', 'TP.HCM', 'images/Hospital/thongnhat.jpg');

-- Nạp 10 bác sĩ
INSERT INTO BacSi (ho_ten, hoc_vi, id_benh_vien, id_chuyen_khoa, hinh_anh) VALUES 
('Lê Văn Anh', 'PGS.TS', 1, 1, 'images/bs1.png'),
('Nguyễn Thị Út', 'TS.BS', 2, 2, 'images/bs2.png'),
('Võ Thị Thiện', 'ThS.BS', 3, 3, 'images/bs3.png'),
('Trần Duy Tâm', 'BS.CKII', 4, 4, 'images/bs4.png'),
('Phạm Kiên Hữu', 'GS.TS', 5, 5, 'images/bs5.png'),
('Hồ Minh Anh', 'BS.CKI', 6, 6, 'images/bs6.png'),
('Đinh Gia Khánh', 'ThS.BS', 7, 7, 'images/bs7.png'),
('Vũ Thanh Tùng', 'BS.CKII', 8, 8, 'images/bs8.png'),
('Ngô Phương Linh', 'TS.BS', 9, 9, 'images/bs9.png'),
('Lương Như Hào', 'PGS.TS', 10, 10, 'images/bs10.png');