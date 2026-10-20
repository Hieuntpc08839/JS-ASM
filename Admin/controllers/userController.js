import { getUsers, registerUserApi } from "../../app/services/api.js";

// 1. Render danh sách Người dùng từ API
export async function renderUsers() {
    const users = await getUsers();
    const tbody = document.getElementById("user-table-body");
    if (!tbody) return;

    if (!users || users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-6 text-slate-500 font-mono">Không có dữ liệu người dùng.</td></tr>`;
        return;
    }

    tbody.innerHTML = users.map(item => {
        let roleClass = 'bg-slate-800 text-slate-300 border-slate-700';
        if (item.role === 'SUPER ADMIN') roleClass = 'bg-purple-600/30 text-purple-300 border-purple-500/50';
        if (item.role === 'VIP PILOT' || item.role === 'PRO PILOT') roleClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
        if (item.role === 'MODERATOR') roleClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';

        const statusHTML = (item.status === 'BANNED') 
            ? `<span class="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30">&bull; HWID BANNED</span>`
            : `<span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">&bull; ACTIVE</span>`;

        return `
            <tr class="hover:bg-slate-800/40 transition-colors border-b border-slate-800/60">
                <td class="py-3.5 px-4">
                    <div class="flex items-center space-x-3">
                        <img src="${item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}" class="w-9 h-9 rounded border border-slate-700 object-cover shrink-0" alt="Avatar">
                        <div>
                            <div class="font-bold text-slate-100 font-mono text-sm">${item.username || item.gametag || 'Pilot'}</div>
                            <div class="text-[10px] text-cyan-400 font-mono">${item.level || 'LVL.01'}</div>
                        </div>
                    </div>
                </td>
                <td class="py-3.5 px-4 font-medium text-slate-200">${item.name || 'Thành Viên'}</td>
                <td class="py-3.5 px-4 font-mono text-slate-300">
                    <div class="text-cyan-400 hover:underline cursor-pointer">${item.email || ''}</div>
                    <div class="text-[10px] text-slate-500">${item.phone || ''}</div>
                </td>
                <td class="py-3.5 px-4">
                    <span class="px-2.5 py-1 rounded text-[10px] font-mono font-bold border ${roleClass}">${item.role || 'THANH VIEN'}</span>
                </td>
                <td class="py-3.5 px-4 font-mono text-slate-300">${item.hwid || 'HWID-DEFAULT'}</td>
                <td class="py-3.5 px-4 font-mono text-slate-400">${item.date || '2026-10-18'}</td>
                <td class="py-3.5 px-4">${statusHTML}</td>
                <td class="py-3.5 px-4 text-right">
                    <div class="flex items-center justify-end space-x-2">
                        <button class="px-2 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30 text-[11px] font-medium transition-all">Sửa</button>
                        <button class="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/30 text-[11px] font-medium transition-all">Khóa HWID</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// 2. Thêm Người dùng mới
export function initUserModule() {
    const btnAdd = document.getElementById("btn-open-add");
    if (btnAdd) {
        btnAdd.addEventListener("click", async () => {
            const username = prompt("Nhập Gametag/Username mới:");
            const email = prompt("Nhập Email:");
            if (username && email) {
                const newUser = {
                    username: username,
                    email: email,
                    role: "THANH VIEN",
                    status: "ACTIVE",
                    date: new Date().toLocaleDateString("vi-VN")
                };
                await registerUserApi(newUser);
                renderUsers();
            }
        });
    }

    renderUsers();
}

document.addEventListener("DOMContentLoaded", () => {
    initUserModule();
});