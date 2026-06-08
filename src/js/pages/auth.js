const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";
const RESET_PHONE_KEY = "resetPhone";

// ==========================
// HÀM TIỆN ÍCH & KHỞI TẠO DỮ LIỆU
// ==========================

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Regex kiểm tra định dạng
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^\d{7,15}$/; // Chỉ chứa số, độ dài từ 7 đến 15 ký tự số
    return phoneRegex.test(phone);
}

function initDemoUser() {
    if (!localStorage.getItem(USERS_KEY)) {
        saveUsers([
            {
                id: 1,
                fullname: "Admin",
                phone: "0988888888",
                email: "admin@gmail.com",
                password: "12345678"
            }
        ]);
    }
}

initDemoUser();

// ==========================
// CHỨC NĂNG ĐĂNG KÝ
// ==========================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    // --- Ẩn/hiện mật khẩu Đăng ký ---
    const toggleRegPw = document.getElementById("toggleRegisterPassword");
    const regPw = document.getElementById("registerPassword");
    const eyeRegOpen = document.getElementById("eyeRegisterOpen");
    const eyeRegClose = document.getElementById("eyeRegisterClose");

    if (toggleRegPw && regPw && eyeRegOpen && eyeRegClose) {
        toggleRegPw.addEventListener("click", function () {
            const isPassword = regPw.getAttribute("type") === "password";
            regPw.setAttribute("type", isPassword ? "text" : "password");
            eyeRegOpen.classList.toggle("hidden", isPassword);
            eyeRegClose.classList.toggle("hidden", !isPassword);
        });
    }

    // --- Ẩn/hiện xác nhận mật khẩu Đăng ký ---
    const toggleRegConfirmPw = document.getElementById("toggleRegisterConfirmPassword");
    const regConfirmPw = document.getElementById("registerConfirmPassword");
    const eyeRegConfirmOpen = document.getElementById("eyeRegisterConfirmOpen");
    const eyeRegConfirmClose = document.getElementById("eyeRegisterConfirmClose");

    if (toggleRegConfirmPw && regConfirmPw && eyeRegConfirmOpen && eyeRegConfirmClose) {
        toggleRegConfirmPw.addEventListener("click", function () {
            const isPassword = regConfirmPw.getAttribute("type") === "password";
            regConfirmPw.setAttribute("type", isPassword ? "text" : "password");
            eyeRegConfirmOpen.classList.toggle("hidden", isPassword);
            eyeRegConfirmClose.classList.toggle("hidden", !isPassword);
        });
    }

    // --- Xử lý Submit Đăng ký ---
    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const fullname = document.getElementById("registerName").value.trim();
        const phone = document.getElementById("registerPhone").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("registerConfirmPassword").value;

        if (!fullname || !phone || !email || !password || !confirmPassword) {
            $(document).trigger("toast", ["Vui lòng nhập đầy đủ thông tin", "error"]);
            return;
        }

        if (!isValidPhone(phone)) {
            $(document).trigger("toast", ["Số điện thoại không hợp lệ: chỉ nhập số và có 7-15 chữ số", "error"]);
            return;
        }

        if (!isValidEmail(email)) {
            $(document).trigger("toast", ["Định dạng email không hợp lệ", "error"]);
            return;
        }

        if (password.length < 8) {
            $(document).trigger("toast", ["Mật khẩu tối thiểu 8 ký tự", "error"]);
            return;
        }

        if (password !== confirmPassword) {
            $(document).trigger("toast", ["Xác nhận mật khẩu không khớp", "error"]);
            return;
        }

        const users = getUsers();
        const existed = users.find(u => u.phone === phone || u.email === email);

        if (existed) {
            $(document).trigger("toast", ["Số điện thoại hoặc Email đã được đăng ký", "error"]);
            return;
        }

        users.push({
            id: Date.now(),
            fullname,
            phone,
            email,
            password
        });

        saveUsers(users);
        sessionStorage.setItem("pendingToast", JSON.stringify({ message: "Đăng ký tài khoản thành công!", type: "success" }));
        window.location.href = "login.html";
    });
}

// ==========================
// CHỨC NĂNG ĐĂNG NHẬP
// ==========================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    // --- Ẩn/hiện mật khẩu Đăng nhập ---
    const toggleLogPw = document.getElementById("toggleLoginPassword");
    const logPw = document.getElementById("loginPassword");
    const eyeLogOpen = document.getElementById("eyeLoginOpen");
    const eyeLogClose = document.getElementById("eyeLoginClose");

    if (toggleLogPw && logPw && eyeLogOpen && eyeLogClose) {
        toggleLogPw.addEventListener("click", function () {
            const isPassword = logPw.getAttribute("type") === "password";
            logPw.setAttribute("type", isPassword ? "text" : "password");
            eyeLogOpen.classList.toggle("hidden", isPassword);
            eyeLogClose.classList.toggle("hidden", !isPassword);
        });
    }

    // --- Xử lý Submit Đăng nhập ---
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const phone = document.getElementById("loginPhone").value.trim();
        const password = document.getElementById("loginPassword").value;

        const users = getUsers();
        const user = users.find(u => u.phone === phone && u.password === password);

        if (!user) {
            $(document).trigger("toast", ["Sai số điện thoại hoặc mật khẩu", "error"]);
            return;
        }

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        sessionStorage.setItem("pendingToast", JSON.stringify({ message: "Đăng nhập thành công! Chào mừng quay trở lại.", type: "success" }));
        window.location.href = "index.html";
    });
}

// ==========================
// TRANG TÀI KHOẢN (PROFILE)
// ==========================

const profileForm = document.getElementById("profileForm");

if (profileForm) {
    let currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));

    if (!currentUser) {
        window.location.href = "login.html";
    } else {
        // Đổ dữ liệu thật lên giao diện
        document.getElementById("profileName").value = currentUser.fullname;
        document.getElementById("profilePhone").value = currentUser.phone;
        document.getElementById("profileEmail").value = currentUser.email;
        document.getElementById("profilePassword").value = currentUser.password;
    }

    // --- Ẩn/hiện mật khẩu trang Tài khoản ---
    const togglePassword = document.getElementById("togglePassword");
    const profilePassword = document.getElementById("profilePassword");
    const eyeOpen = document.getElementById("eyeOpen");
    const eyeClose = document.getElementById("eyeClose");

    if (togglePassword && profilePassword && eyeOpen && eyeClose) {
        togglePassword.addEventListener("click", function () {
            const isPassword = profilePassword.getAttribute("type") === "password";
            profilePassword.setAttribute("type", isPassword ? "text" : "password");
            eyeOpen.classList.toggle("hidden", isPassword);
            eyeClose.classList.toggle("hidden", !isPassword);
        });
    }

    // --- Xử lý Submit Cập nhật Tài khoản ---
    profileForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("profileName").value.trim();
        const phone = document.getElementById("profilePhone").value.trim();
        const email = document.getElementById("profileEmail").value.trim();
        const password = document.getElementById("profilePassword").value;

        if (!name || !phone || !email || !password) {
            $(document).trigger("toast", ["Vui lòng không để trống thông tin", "error"]);
            return;
        }

        if (!isValidPhone(phone)) {
            $(document).trigger("toast", ["Số điện thoại không hợp lệ: chỉ nhập số và có 7-15 chữ số", "error"]);
            return;
        }

        if (!isValidEmail(email)) {
            $(document).trigger("toast", ["Định dạng email không hợp lệ", "error"]);
            return;
        }

        if (password.length < 8) {
            $(document).trigger("toast", ["Mật khẩu tối thiểu 8 ký tự", "error"]);
            return;
        }

        let users = getUsers();

        // Kiểm tra trùng lặp với tài khoản KHÁC hệ thống
        const isDuplicate = users.find(
            u => (u.phone === phone || u.email === email) && u.id !== currentUser.id
        );

        if (isDuplicate) {
            $(document).trigger("toast", ["Số điện thoại hoặc Email này đã thuộc về tài khoản khác!", "error"]);
            return;
        }

        const index = users.findIndex(u => u.id === currentUser.id);
        
        if (index !== -1) {
            // Cập nhật toàn bộ thông tin mới vào database
            users[index].fullname = name;
            users[index].phone = phone; 
            users[index].email = email;
            users[index].password = password;

            saveUsers(users);

            // Cập nhật lại trạng thái đăng nhập hiện hành
            currentUser = users[index];
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

            $(document).trigger("toast", ["Cập nhật tài khoản thành công", "success"]);
        } else {
            $(document).trigger("toast", ["Có lỗi xảy ra, không tìm thấy tài khoản!", "error"]);
        }
    });
}

// ==========================
// QUÊN MẬT KHẨU - BƯỚC 1 (NHẬP SĐT)
// ==========================

const forgotForm = document.getElementById("forgotForm");

if (forgotForm) {
    forgotForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const phone = document.getElementById("forgotPhone").value.trim();
        
        if (!isValidPhone(phone)) {
            $(document).trigger("toast", ["Số điện thoại không hợp lệ", "error"]);
            return;
        }

        const users = getUsers();
        const user = users.find(u => u.phone === phone);

        if (!user) {
            $(document).trigger("toast", ["Số điện thoại chưa được đăng ký trong hệ thống", "error"]);
            return;
        }

        localStorage.setItem(RESET_PHONE_KEY, phone);
        window.location.href = "resetpw2.html";
    });
}

// ==========================
// QUÊN MẬT KHẨU - BƯỚC 2 (OTP TRUNG GIAN)
// ==========================

const otpForm = document.getElementById("otpForm");

if (otpForm) {
    otpForm.addEventListener("submit", function (e) {
        e.preventDefault();
        // Bước đệm trung gian, nhấn gửi là tự động chuyển trang tiếp theo
        window.location.href = "resetpw3.html";
    });
}

// ==========================
// QUÊN MẬT KHẨU - BƯỚC 3 (ĐẶT LẠI MẬT KHẨU)
// ==========================

const resetPasswordForm = document.getElementById("resetPasswordForm");

if (resetPasswordForm) {
    // --- Ẩn/hiện mật khẩu mới ---
    const toggleNewPw = document.getElementById("toggleNewPassword");
    const newPw = document.getElementById("newPassword");
    const eyeNewOpen = document.getElementById("eyeNewOpen");
    const eyeNewClose = document.getElementById("eyeNewClose");

    if (toggleNewPw && newPw && eyeNewOpen && eyeNewClose) {
        toggleNewPw.addEventListener("click", function () {
            const isPassword = newPw.getAttribute("type") === "password";
            newPw.setAttribute("type", isPassword ? "text" : "password");
            eyeNewOpen.classList.toggle("hidden", isPassword);
            eyeNewClose.classList.toggle("hidden", !isPassword);
        });
    }

    // --- Ẩn/hiện xác nhận mật khẩu mới ---
    const toggleConfirmPw = document.getElementById("toggleConfirmPassword");
    const confirmPw = document.getElementById("confirmPassword");
    const eyeConfirmOpen = document.getElementById("eyeConfirmOpen");
    const eyeConfirmClose = document.getElementById("eyeConfirmClose");

    if (toggleConfirmPw && confirmPw && eyeConfirmOpen && eyeConfirmClose) {
        toggleConfirmPw.addEventListener("click", function () {
            const isPassword = confirmPw.getAttribute("type") === "password";
            confirmPw.setAttribute("type", isPassword ? "text" : "password");
            eyeConfirmOpen.classList.toggle("hidden", isPassword);
            eyeConfirmClose.classList.toggle("hidden", !isPassword);
        });
    }

    // --- Xử lý Đổi mật khẩu ---
    resetPasswordForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const password = document.getElementById("newPassword").value;
        const confirm = document.getElementById("confirmPassword").value;

        if (password.length < 8) {
            $(document).trigger("toast", ["Mật khẩu tối thiểu 8 ký tự", "error"]);
            return;
        }

        if (password !== confirm) {
            $(document).trigger("toast", ["Xác nhận mật khẩu không khớp", "error"]);
            return;
        }

        const phone = localStorage.getItem(RESET_PHONE_KEY);

        if (!phone) {
            $(document).trigger("toast", ["Phiên làm việc đã hết hạn. Vui lòng quay lại bước 1", "error"]);
            setTimeout(function () {
                window.location.href = "forgotpw.html";
            }, 1500);
            return;
        }

        let users = getUsers();
        const userIndex = users.findIndex(u => u.phone === phone);

        if (userIndex === -1) {
            $(document).trigger("toast", ["Không tìm thấy tài khoản", "error"]);
            return;
        }

        // Cập nhật mật khẩu mới cho user dựa theo SĐT đã lưu trữ tạm thời
        users[userIndex].password = password;
        saveUsers(users);

        localStorage.removeItem(RESET_PHONE_KEY);

        sessionStorage.setItem("pendingToast", JSON.stringify({ message: "Đổi mật khẩu thành công!", type: "success" }));
        window.location.href = "login.html";
    });
}