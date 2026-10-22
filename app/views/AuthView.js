// app/views/AuthView.js
import BaseView from './BaseView.js';

export default class AuthView extends BaseView {
    renderLogin() {
        this.setHTML(`
        <main class="max-w-[1280px] w-full mx-auto px-4 lg:px-8 py-8 my-auto">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <!-- CỘT TRÁI: PREVIEW RIG -->
                <div class="lg:col-span-5 bg-[#070b16] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                    <div class="flex items-center justify-between text-[10px] font-mono border-b border-gray-800/80 pb-3 mb-4">
                        <span class="text-cyan-400 font-bold flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block animate-ping"></span>
                            ĐĂNG NHẬP RIG // PILOT AUTHENTICATION
                        </span>
                        <span class="text-gray-500">REV. 04.9X</span>
                    </div>

                    <div class="relative bg-[#040711] border border-gray-800/80 rounded-xl p-4 my-2 overflow-hidden flex flex-col items-center">
                        <div class="w-full flex justify-between text-[9px] font-mono mb-2">
                            <span class="text-cyan-400 border border-cyan-800/60 bg-cyan-950/40 px-2 py-0.5 rounded font-bold">HALL EFFECT V2.4</span>
                            <span class="text-purple-400 border border-purple-800/60 bg-purple-950/40 px-2 py-0.5 rounded font-bold">8000HZ POLLING RATE</span>
                        </div>

                        <div class="h-48 sm:h-52 w-full flex items-center justify-center my-2">
                            <img src="https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600&auto=format&fit=crop&q=80" 
                                 alt="Apex Pro Pilot Rig" 
                                 class="max-h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,240,255,0.25)]">
                        </div>

                        <div class="w-full flex justify-between items-center text-[10px] font-mono pt-2 border-t border-gray-800/60 text-gray-400">
                            <span class="flex items-center gap-1 text-cyan-400">
                                <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> APEX PRO PILOT RIG
                            </span>
                            <span class="text-gray-500">OPTICAL ZERO JITTER</span>
                        </div>
                    </div>

                    <div class="space-y-3 mt-4">
                        <div class="flex items-center justify-between text-xs font-mono">
                            <span class="text-cyan-400 font-bold uppercase flex items-center gap-1.5">TRUY CẬP HỆ SINH THÁI ĐỘC QUYỀN</span>
                            <span class="text-[10px] text-cyan-300 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded font-bold">CLOUD SYNC</span>
                        </div>
                    </div>
                </div>

                <!-- CỘT PHẢI: FORM ĐĂNG NHẬP -->
                <div class="lg:col-span-7 bg-[#070b16] border border-gray-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between text-[10px] font-mono border-b border-gray-800 pb-3 mb-4">
                            <span class="text-cyan-400 uppercase font-semibold">HỆ THỐNG ĐỊNH DANH ESPORTS // NOVAPAD</span>
                            <span class="text-gray-500 font-bold bg-gray-900 border border-gray-800 px-2 py-0.5 rounded">HW-SYNC PROTOCOL</span>
                        </div>

                        <h1 class="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-1">Đăng Nhập Rig NovaPad</h1>
                        <p class="text-xs text-gray-400 mb-6">Xác thực danh tính Pilot để đồng bộ dữ liệu và vào trang quản trị hoặc đơn hàng cá nhân.</p>

                        <form id="auth-form" class="space-y-4">
                            <div>
                                <div class="flex justify-between text-[11px] font-mono mb-1">
                                    <span class="text-gray-400">GAMETAG HOẶC EMAIL</span>
                                    <small class="error text-red-400 font-bold" data-error="username"></small>
                                </div>
                                <input name="username" placeholder="pilot@novapad.gg hoặc ShadowAim_VN" class="w-full bg-[#040711] border border-gray-800 text-xs text-white px-3 py-3 rounded-lg focus:outline-none focus:border-cyan-400 font-mono">
                            </div>

                            <div>
                                <div class="flex justify-between text-[11px] font-mono mb-1">
                                    <span class="text-gray-400">MẬT KHẨU BẢO MẬT</span>
                                    <small class="error text-red-400 font-bold" data-error="password"></small>
                                </div>
                                <input name="password" type="password" placeholder="••••••••" class="w-full bg-[#040711] border border-gray-800 text-xs text-white px-3 py-3 rounded-lg focus:outline-none focus:border-cyan-400 font-mono">
                            </div>

                            <small class="error text-red-400 block font-mono text-xs" data-error="general"></small>

                            <button type="submit" class="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs font-mono uppercase py-4 rounded-xl transition shadow-[0_0_25px_rgba(0,240,255,0.35)] mt-4 cursor-pointer">
                                KẾT NỐI VÀO HỆ THỐNG
                            </button>
                        </form>
                    </div>

                    <div class="pt-6 text-center font-mono text-xs">
                        <p class="text-gray-400 text-[11px] sm:text-xs">
                            Chưa có tài khoản NovaPad ID? <a href="#/register" class="text-cyan-400 hover:underline font-bold">TẠO HỒ SƠ MỚI NGAY</a>
                        </p>
                    </div>
                </div>
            </div>
        </main>
        `);
    }

    renderRegister() {
        this.setHTML(`
        <main class="max-w-[1280px] w-full mx-auto px-4 lg:px-8 py-8 my-auto">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <!-- CỘT TRÁI: QUÀ TẶNG TÂN THỦ -->
                <div class="lg:col-span-5 bg-[#070b16] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                    <div class="flex items-center justify-between text-[10px] font-mono border-b border-gray-800/80 pb-3 mb-4">
                        <span class="text-cyan-400 font-bold">KHỞI TẠO TÀI KHOẢN // NEW PILOT ONBOARDING</span>
                    </div>
                    <div class="p-3 bg-[#040711] border border-gray-800/80 rounded-xl">
                        <div class="text-white font-bold text-xs">Gói Preset Pro Aim v4.2 Miễn Phí</div>
                    </div>
                </div>

                <!-- CỘT PHẢI: FORM ĐĂNG KÝ -->
                <div class="lg:col-span-7 bg-[#070b16] border border-gray-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                        <h1 class="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-2">Tạo Hồ Sơ NovaPad ID</h1>
                        <p class="text-xs text-gray-400 mb-6">Gia nhập hệ sinh thái thiết bị ngoại vi chuyên nghiệp.</p>

                        <form id="auth-form" class="space-y-4">
                            <div>
                                <div class="flex justify-between text-[11px] font-mono mb-1">
                                    <span class="text-gray-400">HỌ VÀ TÊN</span>
                                    <small class="error text-red-400 font-bold" data-error="fullname"></small>
                                </div>
                                <input name="fullname" placeholder="Nguyễn Văn Bảo Long" class="w-full bg-[#040711] border border-gray-800 text-xs text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-cyan-400 font-mono">
                            </div>

                            <div>
                                <div class="flex justify-between text-[11px] font-mono mb-1">
                                    <span class="text-gray-400">TÊN ĐĂNG NHẬP / GAMETAG</span>
                                    <small class="error text-red-400 font-bold" data-error="username"></small>
                                </div>
                                <input name="username" placeholder="ShadowAim_VN" class="w-full bg-[#040711] border border-gray-800 text-xs text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-cyan-400 font-mono">
                            </div>

                            <div>
                                <div class="flex justify-between text-[11px] font-mono mb-1">
                                    <span class="text-gray-400">MẬT KHẨU BẢO MẬT</span>
                                    <small class="error text-red-400 font-bold" data-error="password"></small>
                                </div>
                                <input name="password" type="password" placeholder="••••••••" class="w-full bg-[#040711] border border-gray-800 text-xs text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-cyan-400 font-mono">
                            </div>

                            <div>
                                <div class="flex justify-between text-[11px] font-mono mb-1">
                                    <span class="text-gray-400">XÁC NHẬN MẬT KHẨU</span>
                                    <small class="error text-red-400 font-bold" data-error="confirm"></small>
                                </div>
                                <input name="confirm" type="password" placeholder="••••••••" class="w-full bg-[#040711] border border-gray-800 text-xs text-white px-3 py-2.5 rounded-lg focus:outline-none focus:border-cyan-400 font-mono">
                            </div>

                            <small class="error text-red-400 block font-mono text-xs" data-error="general"></small>

                            <button type="submit" class="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs font-mono uppercase py-4 rounded-xl transition shadow-[0_0_25px_rgba(0,240,255,0.35)] mt-4 cursor-pointer">
                                ĐĂNG KÝ HỒ SƠ &amp; KÍCH HOẠT QUÀ TẶNG
                            </button>
                        </form>
                    </div>

                    <div class="pt-6 text-center font-mono text-xs">
                        <p class="text-gray-400 text-[11px] sm:text-xs">
                            Đã có tài khoản NovaPad ID? <a href="#/login" class="text-cyan-400 hover:underline font-bold">ĐĂNG NHẬP NGAY</a>
                        </p>
                    </div>
                </div>
            </div>
        </main>
        `);
    }

    bindSubmit(handler) {
        const form = this.$('#auth-form');
        if (form) {
            form.addEventListener('submit', e => {
                e.preventDefault();
                handler(this.getFormData(form));
            });
        }
    }

    // Hiển thị Tên người dùng và nút Đăng xuất lên Header
    static renderMenu(user) {
        const el = document.getElementById('auth-menu');
        if (!el) return;

        if (!user) {
            el.innerHTML = `
                <a href="#/login" class="w-9 h-9 rounded-full bg-cyan-400 text-black flex items-center justify-center transition shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.4)]" title="Đăng nhập tài khoản">
                    <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </a>
            `;
            return;
        }

        const displayName = user.fullname || user.username || "Pilot";
        el.innerHTML = `
            <div class="flex items-center gap-2 text-xs font-mono bg-[#0a101d] border border-gray-800 px-3 h-9 rounded text-gray-300">
                ${user.role === 'admin' ? '<a href="#/admin/products" class="text-cyan-400 hover:underline font-bold mr-1">QUẢN TRỊ</a> ' : ''}
                <span class="text-cyan-400 font-bold truncate max-w-[120px]">[${displayName}]</span>
                <a href="#/logout" class="text-gray-400 hover:text-red-400 transition ml-1 uppercase text-[10px] font-bold border-l border-gray-700 pl-2">Đăng xuất</a>
            </div>
        `;
    }
}