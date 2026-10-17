// app/controllers/authController.js
import User from "../models/User.js";
import Cart from "../models/Cart.js";
import { getUsers, registerUserApi } from "../services/api.js";

class AuthController {
    constructor() {
        this.cart = new Cart();
        this.sessionKey = "novapad_current_user";
    }

    // Cập nhật số lượng và tổng tiền giỏ hàng trên Header
    updateHeaderCart() {
        const badge = document.getElementById("header-cart-badge");
        const total = document.getElementById("header-cart-total");
        if (badge) badge.innerText = this.cart.totalCount;
        if (total) total.innerText = Number(this.cart.totalAmount).toLocaleString("vi-VN") + " đ";
    }

    // Logic xử lý bật / tắt ẩn hiện mật khẩu (Eye Toggle)
    setupPasswordToggle(btnId, inputId) {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        if (!btn || !input) return;

        btn.addEventListener("click", () => {
            const isPassword = input.type === "password";
            input.type = isPassword ? "text" : "password";

            const eyeOpen = btn.querySelector(".eye-open");
            const eyeClosed = btn.querySelector(".eye-closed");

            if (eyeOpen && eyeClosed) {
                eyeOpen.classList.toggle("hidden", isPassword);
                eyeClosed.classList.toggle("hidden", !isPassword);
            }
        });
    }

    // 1. Xử lý ĐĂNG NHẬP 
    async handleLogin(e) {
        e.preventDefault();
        const accountInput = document.getElementById("input-account");
        const passwordInput = document.getElementById("input-password");

        const account = accountInput ? accountInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";

        if (!account) {
            alert("Vui lòng nhập Email hoặc Gametag đấu trường!");
            return;
        }
        if (!password) {
            alert("Vui lòng nhập Mật khẩu bảo mật!");
            return;
        }

        const users = await getUsers();
        const foundUser = users.find(u => 
            (u.email?.toLowerCase() === account.toLowerCase() || u.gametag?.toLowerCase() === account.toLowerCase()) &&
            u.password === password
        );

        if (foundUser) {
            localStorage.setItem(this.sessionKey, JSON.stringify(foundUser));
            alert(`Đăng nhập thành công! Chào mừng Pilot [${foundUser.gametag || foundUser.name}] trở lại.`);
            window.location.href = "index.html";
        } else {
            alert("Gametag/Email hoặc Mật khẩu không chính xác. Vui lòng thử lại!");
        }
    }

    // 2. Xử lý ĐĂNG KÝ (dành cho trang register.html)
    async handleRegister(e) {
        e.preventDefault();
        const gametagInput = document.getElementById("input-reg-gametag");
        const fullnameInput = document.getElementById("input-reg-fullname");
        const emailInput = document.getElementById("input-reg-email");
        const phoneInput = document.getElementById("input-reg-phone");
        const passwordInput = document.getElementById("input-reg-password");
        const confirmPassInput = document.getElementById("input-reg-confirm");

        const gametag = gametagInput ? gametagInput.value.trim() : "";
        const fullname = fullnameInput ? fullnameInput.value.trim() : "";
        const email = emailInput ? emailInput.value.trim() : "";
        const phone = phoneInput ? phoneInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";
        const confirmPass = confirmPassInput ? confirmPassInput.value : "";

        if (!gametag || !fullname || !email || !password) {
            alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
            return;
        }

        if (password.length < 6) {
            alert("Mật khẩu bảo mật phải có tối thiểu 6 ký tự!");
            return;
        }

        if (password !== confirmPass) {
            alert("Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại!");
            return;
        }

        const users = await getUsers();
        const isExisted = users.some(u => 
            (u.email && u.email.toLowerCase() === email.toLowerCase()) ||
            (u.gametag && u.gametag.toLowerCase() === gametag.toLowerCase())
        );

        if (isExisted) {
            alert("Email hoặc Gametag đấu trường này đã được sử dụng!");
            return;
        }

        // Tạo đối tượng từ Model User
        const newUser = new User(
            fullname,
            email,
            phone,
            "Việt Nam",
            "member",
            gametag,
            password
        );
        newUser.id = Date.now();

        const result = await registerUserApi(newUser);
        if (result) {
            alert(`Khởi tạo hồ sơ Pilot [${gametag}] thành công! Chuyển sang trang Đăng nhập.`);
            window.location.href = "login.html";
        } else {
            alert("Đăng ký thất bại. Hãy kiểm tra lại kết nối JSON-Server cổng 3000!");
        }
    }

    // Khởi tạo và gắn các sự kiện DOM
    init() {
        this.updateHeaderCart();

        // 1. Kích hoạt tính năng ẩn/hiện mật khẩu
        this.setupPasswordToggle("toggle-login-pass", "input-password");
        this.setupPasswordToggle("toggle-reg-pass", "input-reg-password");
        this.setupPasswordToggle("toggle-reg-confirm", "input-reg-confirm");

        // 2. Bắt sự kiện submit form Đăng nhập
        const loginForm = document.getElementById("form-login");
        if (loginForm) {
            loginForm.addEventListener("submit", (e) => this.handleLogin(e));
        }

        // 3. Bắt sự kiện submit form Đăng ký
        const regForm = document.getElementById("form-register");
        if (regForm) {
            regForm.addEventListener("submit", (e) => this.handleRegister(e));
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new AuthController().init();
});