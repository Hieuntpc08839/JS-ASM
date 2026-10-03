class ProductDetailController {
    currentProduct = null;
    quantity = 1;
    extraAnalogPrice = 0;
    extraWarrantyPrice = 0;
    selectedColor = "Carbon Obsidian";
    selectedAnalog = "Hall Effect v4.0";
    selectedWarranty = "24 Tháng Tiêu Chuẩn";

    // Danh sách 6 sản phẩm chuẩn VND khớp chính xác với Product.js và db.json
    allProducts = [
        new Product(1, "NovaPad Apex Pro v3.2 Wireless", "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800", "Chassis vân Carbon siêu nhẹ, cần xoay Hall-Effect chống drift.", 3690000, 1),
        new Product(2, "Quantum Strike Chroma Wireless", "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800", "Dải led RGB 16.8 triệu màu Aura Sync, switch cơ Tactile Micro switch.", 2890000, 1),
        new Product(3, "Stealth X Ghost Tactical Ceramic", "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=800", "Phiên bản trắng gốm mờ, đệm cao su tổ ong bọc tay cầm chống trơn trượt.", 2190000, 2),
        new Product(4, "Cyberpunk Neo-2077 Pro Limited", "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800", "Khắc laser số sê-ri độc bản, tặng vali hợp kim Titanium nguyên khối.", 4890000, 2),
        new Product(5, "NovaDock Ultra Fast Mag-Charge", "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800", "Đế sạc nam châm tự hít thông minh, tích hợp hub 2 cổng USB 3.2.", 1190000, 3),
        new Product(6, "Hall Stick Kit Pro Thumbsticks", "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800", "Bộ 4 nắp cần xoay cao thấp tùy biến: lõm (concave), lồi (convex).", 490000, 3)
    ];

    init() {
        this.loadProductFromUrl();
        this.updateHeaderCart();
    }

    getIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get("id"), 10) || 1;
    }

    loadProductFromUrl() {
        const id = this.getIdFromUrl();
        this.currentProduct = this.allProducts.find(p => p.id === id) || this.allProducts[0];

        // SỬA LỖI UNDEFINED: dùng .name thay vì .title
        const titleEl = document.querySelector("h1");
        if (titleEl) {
            titleEl.innerHTML = this.currentProduct.name;
        }

        const mainImg = document.getElementById("main-product-img");
        if (mainImg) {
            mainImg.src = this.currentProduct.image;
            mainImg.alt = this.currentProduct.name;
        }

        this.calculatePrice();
    }

    calculatePrice() {
        if (!this.currentProduct) return;
        const unitPrice = this.currentProduct.price + this.extraAnalogPrice + this.extraWarrantyPrice;
        const mainPriceDisplay = document.getElementById("main-price-display");
        if (mainPriceDisplay) {
            // Định dạng hiển thị chuẩn tiền tệ VND
            mainPriceDisplay.innerText = Number(unitPrice).toLocaleString('vi-VN') + " đ";
        }
    }

    setAnalog(name, extra, element) {
        this.selectedAnalog = name;
        this.extraAnalogPrice = extra;
        document.querySelectorAll(".analog-card").forEach(el => {
            el.className = "analog-card p-3 rounded-lg border border-gray-800 bg-[#0d1424] text-left cursor-pointer transition";
        });
        element.className = "analog-card p-3 rounded-lg border border-cyan-400 bg-cyan-950/20 text-left cursor-pointer transition";
        this.calculatePrice();
    }

    setWarranty(name, extra, element) {
        this.selectedWarranty = name;
        this.extraWarrantyPrice = extra;
        document.querySelectorAll(".warranty-card").forEach(el => {
            el.className = "warranty-card p-3 rounded-lg border border-gray-800 bg-[#0d1424] text-left cursor-pointer transition";
        });
        element.className = "warranty-card p-3 rounded-lg border border-cyan-400 bg-cyan-950/20 text-left cursor-pointer transition";
        this.calculatePrice();
    }

    setColor(name, element) {
        this.selectedColor = name;
        const label = document.getElementById("selected-color-name");
        if (label) label.innerText = name;

        document.querySelectorAll(".color-select-btn").forEach(btn => {
            btn.classList.remove("border-cyan-400", "bg-cyan-950/20", "text-cyan-300");
            btn.classList.add("border-gray-800", "bg-[#0d1424]", "text-gray-400");
        });
        element.classList.remove("border-gray-800", "bg-[#0d1424]", "text-gray-400");
        element.classList.add("border-cyan-400", "bg-cyan-950/20", "text-cyan-300");
    }

    changeQuantity(delta) {
        this.quantity = Math.max(1, this.quantity + delta);
        const qtyDisplay = document.getElementById("qty-display");
        if (qtyDisplay) qtyDisplay.innerText = this.quantity;
    }

    addToCart() {
        if (!this.currentProduct || typeof CartModel === "undefined") return;

        const finalItemPrice = this.currentProduct.price + this.extraAnalogPrice + this.extraWarrantyPrice;
        const itemToAdd = {
            id: this.currentProduct.id,
            name: `${this.currentProduct.name} (${this.selectedColor})`,
            price: finalItemPrice,
            image: this.currentProduct.image,
            quantity: this.quantity
        };

        const cart = CartModel.getCart();
        const existing = cart.find(i => i.id === itemToAdd.id && i.name === itemToAdd.name);
        if (existing) {
            existing.quantity += this.quantity;
        } else {
            cart.push(itemToAdd);
        }
        CartModel.saveCart(cart);

        this.updateHeaderCart();
        this.showToast(`Đã thêm ${this.quantity}x ${itemToAdd.name} vào giỏ hàng!`);
    }

    updateHeaderCart() {
        if (typeof CartModel !== "undefined") {
            const badge = document.getElementById("header-cart-badge");
            const total = document.getElementById("header-cart-total");
            if (badge) badge.innerText = CartModel.getTotalCount();
            if (total) total.innerText = Number(CartModel.getTotalAmount()).toLocaleString('vi-VN') + " đ";
        }
    }

    showToast(msg) {
        const toast = document.getElementById("cart-toast");
        if (!toast) return;
        toast.innerHTML = `<svg class="w-5 h-5 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> <span>${msg}</span>`;
        toast.classList.remove("opacity-0", "translate-y-10", "pointer-events-none");
        setTimeout(() => {
            toast.classList.add("opacity-0", "translate-y-10", "pointer-events-none");
        }, 2200);
    }
}

const detailCtrl = new ProductDetailController();

function selectColor(name, el) { detailCtrl.setColor(name, el); }
function selectAnalog(name, price, el) { 
    // Quy đổi tùy chọn sang VND: nếu > 0 thì cộng 350.000 đ
    const priceVnd = price > 0 ? 350000 : 0;
    detailCtrl.setAnalog(name, priceVnd, el); 
}
function selectWarranty(name, price, el) { 
    // Quy đổi gói bảo hành sang VND: nếu > 0 thì cộng 490.000 đ
    const priceVnd = price > 0 ? 490000 : 0;
    detailCtrl.setWarranty(name, priceVnd, el); 
}
function adjustQuantity(delta) { detailCtrl.changeQuantity(delta); }
function handleAddToCartDetail() { detailCtrl.addToCart(); }
function changeMainImage(el, url) {
    document.querySelectorAll(".thumb-item").forEach(item => item.className = "thumb-item h-20 bg-[#0d1424] border border-gray-800 rounded-lg p-1.5 cursor-pointer overflow-hidden flex items-center justify-center hover:border-gray-600 transition");
    el.className = "thumb-item h-20 bg-[#0d1424] border-2 border-cyan-400 rounded-lg p-1.5 cursor-pointer overflow-hidden flex items-center justify-center";
    const mainImg = document.getElementById("main-product-img");
    if (mainImg) mainImg.src = url;
}

document.addEventListener("DOMContentLoaded", () => {
    detailCtrl.init();
});