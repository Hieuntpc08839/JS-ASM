// app/controllers/cartController.js
import Cart from "../models/Cart.js";

class CartController {
    constructor() {
        this.cart = new Cart();
        this.container = document.getElementById("cart-table-body");
    }

    render() {
        if (!this.container) return;

        const countBadge = document.getElementById("cart-items-count");
        const subtotalEl = document.getElementById("cart-subtotal");
        const grandTotalEl = document.getElementById("cart-grand-total");
        const discountEl = document.getElementById("cart-discount");

        // Cập nhật số lượng và tổng tiền dạng VNĐ
        if (countBadge) countBadge.innerText = this.cart.totalCount;
        if (subtotalEl) subtotalEl.innerText = Number(this.cart.totalAmount).toLocaleString("vi-VN") + " đ";
        if (grandTotalEl) grandTotalEl.innerText = Number(this.cart.totalAmount).toLocaleString("vi-VN") + " đ";
        if (discountEl) discountEl.innerText = "0 đ";

        // Đồng bộ Header
        this.updateHeaderCart();

        // Nếu giỏ hàng trống
        if (this.cart.items.length === 0) {
            this.container.innerHTML = `
                <div class="p-12 text-center space-y-4">
                    <p class="text-sm font-mono text-gray-400">Giỏ hàng tác chiến của bạn hiện đang trống.</p>
                    <a href="products.html" class="inline-block bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold font-mono px-5 py-2.5 rounded-lg transition">
                        KHÁM PHÁ CATALOG &rarr;
                    </a>
                </div>
            `;
            return;
        }

        // Render từng hàng sản phẩm trong giỏ
        this.container.innerHTML = "";
        this.cart.items.forEach((item, index) => {
            const row = document.createElement("div");
            row.className = "p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#090e1c] transition";
            const itemPrice = Number(item.price) || 0;
            const itemQty = Number(item.quantity) || 1;
            const rowTotal = itemPrice * itemQty;

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
                    <!-- Cụm tăng giảm số lượng -->
                    <div class="flex items-center border border-gray-800 bg-[#0d1424] rounded-lg h-9">
                        <button class="btn-minus w-8 h-full text-gray-400 hover:text-white flex items-center justify-center font-bold text-sm" title="Giảm số lượng">&minus;</button>
                        <span class="w-8 text-center text-xs font-bold text-white">${itemQty}</span>
                        <button class="btn-plus w-8 h-full text-gray-400 hover:text-white flex items-center justify-center font-bold text-sm" title="Tăng số lượng">&plus;</button>
                    </div>

                    <!-- Thành tiền từng dòng -->
                    <div class="text-right min-w-[120px]">
                        <span class="text-sm font-bold text-cyan-400 block">${rowTotal.toLocaleString("vi-VN")} đ</span>
                    </div>

                    <!-- Nút xóa -->
                    <button class="btn-del text-gray-500 hover:text-red-400 transition p-1" title="Xóa thiết bị khỏi giỏ">✕</button>
                </div>
            `;

            // Bắt sự kiện giảm số lượng
            row.querySelector(".btn-minus").addEventListener("click", () => {
                if (item.quantity > 1) {
                    item.quantity -= 1;
                    this.cart.saveCart();
                } else {
                    this.cart.removeItem(index);
                }
                this.render();
            });

            // Bắt sự kiện tăng số lượng
            row.querySelector(".btn-plus").addEventListener("click", () => {
                item.quantity += 1;
                this.cart.saveCart();
                this.render();
            });

            // Bắt sự kiện xóa món
            row.querySelector(".btn-del").addEventListener("click", () => {
                this.cart.removeItem(index);
                this.render();
            });

            this.container.append(row);
        });
    }

    updateHeaderCart() {
        const badge = document.getElementById("header-cart-badge");
        const total = document.getElementById("header-cart-total");
        if (badge) badge.innerText = this.cart.totalCount;
        if (total) total.innerText = Number(this.cart.totalAmount).toLocaleString("vi-VN") + " đ";
    }

    init() {
        this.render();

        // Bắt sự kiện nút "XÓA TOÀN BỘ"
        const clearBtn = document.getElementById("btn-clear-cart");
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                if (this.cart.items.length === 0) return;
                if (confirm("Bạn có chắc chắn muốn làm trống toàn bộ giỏ hàng tác chiến?")) {
                    this.cart.clear();
                    this.render();
                }
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new CartController().init();
});