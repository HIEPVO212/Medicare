const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc'); // DÒNG NÀY LÀ DÒNG FEN ĐANG THIẾU

const app = express();
app.use(cors());
app.use(express.json());

// 1. KẾT NỐI DATABASE MYSQL (XAMPP)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'medicare'
});

db.connect(err => {
    if (err) console.error("Lỗi kết nối MySQL:", err);
    else console.log("==================================\n ĐÃ THÔNG MẠNG MYSQL MEDICARE! \n==================================");
});

// 2. CẤU HÌNH SWAGGER (TÀI LIỆU API CHO THẦY XEM)
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Medicare API Documentation',
            version: '1.0.0',
            description: 'Tài liệu API RESTful dành cho hệ thống Medicare LHU',
        },
        servers: [{ url: 'http://localhost:5000' }],
    },
    apis: ['./server.js'],
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// --- CÁC ĐƯỜNG DẪN API (ENDPOINTS) ---

/**
 * @swagger
 * /api/bacsi:
 *   get:
 *     summary: Lấy danh sách bác sĩ kèm chuyên khoa từ MySQL
 */
app.get('/api/bacsi', (req, res) => {
    const q = `SELECT BacSi.*, ChuyenKhoa.ten_chuyen_khoa 
               FROM BacSi 
               LEFT JOIN ChuyenKhoa ON BacSi.id_chuyen_khoa = ChuyenKhoa.id_chuyen_khoa`;
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

/**
 * @swagger
 * /api/benhvien:
 *   get:
 *     summary: Lấy danh sách bệnh viện từ MySQL
 */
app.get('/api/benhvien', (req, res) => {
    db.query("SELECT * FROM BenhVien", (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

/**
 * @swagger
 * /api/all-chuyenkhoa:
 *   get:
 *     summary: Lấy toàn bộ danh mục chuyên khoa từ MySQL
 */
app.get('/api/all-chuyenkhoa', (req, res) => {
    db.query("SELECT * FROM ChuyenKhoa", (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

/**
 * @swagger
 * /api/dat-lich:
 *   post:
 *     summary: Lưu lịch hẹn mới vào Database
 */
app.post('/api/dat-lich', (req, res) => {
    const { id_bac_si, ho_ten, so_dien_thoai, ngay_hen, trieu_chung } = req.body;
    const q = "INSERT INTO LichHen (id_bac_si, ngay_hen, ho_ten, trang_thai) VALUES (?, ?, ?, N'Chờ xác nhận')";
    const fullNote = ho_ten + ' - ' + so_dien_thoai + ': ' + trieu_chung;
    db.query(q, [id_bac_si, ngay_hen, fullNote], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

/**
 * @swagger
 * /api/lich-su:
 *   get:
 *     summary: Lấy danh sách lịch sử hẹn khám
 */
app.get('/api/lich-su', (req, res) => {
    const q = `SELECT 
                LichHen.id_lich_hen, 
                LichHen.ho_ten AS ten_benh_nhan, 
                BacSi.ho_ten AS ten_bac_si, 
                LichHen.ngay_hen, 
                LichHen.trang_thai 
               FROM LichHen 
               JOIN BacSi ON LichHen.id_bac_si = BacSi.id_bac_si 
               ORDER BY LichHen.id_lich_hen DESC`;
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        res.json(data);
    });
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Đăng nhập vào hệ thống
 */
app.post('/api/login', (req, res) => {
    const { phone } = req.body;
    const q = `SELECT NguoiDung.*, VaiTro.ten_vai_tro 
               FROM NguoiDung 
               JOIN VaiTro ON NguoiDung.id_vai_tro = VaiTro.id_vai_tro 
               WHERE so_dien_thoai = ?`;
    db.query(q, [phone], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length > 0) res.json({ success: true, user: data[0] });
        else res.json({ success: false, message: "Số điện thoại chưa đăng ký!" });
    });
});

app.listen(5000, () => {
    console.log("Backend Medicare đang chạy tại cổng 5000");
    console.log("Swagger UI: http://localhost:5000/api-docs");
});