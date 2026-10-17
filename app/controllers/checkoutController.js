import Cart from "../models/Cart.js";
import { createOrder } from "../services/api.js";

class CheckoutController {
    constructor() {
        this.cart = new Cart();
        this.shippingFee = 0;
        this.discountVIP = 500000; // Giảm 500.000 đ cho VIP2025
        this.selectedPayment = "card";
        this.sessionKey = "novapad_current_user";
    }

    // Tự động điền thông tin nếu đã đăng nhập
    fillUserInfoIfLoggedIn() {
        const currentUser = JSON.parse(localStorage.getItem(this.sessionKey));
        if (currentUser) {
            const nameEl = document.getElementById("input-fullname");
            const phoneEl = document.getElementById("input-phone");
            const emailEl = document.getElementById("input-email");
            const addressEl = document.getElementById("input-address");

            if (nameEl && !nameEl.value) nameEl.value = currentUser.name || currentUser.gametag || "";
            if (phoneEl && !phoneEl.value) phoneEl.value = currentUser.phone || "";
            if (emailEl && !emailEl.value) emailEl.value = currentUser.email || "";
            if (addressEl && !addressEl.value) addressEl.value = currentUser.address || "";
        }
    }

    updateHeaderCartView() {
        const badge = document.getElementById("header-cart-badge");
        const total = document.getElementById("header-cart-total");
        if (badge) badge.innerText = this.cart.totalCount;
        if (total) total.innerText = Number(this.cart.totalAmount).toLocaleString("vi-VN") + " đ";
    }

    // Render danh sách thiết bị cần thanh toán
    renderCheckoutItems() {
        const container = document.getElementById("checkout-items-list");
        if (!container) return;

        if (this.cart.items.length === 0) {
            container.innerHTML = `
                <div class="py-10 text-center text-gray-500 font-mono text-xs">
                    Giỏ hàng của bạn đang trống. Vui lòng quay lại catalog chọn thiết bị trước khi thanh toán!
                </div>
            `;
            return;
        }

        container.innerHTML = "";
        this.cart.items.forEach((item, index) => {
            const itemRow = document.createElement("div");
            itemRow.className = "py-4 flex items-center justify-between gap-4";
            const itemPrice = Number(item.price) || 0;
            const itemQty = Number(item.quantity) || 1;
            const rowTotal = itemPrice * itemQty;

            itemRow.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-black/40 border border-gray-800 rounded-xl overflow-hidden p-1 shrink-0 flex items-center justify-center">
                        <img src="${item.image}" alt="${item.name}" class="h-full object-contain">
                    </div>
                    <div>
                        <h4 class="text-white font-bold text-sm font-mono">${item.name}</h4>
                        <div class="text-[11px] text-gray-400 font-mono mt-0.5">Đơn giá: ${itemPrice.toLocaleString("vi-VN")} đ</div>
                    </div>
                </div>
                <div class="flex items-center gap-4 font-mono">
                    <span class="text-xs text-gray-400">SL: <strong class="text-white">${itemQty}</strong></span>
                    <span class="text-sm font-bold text-cyan-400">${rowTotal.toLocaleString("vi-VN")} đ</span>
                    <button class="btn-remove-item text-gray-500 hover:text-red-400 transition text-xs font-bold px-1" title="Xóa thiết bị">✕</button>
                </div>
            `;

            // Xóa món
            itemRow.querySelector(".btn-remove-item").addEventListener("click", () => {
                this.cart.removeItem(index);
                this.renderCheckoutItems();
                this.updateSummary();
                this.updateHeaderCartView();
            });

            container.append(itemRow);
        });
    }

    // Cập nhật tổng tiền theo tiền VNĐ
    updateSummary() {
        const count = this.cart.totalCount;
        const subtotal = this.cart.totalAmount;

        const countEl = document.getElementById("summary-count");
        const subtotalEl = document.getElementById("summary-subtotal");
        const shippingEl = document.getElementById("summary-shipping");
        const totalEl = document.getElementById("summary-total");
        const discountEl = document.getElementById("summary-discount");

        if (countEl) countEl.innerText = `(${count} thiết bị):`;
        if (subtotalEl) subtotalEl.innerText = subtotal.toLocaleString("vi-VN") + " đ";

        if (shippingEl) {
            shippingEl.innerText = this.shippingFee === 0 ? "MIỄN PHÍ" : this.shippingFee.toLocaleString("vi-VN") + " đ";
        }

        const discount = subtotal > 0 ? this.discountVIP : 0;
        if (discountEl) discountEl.innerText = discount > 0 ? `-${discount.toLocaleString("vi-VN")} đ` : "0 đ";

        const finalTotal = Math.max(0, subtotal - discount + this.shippingFee);
        if (totalEl) totalEl.innerText = finalTotal.toLocaleString("vi-VN") + " đ";
    }

    // Bắt sự kiện người dùng
    bindEvents() {
        // 1. Chọn phương thức vận chuyển
        const shippingCards = document.querySelectorAll(".shipping-card");
        shippingCards.forEach((card, idx) => {
            card.addEventListener("click", () => {
                shippingCards.forEach(c => {
                    c.className = "shipping-card p-4 rounded-xl border border-gray-800 bg-[#080d18] cursor-pointer transition flex items-start gap-3 flex-1";
                    const dot = c.querySelector("span");
                    if (dot) dot.className = "w-3.5 h-3.5 rounded-full border-2 border-gray-600 mt-1 shrink-0";
                });

                card.className = "shipping-card p-4 rounded-xl border border-cyan-400 bg-cyan-950/20 cursor-pointer transition flex items-start gap-3 flex-1";
                const activeDot = card.querySelector("span");
                if (activeDot) activeDot.className = "w-3.5 h-3.5 rounded-full border-2 border-cyan-400 bg-cyan-400 mt-1 shrink-0";

                this.shippingFee = idx === 1 ? 50000 : 0;
                this.updateSummary();
            });
        });

        // 2. Chuyển đổi tab phương thức thanh toán
        const paymentTabs = document.querySelectorAll(".payment-tab-btn");
        paymentTabs.forEach((btn, idx) => {
            btn.addEventListener("click", () => {
                paymentTabs.forEach(b => {
                    b.className = "payment-tab-btn py-3 text-xs font-mono font-semibold rounded-lg text-gray-400 hover:text-white flex items-center justify-center gap-2";
                });
                btn.className = "payment-tab-btn py-3 text-xs font-mono font-semibold rounded-lg bg-[#0d1424] text-white border border-gray-700 shadow flex items-center justify-center gap-2";

                const cardForm = document.getElementById("card-payment-form");
                const qrBox = document.getElementById("qr-payment-box");
                const qrLabel = document.getElementById("qr-payment-label");

                if (idx === 0) {
                    this.selectedPayment = "card";
                    if (cardForm) cardForm.classList.remove("hidden");
                    if (qrBox) qrBox.classList.add("hidden");
                } else {
                    this.selectedPayment = idx === 1 ? "momo" : idx === 2 ? "bank" : "cod";
                    if (cardForm) cardForm.classList.add("hidden");
                    if (qrBox) {
                        qrBox.classList.remove("hidden");
                        if (qrLabel) {
                            qrLabel.innerText = idx === 1 ? "CỔNG VÍ ĐIỆN TỬ MOMO PAY" : idx === 2 ? "CHUYỂN KHOẢN VIETQR 24/7" : "THANH TOÁN TIỀN MẶT KHI NHẬN HÀNG (COD)";
                        }
                    }
                }
            });
        });

        // 3. Nút Xác nhận thanh toán & Đặt hàng
        const confirmBtn = document.getElementById("btn-confirm-order");
        if (confirmBtn) {
            confirmBtn.addEventListener("click", () => this.confirmOrder());
        }
    }

    // Gửi đơn hàng lên JSON-Server và chuyển hướng
    async confirmOrder() {
        if (this.cart.items.length === 0) {
            alert("Giỏ hàng của bạn đang trống! Vui lòng chọn thiết bị tác chiến trước khi thanh toán.");
            return;
        }

        const fullname = document.getElementById("input-fullname")?.value.trim();
        const phone = document.getElementById("input-phone")?.value.trim();
        const address = document.getElementById("input-address")?.value.trim();
        const email = document.getElementById("input-email")?.value.trim() || "";
        const note = document.getElementById("input-note")?.value.trim() || "";

        if (!fullname || !phone || !address) {
            alert("Vui lòng điền đầy đủ Tọa độ nhận hàng (Họ tên, Số điện thoại và Địa chỉ chi tiết)!");
            return;
        }

        const subtotal = this.cart.totalAmount;
        const discount = subtotal > 0 ? this.discountVIP : 0;
        const finalPrice = Math.max(0, subtotal - discount + this.shippingFee);
        const generatedCode = "#NV-" + Math.floor(1000 + Math.random() * 9000);

        // Lấy ID user nếu đã đăng nhập, ngược lại là khách vãng lai (1)
        const currentUser = JSON.parse(localStorage.getItem(this.sessionKey));
        const userId = currentUser ? currentUser.id : 1;

        // Dữ liệu đúng cấu trúc bảng orders (Y1)
        const orderData = {
            order_code: generatedCode,
            user_id: userId,
            customer_name: fullname,
            phone: phone,
            email: email,
            address: address,
            note: note,
            total_price: finalPrice,
            payment_method: this.selectedPayment,
            created_date: new Date().toISOString(),
            status: "pending"
        };

        // Gửi qua Fetch API (tạo đồng thời bảng orders và order_details)
        const createdOrder = await createOrder(orderData, this.cart.items);
        if (createdOrder) {
            // Lưu thông tin đơn vừa tạo vào localStorage để trang cảm ơn hiển thị
            localStorage.setItem("novapad_last_order", JSON.stringify(createdOrder));

            // Xóa sạch giỏ hàng
            this.cart.clear();
            this.updateHeaderCartView();

            // Chuyển hướng sang màn hình cảm ơn (hoàn thành tiêu chí Y2)
            window.location.href = "checkout-success.html";
        } else {
            alert("Có sự cố kết nối tới JSON-Server! Vui lòng kiểm tra lại terminal port 3000.");
        }
    }

    init() {
        this.fillUserInfoIfLoggedIn();
        this.renderCheckoutItems();
        this.updateSummary();
        this.updateHeaderCartView();
        this.bindEvents();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new CheckoutController().init();
});