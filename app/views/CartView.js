import Component from "./Component.js";

export default class CartView extends Component {
    constructor(renderHookId = "#cart-table-body") {
        super(renderHookId);
        this.countBadge = document.getElementById("cart-items-count");
        this.subtotalEl = document.getElementById("cart-subtotal");
        this.grandTotalEl = document.getElementById("cart-grand-total");
    }

    render(cartItems = [], totalCount = 0, totalAmount = 0, onQtyChange, onRemoveItem) {
        const hook = document.querySelector(this.hookId) || document.getElementById(this.hookId.replace("#", ""));
        if (!hook) return;

        // Cập nhật các chỉ số tổng quan
        if (this.countBadge) this.countBadge.innerText = totalCount;
        if (this.subtotalEl) this.subtotalEl.innerText = Number(totalAmount).toLocaleString("vi-VN") + " đ";
        if (this.grandTotalEl) this.grandTotalEl.innerText = Number(totalAmount).toLocaleString("vi-VN") + " đ";

        hook.innerHTML = "";

        // Trạng thái giỏ trống
        if (cartItems.length === 0) {
            hook.innerHTML = `
                <div class="p-12 text-center space-y-4">
                    <svg class="w-16 h-16 text-gray-600 mx-auto fill-none stroke-current" stroke-width="1.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p class="text-sm font-mono text-gray-400">Giỏ hàng tác chiến của bạn hiện đang trống.</p>
                    <a href="products.html" class="inline-block bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold font-mono px-5 py-2.5 rounded-lg transition">
                        KHÁM PHÁ CATALOG &rarr;
                    </a>
                </div>
            `;
            return;
        }

        // Vẽ từng hàng sản phẩm
        cartItems.forEach((item, index) => {
            const itemPrice = Number(item.price) || 0;
            const itemQty = Number(item.quantity) || 1;
            const rowTotal = itemPrice * itemQty;

            const row = document.createElement("div");
            row.className = "p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#090e1c] transition border-b border-gray-800/80";

            row.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-black/50 border border-gray-800 rounded-xl overflow-hidden p-1 shrink-0 flex items-center justify-center">
                        <img src="${item.image}" alt="${item.name}" class="h-full object-contain">
                    </div>
                    <div>
                        <h4 class="text-white font-bold text-sm font-mono hover:text-cyan-400 transition">${item.name}</h4>
                        <div class="text-[11px] text-gray-400 font-mono mt-0.5">
                            Đơn giá: <strong class="text-white">${itemPrice.toLocaleString("vi-VN")} đ</strong>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-between sm:justify-end gap-6 font-mono">
                    <!-- Tăng giảm số lượng -->
                    <div class="flex items-center border border-gray-800 bg-[#0d1424] rounded-lg h-9">
                        <button class="btn-minus w-8 h-full text-gray-400 hover:text-white flex items-center justify-center font-bold text-sm" title="Giảm số lượng">&minus;</button>
                        <span class="w-8 text-center text-xs font-bold text-white">${itemQty}</span>
                        <button class="btn-plus w-8 h-full text-gray-400 hover:text-white flex items-center justify-center font-bold text-sm" title="Tăng số lượng">&plus;</button>
                    </div>

                    <!-- Thành tiền -->
                    <div class="text-right min-w-[120px]">
                        <span class="text-sm font-bold text-cyan-400 block">${rowTotal.toLocaleString("vi-VN")} đ</span>
                    </div>

                    <!-- Nút xóa -->
                    <button class="btn-del text-gray-500 hover:text-red-400 transition p-1" title="Xóa thiết bị khỏi giỏ">✕</button>
                </div>
            `;

            // Gọi các callback logic được truyền từ Controller sang
            row.querySelector(".btn-minus").addEventListener("click", () => onQtyChange(index, -1));
            row.querySelector(".btn-plus").addEventListener("click", () => onQtyChange(index, 1));
            row.querySelector(".btn-del").addEventListener("click", () => onRemoveItem(index));

            hook.append(row);
        });
    }
}