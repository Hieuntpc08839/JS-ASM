// app/controllers/cartController.js
import Cart from "../models/Cart.js";
import CartView from "../views/CartView.js";

class CartController {
    constructor() {
        this.cart = new Cart();
        this.cartView = new CartView("#cart-table-body");
    }

    updateHeaderCart() {
        const badge = document.getElementById("header-cart-badge");
        const total = document.getElementById("header-cart-total");
        if (badge) badge.innerText = this.cart.totalCount;
        if (total) total.innerText = Number(this.cart.totalAmount).toLocaleString("vi-VN") + " đ";
    }

    render() {
        // Cập nhật header trước
        this.updateHeaderCart();

        // Ra lệnh cho View vẽ giao diện và truyền các hàm xử lý sự kiện
        this.cartView.render(
            this.cart.items,
            this.cart.totalCount,
            this.cart.totalAmount,
            (index, delta) => this.handleQuantityChange(index, delta),
            (index) => this.handleRemoveItem(index)
        );
    }

    handleQuantityChange(index, delta) {
        if (!this.cart.items[index]) return;

        if (delta < 0 && this.cart.items[index].quantity <= 1) {
            this.handleRemoveItem(index);
            return;
        }

        this.cart.items[index].quantity += delta;
        this.cart.saveCart();
        this.render();
    }

    handleRemoveItem(index) {
        if (!this.cart.items[index]) return;
        const name = this.cart.items[index].name;
        this.cart.removeItem(index);
        this.render();
        this.showToast(`Đã xóa ${name} khỏi giỏ hàng!`);
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

    init() {
        this.render();

        // Xử lý nút xóa sạch toàn bộ giỏ
        const clearBtn = document.getElementById("btn-clear-cart") || document.querySelector("button[onclick='handleClearCart()']");
        if (clearBtn) {
            clearBtn.removeAttribute("onclick");
            clearBtn.addEventListener("click", () => {
                if (this.cart.items.length === 0) return;
                if (confirm("Bạn có chắc chắn muốn làm trống toàn bộ giỏ hàng tác chiến?")) {
                    this.cart.clear();
                    this.render();
                    this.showToast("Giỏ hàng đã được làm trống!");
                }
            });
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new CartController().init();
});