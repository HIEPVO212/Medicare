// --- 1. BIẾN TOÀN CỤC ---
let currentUser = null;
let currentBookingTarget = null;
let hospitalData = [];
let doctorData = [];
let allSpecialtiesFromDB = [];
let selectedTimeSlot = ""; 

// --- 2. ĐIỀU HƯỚNG ---
function navigate(pId) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pId);
    if (target) target.classList.add('active');
    
    // NẾU RỜI KHỎI TRANG ĐẶT LỊCH -> TỰ ĐỘNG GỌI HÀM HỦY ĐỂ RESET
    if (pId !== 'dv3' && pId !== 'dv5' && pId !== 'dv6') {
        cancelBookingProcess(); 
    }

    if (pId === 'dv3') updateBookingUI();
    if (pId === 'dv5') populateConfirmationPage();
    if (pId === 'dv7') renderBookingHistory();
    
    document.querySelectorAll('.nav-link').forEach(n => {
        n.classList.remove('active');
        if (n.getAttribute('onclick') && n.getAttribute('onclick').includes(pId)) n.classList.add('active');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startFreshBooking() { currentBookingTarget = null; navigate('dv3'); }

// --- 3. ĐỒNG BỘ DỮ LIỆU SQL ---
async function loadDataFromDatabase() {
    try {
        const resBV = await fetch('http://localhost:5000/api/benhvien');
        const resBS = await fetch('http://localhost:5000/api/bacsi');
        const resCK = await fetch('http://localhost:5000/api/all-chuyenkhoa');
        
        if (resBV.ok) hospitalData = (await resBV.json()).map(i => ({ name: i.ten_benh_vien, img: i.hinh_anh, location: i.tinh_thanh }));
        if (resBS.ok) doctorData = (await resBS.json()).map(i => ({ id_bac_si: i.id_bac_si, name: i.ho_ten, img: i.hinh_anh, desc: i.hoc_vi, specialty: i.ten_chuyen_khoa, hospital: i.ten_bv_cong_tac }));
        if (resCK.ok) allSpecialtiesFromDB = await resCK.json();
        
        renderHospitals(); renderDoctors();
    } catch (e) { console.warn("Backend chưa chạy!"); }
}

function renderHospitals() {
    const list = document.getElementById('hospital-list-container');
    if (list) list.innerHTML = hospitalData.map((h, i) => `<div class="col-md-6 col-lg-4"><div class="card p-3 border-0 shadow-sm h-100 text-center"><img src="${h.img}" class="rounded-3 mb-3 shadow-sm" style="height:150px; object-fit:cover" onerror="this.src='images/Hospital/108.jpg'"><h6 class="fw-bold text-primary mb-1">${h.name}</h6><button class="btn btn-primary btn-sm w-100 rounded-pill mt-2" onclick="selectHospitalForBooking(${i})">Đặt lịch</button></div></div>`).join('');
}

function renderDoctors() {
    const list = document.getElementById('doctor-list-container');
    if (list) list.innerHTML = doctorData.map((d, i) => `<div class="col-md-6"><div class="card p-3 border-0 shadow-sm d-flex flex-row align-items-center gap-3"><img src="${d.img}" width="80" height="80" class="rounded-circle border" style="object-fit:cover" onerror="this.src='images/bs1.png'"><div class="flex-grow-1"><h6>${d.name}</h6><small>${d.desc} - ${d.specialty}</small><br><small class="text-primary fw-bold">${d.hospital}</small></div><button class="btn btn-outline-primary btn-sm rounded-pill" onclick="selectDoctorFromList(${i})">Chọn</button></div></div>`).join('');
}

// --- 4. LOGIC CHỌN GIỜ ---
function renderTimeSlots() {
    const times = ["07:30", "08:30", "09:30", "10:30", "13:30", "14:30", "15:30", "16:30"];
    const container = document.getElementById('time-slots-container');
    if (container) {
        container.innerHTML = times.map(t => `<button type="button" class="btn btn-outline-primary btn-sm time-btn px-3" onclick="selectTime('${t}', this)">${t}</button>`).join('');
    }
}

function selectTime(time, btn) {
    document.querySelectorAll('.time-btn').forEach(b => b.classList.replace('btn-primary', 'btn-outline-primary'));
    btn.classList.replace('btn-outline-primary', 'btn-primary');
    selectedTimeSlot = time;
}

// --- 5. GIAO DIỆN ĐẶT LỊCH ---
function selectHospitalForBooking(idx) { currentBookingTarget = { type: 'hospital', data: hospitalData[idx] }; navigate('dv3'); }
function selectDoctorFromList(idx) { currentBookingTarget = { type: 'doctor', data: doctorData[idx] }; navigate('dv3'); }

// Hàm Hủy tiến trình
function cancelBookingProcess() {
    currentBookingTarget = null;
    selectedTimeSlot = "";
    updateBookingUI();
}

function updateBookingUI() {
    const empty = document.getElementById('booking-empty-state');
    const form = document.getElementById('booking-form-state');
    
    if (!currentBookingTarget) { 
        // Hiện hình cái hộp, ẩn Form
        if(empty) empty.style.display = 'block'; 
        if(form) form.style.display = 'none'; 
        return; 
    }
    
    // Hiện Form, ẩn hình cái hộp
    if(empty) empty.style.display = 'none'; 
    if(form) form.style.display = 'block';
    
    // Đổ dữ liệu bác sĩ/bệnh viện vào form
    document.getElementById('selected-target-name').innerText = currentBookingTarget.data.name;
    document.getElementById('selected-target-img').src = currentBookingTarget.data.img || 'images/bs1.png';
    renderTimeSlots();

    const sel = document.getElementById('booking-specialty-select');
    if (currentBookingTarget.type === 'doctor') sel.innerHTML = `<option>${currentBookingTarget.data.specialty}</option>`;
    else sel.innerHTML = allSpecialtiesFromDB.map(s => `<option>${s.ten_chuyen_khoa}</option>`).join('');
}

function populateConfirmationPage() {
    if (!currentBookingTarget) return;
    const target = currentBookingTarget.data;
    document.getElementById('confirm-target-img').src = target.img || 'images/bs1.png';
    document.getElementById('confirm-target-name').innerText = target.name;
    document.getElementById('confirm-specialty').innerText = document.getElementById('booking-specialty-select').value;
    
    const rawDate = document.getElementById('booking-date-input').value;
    if (rawDate) {
        const parts = rawDate.split('-');
        document.getElementById('confirm-date').innerText = `${parts[2]}/${parts[1]}/${parts[0]}`;
    } else document.getElementById('confirm-date').innerText = "Chưa chọn";
    
    document.getElementById('confirm-time').innerText = selectedTimeSlot || "Chưa chọn";
    document.getElementById('confirm-notes').innerText = document.getElementById('booking-notes-input').value || "Không có";
}

// --- 6. XỬ LÝ LƯU DATABASE ---
async function processBookingAuth() {
    if(!selectedTimeSlot) return alert("Vui lòng chọn Giờ khám!");
    const btn = document.getElementById('btn-finish');
    btn.innerHTML = "Đang lưu..."; btn.disabled = true;
    try {
        await fetch('http://localhost:5000/api/dat-lich', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                id_bac_si: currentBookingTarget.data.id_bac_si || 1, 
                ho_ten: document.getElementById('p_name').value, 
                so_dien_thoai: document.getElementById('p_phone').value, 
                ngay_hen: document.getElementById('booking-date-input').value, 
                trieu_chung: document.getElementById('booking-notes-input').value,
                khung_gio: selectedTimeSlot 
            })
        });

        currentBookingTarget = null; 
        selectedTimeSlot = "";
        updateBookingUI(); 
        
        navigate('dv6'); 
    } catch (e) { alert("Lỗi kết nối!"); }
    finally { btn.innerHTML = "HOÀN TẤT ĐĂNG KÝ"; btn.disabled = false; }
}

// --- 7. TÀI KHOẢN & ĐĂNG NHẬP ---
async function handleAuthSuccess() {
    const phone = document.getElementById('loginPhone').value;
    if (phone === '0123456789') currentUser = { ho_ten: "Bác Sĩ Admin", ten_vai_tro: "Bác sĩ", so_dien_thoai: phone };
    else currentUser = { ho_ten: "Người dùng", ten_vai_tro: "Bệnh nhân", so_dien_thoai: phone };
    
    document.getElementById('nav-login-btn').style.setProperty('display', 'none', 'important');
    document.getElementById('nav-user-info').style.setProperty('display', 'block', 'important');
    document.getElementById('user-display-name').innerText = currentUser.ho_ten;
    document.getElementById('user-avatar-circle').innerText = currentUser.ho_ten.charAt(0).toUpperCase();
    navigate('home');
}

// --- 8. QUẢN LÝ LỊCH HẸN (ĐÃ THÊM CHỨC NĂNG SỬA) ---
async function renderBookingHistory() {
    const list = document.getElementById('render-booking-list');
    const th = document.getElementById('th-admin-action');
    if (!list) return;
    const isAdmin = currentUser && (currentUser.ten_vai_tro === 'Bác sĩ' || currentUser.so_dien_thoai === '0123456789');
    if(th) th.style.display = isAdmin ? '' : 'none';

    try {
        const res = await fetch('http://localhost:5000/api/lich-su');
        const data = await res.json();
        list.innerHTML = data.map(b => `
            <tr onclick="showBookingDetail(${b.id_lich_hen})" style="cursor:pointer">
                <td class="fw-bold">MC-${b.id_lich_hen}</td>
                <td>${b.ten_bac_si}</td>
                <td>${new Date(b.ngay_hen).toLocaleDateString('vi-VN')} <br> <small class="text-primary fw-bold">${b.khung_gio || '08:00'}</small></td>
                <td>${b.thong_tin_bn ? b.thong_tin_bn.split(' - ')[0] : 'Khách'}</td>
                <td><span class="badge ${b.trang_thai === 'Đã duyệt' ? 'bg-success' : 'bg-warning text-dark'}">${b.trang_thai}</span></td>
                ${isAdmin ? `
                <td onclick="event.stopPropagation()">
                    <div class="d-flex gap-1 justify-content-center">
                        <button class="btn btn-sm btn-success" onclick="approveBooking(${b.id_lich_hen})">Duyệt</button>
                        <button class="btn btn-sm btn-warning text-dark" onclick="openEditModal(${b.id_lich_hen}, '${b.ngay_hen}', '${b.khung_gio}')">Sửa</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteBooking(${b.id_lich_hen})">Xóa</button>
                    </div>
                </td>` : ''}
            </tr>`).join('');
    } catch (e) { list.innerHTML = "<tr><td colspan='6'>Trống.</td></tr>"; }
}

// --- HÀM MỞ MODAL VÀ ĐỔ DỮ LIỆU CŨ ---
function openEditModal(id, date, time) {
    document.getElementById('edit-id').value = id;
    
    // Chuyển đổi định dạng ngày cho input type="date" (YYYY-MM-DD)
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    document.getElementById('edit-date').value = formattedDate;
    document.getElementById('edit-time').value = time || "08:30";
    
    // Hiện Modal
    const modalEdit = new bootstrap.Modal(document.getElementById('editBookingModal'));
    modalEdit.show();
}

// --- HÀM LƯU VÀO DATABASE VÀ CẬP NHẬT GIAO DIỆN ---
async function saveEditedBooking() {
    const id = document.getElementById('edit-id').value;
    const newDate = document.getElementById('edit-date').value;
    const newTime = document.getElementById('edit-time').value;

    if (!newDate) {
        alert("Vui lòng chọn ngày!");
        return;
    }

    try {
        const res = await fetch(`http://localhost:5000/api/sua-lich/${id}`, {
            method: 'PUT', // Dùng phương thức PUT để sửa
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                ngay_hen: newDate, 
                khung_gio: newTime 
            })
        });

        const result = await res.json();

        if (result.success) {
            // 1. Đóng Modal
            const modalElement = document.getElementById('editBookingModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();

            // 2. Thông báo
            alert("Cập nhật thành công!");

            // 3. Quan trọng: Gọi lại hàm render để cập nhật giao diện ngay lập tức
            await renderBookingHistory(); 
        } else {
            alert("Lỗi từ phía server!");
        }
    } catch (e) {
        console.error("Lỗi Fetch:", e);
        alert("Không thể kết nối với Backend!");
    }
}

async function showBookingDetail(id) {
    try {
        const res = await fetch(`http://localhost:5000/api/lich-hen-chi-tiet/${id}`);
        const b = await res.json();
        document.getElementById('detail-content').innerHTML = `
            <div class="text-start">
                <p><b>Bác sĩ:</b> ${b.ten_bac_si}</p>
                <p><b>Bệnh viện:</b> ${b.ten_benh_vien}</p>
                <p><b>Bệnh nhân:</b> ${b.ho_ten || b.thong_tin_bn}</p>
                <p><b>Giờ khám:</b> ${b.khung_gio || '08:00'}</p>
            </div>`;
        new bootstrap.Modal(document.getElementById('bookingDetailModal')).show();
    } catch(e) { alert("Lỗi!"); }
}
// Hàm Hủy tiến trình và Reset toàn bộ trang đặt lịch
function cancelBookingProcess() {
    // 1. Reset các biến logic về rỗng
    currentBookingTarget = null;
    selectedTimeSlot = "";

    // 2. Xóa trắng các giá trị đã nhập trong các ô Input
    const dateInput = document.getElementById('booking-date-input');
    const notesInput = document.getElementById('booking-notes-input');
    
    if (dateInput) dateInput.value = ""; // Xóa ngày đã chọn
    if (notesInput) notesInput.value = ""; // Xóa triệu chứng đã nhập

    // 3. Vẽ lại danh sách khung giờ để xóa trạng thái nút đang được chọn (màu xanh)
    renderTimeSlots();

    // 4. Gọi lại hàm cập nhật giao diện để quay về màn hình "Hình cái hộp"
    updateBookingUI();
    
    // Cuộn nhẹ lên đầu trang để người dùng chọn lại Bác sĩ/Bệnh viện
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
async function approveBooking(id) { await fetch('http://localhost:5000/api/duyet-lich', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ id_lich_hen: id, trang_thai: 'Đã duyệt' }) }); renderBookingHistory(); }
async function deleteBooking(id) { if(confirm("Xóa vĩnh viễn?")) { await fetch(`http://localhost:5000/api/xoa-lich/${id}`, { method: 'DELETE' }); renderBookingHistory(); } }
function logout() { location.reload(); }
document.addEventListener('DOMContentLoaded', loadDataFromDatabase);