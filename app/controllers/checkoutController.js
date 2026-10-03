
class CheckoutController {
    constructor() {
        this.shippingFee = 0;
        this.discountVIP = 20.00;
        this.selectedPayment = "card";
    }

    init() {
        this.renderCheckoutItems();
        this.updateSummary();
    }

    renderCheckoutItems() {
        const container = document.getElementById("checkout-items-list");
        if (!container || typeof CartModel === "undefined") return;

        const cart = CartModel.getCart();
        if (cart.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-gray-500 font-mono text-xs">
                    Giỏ hàng của bạn đang trống. Vui lòng chọn thiết bị trước khi thanh toán!
                </div>
            `;
            return;
        }

        container.innerHTML = "";
        cart.forEach((item, index) => {
            const itemRow = document.createElement("div");
            itemRow.className = "p-4 sm:p-5 flex items-center justify-between gap-4";
            itemRow.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-black/40 border border-gray-800 rounded-xl overflow-hidden p-1 shrink-0 flex items-center justify-center">
                        <img src="${item.image}" alt="${item.name}" class="h-full object-contain">
                    </div>
                    <div>
                        <h4 class="text-white font-bold text-sm font-mono">${item.name}</h4>
                        <div class="text-[11px] text-gray-400 font-mono mt-1">Đơn giá: $${Number(item.price).toFixed(2)}</div>
                    </div>
                </div>
                <div class="flex items-center gap-4 font-mono">
                    <span class="text-xs text-gray-400">SL: <strong class="text-white">${item.quantity}</strong></span>
                    <span class="text-sm font-bold text-cyan-400">$${(item.price * item.quantity).toFixed(2)}</span>
                    <button onclick="checkoutCtrl.removeItem(${index})" class="text-gray-500 hover:text-red-400 transition text-xs font-bold px-1" title="Xóa thiết bị">✕</button>
                </div>
            `;
            container.append(itemRow);
        });
    }

    removeItem(index) {
        const cart = CartModel.getCart();
        if (cart[index]) {
            cart.splice(index, 1);
            CartModel.saveCart(cart);
            this.renderCheckoutItems();
            this.updateSummary();
            this.updateHeaderCartView();
        }
    }

    updateSummary() {
        if (typeof CartModel === "undefined") return;
        const subtotal = CartModel.getTotalAmount();
        const count = CartModel.getTotalCount();

        const countEl = document.getElementById("summary-count");
        const subtotalEl = document.getElementById("summary-subtotal");
        const shippingEl = document.getElementById("summary-shipping");
        const totalEl = document.getElementById("summary-total");
        const totalVndEl = document.getElementById("summary-total-vnd");

        if (countEl) countEl.innerText = `(${count} thiết bị):`;
        if (subtotalEl) subtotalEl.innerText = `$${subtotal.toFixed(2)}`;

        if (shippingEl) {
            shippingEl.innerText = this.shippingFee === 0 ? "MIỄN PHÍ (FREE)" : `$${this.shippingFee.toFixed(2)}`;
        }

        const discount = subtotal > 0 ? this.discountVIP : 0;
        const finalTotal = Math.max(0, subtotal - discount + this.shippingFee);

        if (totalEl) totalEl.innerText = `$${finalTotal.toFixed(2)}`;
        if (totalVndEl) totalVndEl.innerText = `~ ${(finalTotal * 25400).toLocaleString("vi-VN")} VND`;
    }

    selectShipping(type, fee, element) {
        this.shippingFee = fee;
        document.querySelectorAll(".shipping-card").forEach(card => {
            card.className = "shipping-card p-4 rounded-xl border border-gray-800 bg-[#080d18] cursor-pointer transition flex items-start gap-3 flex-1";
            const dot = card.querySelector("span");
            if (dot) dot.className = "w-3.5 h-3.5 rounded-full border-2 border-gray-600 mt-1 shrink-0";
        });

        element.className = "shipping-card p-4 rounded-xl border border-cyan-400 bg-cyan-950/20 cursor-pointer transition flex items-start gap-3 flex-1";
        const activeDot = element.querySelector("span");
        if (activeDot) activeDot.className = "w-3.5 h-3.5 rounded-full border-2 border-cyan-400 bg-cyan-400 mt-1 shrink-0";

        this.updateSummary();
    }

    switchTab(method, element) {
        this.selectedPayment = method;
        document.querySelectorAll(".payment-tab-btn").forEach(btn => {
            btn.className = "payment-tab-btn flex-1 py-3 text-xs font-mono font-semibold rounded-lg text-gray-400 hover:text-white transition flex items-center justify-center gap-2";
        });
        element.className = "payment-tab-btn flex-1 py-3 text-xs font-mono font-semibold rounded-lg bg-[#0d1424] text-white border border-gray-700 shadow transition flex items-center justify-center gap-2";

        const cardForm = document.getElementById("card-payment-form");
        const qrBox = document.getElementById("qr-payment-box");
        if (method === "card") {
            if (cardForm) cardForm.style.display = "block";
            if (qrBox) qrBox.style.display = "none";
        } else {
            if (cardForm) cardForm.style.display = "none";
            if (qrBox) qrBox.style.display = "block";
        }
    }

    async confirmOrder() {
        const cart = CartModel.getCart();
        if (cart.length === 0) {
            alert("Giỏ hàng của bạn đang trống! Vui lòng chọn thiết bị tác chiến.");
            return;
        }

        const fullname = document.getElementById("input-fullname")?.value.trim() || "Pro Pilot";
        const phone = document.getElementById("input-phone")?.value.trim() || "";
        const email = document.getElementById("input-email")?.value.trim() || "";
        const address = document.getElementById("input-address")?.value.trim() || "";

        const orderCode = "#NV-" + Math.floor(1000 + Math.random() * 9000);
        const subtotal = CartModel.getTotalAmount();
        const finalPrice = Math.max(0, subtotal - (subtotal > 0 ? this.discountVIP : 0) + this.shippingFee);

        const newOrder = {
            order_code: orderCode,
            user_id: 1,
            customer_name: fullname,
            phone: phone,
            email: email,
            address: address,
            total_price: finalPrice,
            payment_method: this.selectedPayment,
            created_date: new Date().toISOString(),
            status: "pending",
            items: cart
        };

        // Gửi lên json-server nếu đang bật, hoặc lưu cục bộ
        if (typeof ApiService !== "undefined" && typeof ApiService.createOrder === "function") {
            await ApiService.createOrder(newOrder);
        } else {
            const orders = JSON.parse(localStorage.getItem("novapad_orders")) || [];
            orders.push(newOrder);
            localStorage.setItem("novapad_orders", JSON.stringify(orders));
        }

        // Dọn giỏ hàng và hoàn tất
        CartModel.saveCart([]);
        this.updateHeaderCartView();
        alert(`Chúc mừng Pilot [${fullname}]! Đơn hàng ${orderCode} đã được khởi tạo thành công.`);
        window.location.href = "index.html";
    }

    updateHeaderCartView() {
        if (typeof CartModel !== "undefined") {
            const badge = document.getElementById("header-cart-badge");
            const total = document.getElementById("header-cart-total");
            if (badge) badge.innerText = CartModel.getTotalCount();
            if (total) total.innerText = "$" + CartModel.getTotalAmount().toFixed(2);
        }
    }
}

// Khởi tạo instance và adapter cho các hàm gọi từ HTML
const checkoutCtrl = new CheckoutController();

function selectShipping(type, fee, el) { 
    checkoutCtrl.selectShipping(type, fee, el); 
}

function switchPaymentTab(method, el) { 
    checkoutCtrl.switchTab(method, el); 
}

function handleConfirmOrder() { 
    checkoutCtrl.confirmOrder(); 
}

document.addEventListener("DOMContentLoaded", () => {
    checkoutCtrl.init();
});