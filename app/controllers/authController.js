class AuthController {
    constructor() {
        this.currentMode = "register";
        this.storageKey = "novapad_users_db";
        this.sessionKey = "novapad_current_session";
    }

    getUsers() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [
            {
                id: 1,
                gametag: "ShadowAim_VN",
                name: "Nguyễn Trung Hiếu",
                email: "pilot@novapad.gg",
                phone: "+84 987 654 321",
                password: "123",
                role: "admin"
            }
        ];
    }

    saveUsers(users) {
        localStorage.setItem(this.storageKey, JSON.stringify(users));
    }

    switchTab(mode) {
        this.currentMode = mode;
        const btnLogin = document.getElementById("tab-login-btn");
        const btnRegister = document.getElementById("tab-register-btn");
        const formTitle = document.getElementById("form-main-title");
        const submitBtn = document.getElementById("auth-submit-btn");
        const toggleFooter = document.getElementById("toggle-mode-text");

        const rowGametag = document.getElementById("row-gametag-name");
        const rowEmail = document.getElementById("row-email-phone");
        const rowPass = document.getElementById("row-passwords");

        const wrapFullname = document.getElementById("wrapper-fullname");
        const wrapPhone = document.getElementById("wrapper-phone");
        const wrapConfirmPass = document.getElementById("wrapper-confirm-pass");
        const wrapSecurity = document.getElementById("wrapper-security-strength");
        const wrapAgreements = document.getElementById("wrapper-agreements");

        if (mode === "login") {
            if (btnLogin) btnLogin.className = "flex-1 py-2.5 text-xs font-mono font-bold rounded-lg bg-cyan-400 text-black shadow transition flex items-center justify-center gap-1.5";
            if (btnRegister) btnRegister.className = "flex-1 py-2.5 text-xs font-mono font-bold rounded-lg text-gray-400 hover:text-white transition flex items-center justify-center gap-1.5";
            
            if (formTitle) formTitle.innerText = "Đăng Nhập Rig NovaPad";
            if (submitBtn) submitBtn.innerHTML = '<svg class="w-4 h-4 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg> KẾT NỐI VÀO HỆ THỐNG';
            if (toggleFooter) toggleFooter.innerHTML = 'Chưa có tài khoản NovaPad ID? <span onclick="switchAuthTab(\'register\')" class="text-cyan-400 hover:underline font-bold cursor-pointer">TẠO HỒ SƠ MỚI</span>';

            if (wrapFullname) wrapFullname.style.display = "none";
            if (wrapPhone) wrapPhone.style.display = "none";
            if (wrapConfirmPass) wrapConfirmPass.style.display = "none";
            if (wrapSecurity) wrapSecurity.style.display = "none";
            if (wrapAgreements) wrapAgreements.style.display = "none";

            if (rowGametag) rowGametag.className = "grid grid-cols-1 gap-4";
            if (rowEmail) rowEmail.className = "grid grid-cols-1 gap-4";
            if (rowPass) rowPass.className = "grid grid-cols-1 gap-4";
        } else {
            if (btnRegister) btnRegister.className = "flex-1 py-2.5 text-xs font-mono font-bold rounded-lg bg-cyan-400 text-black shadow transition flex items-center justify-center gap-1.5";
            if (btnLogin) btnLogin.className = "flex-1 py-2.5 text-xs font-mono font-bold rounded-lg text-gray-400 hover:text-white transition flex items-center justify-center gap-1.5";
            
            if (formTitle) formTitle.innerText = "Tạo Hồ Sơ NovaPad ID";
            if (submitBtn) submitBtn.innerHTML = '<svg class="w-4 h-4 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg> ĐĂNG KÝ HỒ SƠ & KÍCH HOẠT QUÀ TẶNG';
            if (toggleFooter) toggleFooter.innerHTML = 'Đã có tài khoản NovaPad ID? <span onclick="switchAuthTab(\'login\')" class="text-cyan-400 hover:underline font-bold cursor-pointer">ĐĂNG NHẬP NGAY</span>';

            if (wrapFullname) wrapFullname.style.display = "block";
            if (wrapPhone) wrapPhone.style.display = "block";
            if (wrapConfirmPass) wrapConfirmPass.style.display = "block";
            if (wrapSecurity) wrapSecurity.style.display = "block";
            if (wrapAgreements) wrapAgreements.style.display = "block";

            if (rowGametag) rowGametag.className = "grid grid-cols-1 sm:grid-cols-2 gap-4";
            if (rowEmail) rowEmail.className = "grid grid-cols-1 sm:grid-cols-2 gap-4";
            if (rowPass) rowPass.className = "grid grid-cols-1 sm:grid-cols-2 gap-4";
        }
    }

    handleSubmit() {
        const gametag = document.getElementById("input-gametag")?.value.trim() || "";
        const email = document.getElementById("input-email")?.value.trim() || "";
        const password = document.getElementById("input-password")?.value || "";

        if (!gametag || !password) {
            alert("Vui lòng nhập đầy đủ Gametag đấu trường và Mật khẩu bảo mật!");
            return;
        }

        const users = this.getUsers();

        if (this.currentMode === "login") {
            const user = users.find(u => 
                (u.gametag.toLowerCase() === gametag.toLowerCase() || u.email.toLowerCase() === gametag.toLowerCase()) && 
                u.password === password
            );

            if (user) {
                localStorage.setItem(this.sessionKey, JSON.stringify(user));
                alert(`Chào mừng Pro Pilot [${user.gametag}] đã kết nối Rig thành công!`);
                window.location.href = "index.html";
            } else {
                alert("Sai Gametag/Email hoặc Mật khẩu bảo mật!");
            }
        } else {
            const fullname = document.getElementById("input-fullname")?.value.trim() || gametag;
            const phone = document.getElementById("input-phone")?.value.trim() || "";
            const confirmPass = document.getElementById("input-confirm-password")?.value || "";

            if (!email) {
                alert("Vui lòng nhập Email chính để nhận telemetry firmware!");
                return;
            }

            if (password !== confirmPass) {
                alert("Mật khẩu xác nhận không khớp!");
                return;
            }

            const exist = users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.gametag.toLowerCase() === gametag.toLowerCase());
            if (exist) {
                alert("Gametag hoặc Email này đã tồn tại trên hệ thống!");
                return;
            }

            // Tạo đối tượng từ class User
            const newUser = new User(fullname, email, phone, "Việt Nam", "member");
            newUser.id = Date.now();
            newUser.gametag = gametag;
            newUser.password = password;

            users.push(newUser);
            this.saveUsers(users);
            localStorage.setItem(this.sessionKey, JSON.stringify(newUser));

            alert(`Chúc mừng Pilot [${gametag}]! Hồ sơ đã kích hoạt thành công.`);
            window.location.href = "index.html";
        }
    }
}

// Khởi tạo instance và adapter gọi từ HTML
const authCtrl = new AuthController();

function switchAuthTab(mode) {
    authCtrl.switchTab(mode);
}

function handleAuthSubmit() {
    authCtrl.handleSubmit();
}