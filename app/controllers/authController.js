// app/controllers/authController.js
import User from "../models/User.js";
import Cart from "../models/Cart.js";
import { getUsers, registerUserApi } from "../services/api.js";

const KEY = "novapad_current_user"; // Khóa lưu session người dùng

class AuthController {
    constructor() {
        this.cart = new Cart();
    }

    // Tự động render menu Header dựa vào trạng thái đăng nhập
    updateHeaderAuth() {
        const userJson = localStorage.getItem(KEY);
        const user = userJson ? JSON.parse(userJson) : null;
        const authMenuContainer = document.getElementById("auth-menu");

        if (!authMenuContainer) return;

        if (!user) {
            authMenuContainer.innerHTML = `
                <a href="login.html" class="w-9 h-9 rounded-full bg-cyan-400 text-black flex items-center justify-center transition shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.4)]" title="Đăng nhập tài khoản">
                    <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </a>
            `;
        } else {
            const displayName = user.gametag || user.name || "Pilot";
            authMenuContainer.innerHTML = `
                <div class="flex items-center gap-2 text-xs font-mono bg-[#0a101d] border border-gray-800 px-3 h-9 rounded text-gray-300">
                    <span class="text-cyan-400 font-bold truncate max-w-[120px]" title="${displayName}">[${displayName}]</span>
                    <button id="btn-logout" class="text-gray-400 hover:text-red-400 transition ml-1 uppercase text-[10px] font-bold border-l border-gray-700 pl-2 cursor-pointer">Đăng xuất</button>
                </div>
            `;

            // Bắt sự kiện đăng xuất
            const btnLogout = document.getElementById("btn-logout");
            if (btnLogout) {
                btnLogout.addEventListener("click", () => {
                    this.logout();
                });
            }
        }
    }

    updateHeaderCart() {
        const badge = document.getElementById("header-cart-badge");
        const total = document.getElementById("header-cart-total");
        if (badge) badge.innerText = this.cart.totalCount;
        if (total) total.innerText = Number(this.cart.totalAmount).toLocaleString("vi-VN") + " đ";
    }

    // Xử lý Đăng Nhập
    async handleLogin(e) {
        e.preventDefault();
        const accountInput = document.getElementById("input-account") || document.querySelector('input[name="username"]');
        const passwordInput = document.getElementById("input-password") || document.querySelector('input[name="password"]');

        const account = accountInput ? accountInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";

        if (!account || !password) {
            alert("Vui lòng điền đầy đủ tài khoản và mật khẩu!");
            return;
        }

        try {
            const users = await getUsers();
            const foundUser = users.find(u => 
                (u.email?.toLowerCase() === account.toLowerCase() || u.gametag?.toLowerCase() === account.toLowerCase() || u.username?.toLowerCase() === account.toLowerCase()) &&
                u.password === password
            );

            if (foundUser) {
                const { password: _, ...safeUser } = foundUser;
                localStorage.setItem(KEY, JSON.stringify(safeUser));
                alert(`Đăng nhập thành công! Chào mừng Pilot [${safeUser.gametag || safeUser.username || safeUser.name}].`);
                window.location.href = "index.html";
            } else {
                alert("Tài khoản hoặc Mật khẩu không chính xác!");
            }
        } catch (err) {
            alert("Lỗi kết nối hệ thống: " + err.message);
        }
    }

    // Xử lý Đăng Ký
    async handleRegister(e) {
        e.preventDefault();
        const fullnameInput = document.querySelector('input[name="fullname"]') || document.getElementById("input-reg-fullname");
        const usernameInput = document.querySelector('input[name="username"]') || document.getElementById("input-reg-gametag");
        const passwordInput = document.querySelector('input[name="password"]') || document.getElementById("input-reg-password");
        const confirmInput = document.querySelector('input[name="confirm"]') || document.getElementById("input-reg-confirm");

        const fullname = fullnameInput ? fullnameInput.value.trim() : "";
        const username = usernameInput ? usernameInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";
        const confirm = confirmInput ? confirmInput.value : "";

        if (!fullname || !username || !password) {
            alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
            return;
        }

        if (password.length < 6) {
            alert("Mật khẩu bảo mật phải có tối thiểu 6 ký tự!");
            return;
        }

        if (confirm && password !== confirm) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            const users = await getUsers();
            const isExisted = users.some(u => u.username?.toLowerCase() === username.toLowerCase() || u.email?.toLowerCase() === username.toLowerCase());

            if (isExisted) {
                alert("Tên đăng nhập hoặc Gametag này đã tồn tại!");
                return;
            }

            const newUser = new User(fullname, `${username}@novapad.gg`, "", "Việt Nam", "member", username, password);
            newUser.id = Date.now();

            const result = await registerUserApi(newUser);
            if (result) {
                alert(`Khởi tạo hồ sơ Pilot [${username}] thành công! Chuyển sang trang Đăng nhập.`);
                window.location.href = "login.html";
            } else {
                alert("Đăng ký thất bại. Kiểm tra lại kết nối JSON Server!");
            }
        } catch (err) {
            alert("Lỗi đăng ký: " + err.message);
        }
    }

    // Xử lý Đăng Xuất
    logout() {
        localStorage.removeItem(KEY);
        alert("Đã đăng xuất khỏi hệ thống.");
        window.location.href = "index.html";
    }

    init() {
        this.updateHeaderCart();
        this.updateHeaderAuth();

        // Gắn sự kiện submit cho form (dù là form tĩnh ở file html hay render động)
        const formLogin = document.getElementById("form-login") || document.getElementById("auth-form");
        if (formLogin && window.location.pathname.includes("login")) {
            formLogin.addEventListener("submit", (e) => this.handleLogin(e));
        }

        const formRegister = document.getElementById("form-register") || document.getElementById("auth-form");
        if (formRegister && window.location.pathname.includes("register")) {
            formRegister.addEventListener("submit", (e) => this.handleRegister(e));
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new AuthController().init();
});