class CartController {
    init() {
        this.renderCart();
        this.updateHeaderCart();
    }

    renderCart() {
        const container = document.getElementById("cart-table-body");
        const countBadge = document.getElementById("cart-items-count");
        const subtotalEl = document.getElementById("cart-subtotal");
        const grandTotalEl = document.getElementById("cart-grand-total");

        if (!container || typeof CartModel === "undefined") return;

        const cart = CartModel.getCart();
        const totalCount = CartModel.getTotalCount();
        const totalAmount = CartModel.getTotalAmount();

        if (countBadge) countBadge.innerText = totalCount;
        if (subtotalEl) subtotalEl.innerText = `$${totalAmount.toFixed(2)}`;
        if (grandTotalEl) grandTotalEl.innerText = `$${totalAmount.toFixed(2)}`;

        // Nếu giỏ trống
        if (cart.length === 0) {
            container.innerHTML = `
                <div class="p-12 text-center space-y-4">
                    <svg class="w-16 h-16 text-gray-600 mx-auto fill-none stroke-current" stroke-width="1.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p class="text-sm font-mono text-gray-400">Giỏ hàng của bạn đang trống.</p>
                    <a href="products.html" class="inline-block bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold font-mono px-5 py-2.5 rounded-lg transition">
                        KHÁM PHÁ CATALOG &rarr;
                    </a>
                </div>
            `;
            return;
        }

        // Render từng dòng thiết bị
        container.innerHTML = "";
        cart.forEach((item, index) => {
            const row = document.createElement("div");
            row.className = "p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#090e1c] transition";

            const itemName = item.name || item.title || "Thiết bị Gaming";
            const itemPrice = Number(item.price) || 0;
            const itemQty = Number(item.quantity) || 1;

            row.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-black/50 border border-gray-800 rounded-xl overflow-hidden p-1 shrink-0 flex items-center justify-center">
                        <img src="${item.image}" alt="${itemName}" class="h-full object-contain">
                    </div>
                    <div>
                        <h4 class="text-white font-bold text-sm font-mono hover:text-cyan-400 transition">${itemName}</h4>
                        <div class="text-[11px] text-gray-400 font-mono mt-0.5">Đơn giá: <strong class="text-white">$${itemPrice.toFixed(2)}</strong></div>
                    </div>
                </div>

                <div class="flex items-center justify-between sm:justify-end gap-6 font-mono">
                    <!-- Tăng giảm số lượng -->
                    <div class="flex items-center border border-gray-800 bg-[#0d1424] rounded-lg h-9">
                        <button onclick="window.cartCtrl.changeQuantity(${index}, -1)" class="w-8 h-full text-gray-400 hover:text-white flex items-center justify-center font-bold text-sm">&minus;</button>
                        <span class="w-8 text-center text-xs font-bold text-white">${itemQty}</span>
                        <button onclick="window.cartCtrl.changeQuantity(${index}, 1)" class="w-8 h-full text-gray-400 hover:text-white flex items-center justify-center font-bold text-sm">&plus;</button>
                    </div>

                    <!-- Thành tiền -->
                    <div class="text-right min-w-[80px]">
                        <span class="text-sm font-bold text-cyan-400 block">$${(itemPrice * itemQty).toFixed(2)}</span>
                    </div>

                    <!-- Nút xóa -->
                    <button onclick="window.cartCtrl.removeItem(${index})" class="text-gray-500 hover:text-red-400 transition p-1" title="Xóa thiết bị">
                        <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `;
            container.append(row);
        });
    }

    changeQuantity(index, delta) {
        const cart = CartModel.getCart();
        if (cart[index]) {
            cart[index].quantity = (Number(cart[index].quantity) || 1) + delta;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1);
            }
            CartModel.saveCart(cart);
            this.renderCart();
            this.updateHeaderCart();
        }
    }

    removeItem(index) {
        const cart = CartModel.getCart();
        if (cart[index]) {
            const removedName = cart[index].name || "Thiết bị";
            cart.splice(index, 1);
            CartModel.saveCart(cart);
            this.renderCart();
            this.updateHeaderCart();
            this.showToast(`Đã xóa ${removedName} khỏi giỏ hàng!`);
        }
    }

    clearCart() {
        if (confirm("Bạn có chắc chắn muốn làm trống toàn bộ giỏ hàng?")) {
            CartModel.saveCart([]);
            this.renderCart();
            this.updateHeaderCart();
            this.showToast("Giỏ hàng đã được làm trống!");
        }
    }

    updateHeaderCart() {
        CartModel.updateHeaderCart();
    }

    showToast(msg) {
        const toast = document.getElementById("cart-toast");
        if (!toast) return;
        toast.innerHTML = `<svg class="w-5 h-5 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> <span>${msg}</span>`;
        toast.classList.remove("opacity-0", "translate-y-10", "pointer-events-none");
        setTimeout(() => {
            toast.classList.add("opacity-0", "translate-y-10", "pointer-events-none");
        }, 2000);
    }
}

// Gán trực tiếp vào window để các nút onclick nhận diện được
window.cartCtrl = new CartController();
window.handleClearCart = function() {
    window.cartCtrl.clearCart();
};

document.addEventListener("DOMContentLoaded", () => {
    window.cartCtrl.init();
});