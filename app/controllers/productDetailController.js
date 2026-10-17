import { getProductById } from "../services/api.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

class ProductDetailController {
    constructor() {
        this.cart = new Cart();
        this.currentProduct = null;
        this.quantity = 1;
        this.extraAnalogPrice = 0;
        this.extraWarrantyPrice = 0;
        this.selectedColor = "Carbon Obsidian";
    }

    getIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get("id"), 10) || 1;
    }

    calculatePrice() {
        if (!this.currentProduct) return;
        const unitPrice = Number(this.currentProduct.price) + this.extraAnalogPrice + this.extraWarrantyPrice;
        const mainPriceDisplay = document.getElementById("main-price-display");
        if (mainPriceDisplay) {
            mainPriceDisplay.innerText = unitPrice.toLocaleString("vi-VN") + " đ";
        }
    }

    setColor(name, element) {
        this.selectedColor = name;
        const label = document.getElementById("selected-color-name");
        if (label) label.innerText = name;

        document.querySelectorAll(".color-select-btn").forEach(btn => {
            btn.className = "color-select-btn p-2 rounded border border-gray-800 bg-[#0d1424] text-xs text-gray-400 hover:text-white transition flex items-center justify-center gap-2";
        });
        if (element) {
            element.className = "color-select-btn p-2 rounded border border-cyan-400 bg-cyan-950/20 text-xs text-cyan-300 font-semibold transition flex items-center justify-center gap-2";
        }
    }

    setAnalog(name, priceVND, element) {
        this.extraAnalogPrice = Number(priceVND) || 0;
        document.querySelectorAll(".analog-card").forEach(el => {
            el.className = "analog-card p-3 rounded-lg border border-gray-800 bg-[#0d1424] text-left cursor-pointer transition";
        });
        if (element) {
            element.className = "analog-card p-3 rounded-lg border border-cyan-400 bg-cyan-950/20 text-left cursor-pointer transition";
        }
        this.calculatePrice();
    }

    setWarranty(name, priceVND, element) {
        this.extraWarrantyPrice = Number(priceVND) || 0;
        document.querySelectorAll(".warranty-card").forEach(el => {
            el.className = "warranty-card p-3 rounded-lg border border-gray-800 bg-[#0d1424] text-left cursor-pointer transition";
        });
        if (element) {
            element.className = "warranty-card p-3 rounded-lg border border-cyan-400 bg-cyan-950/20 text-left cursor-pointer transition";
        }
        this.calculatePrice();
    }

    changeThumbnail(imgUrl, element) {
        const mainImg = document.getElementById("main-product-img");
        if (mainImg) mainImg.src = imgUrl;

        document.querySelectorAll(".thumb-item").forEach(item => {
            item.className = "thumb-item h-20 bg-[#0d1424] border border-gray-800 rounded-lg p-1.5 cursor-pointer overflow-hidden flex items-center justify-center hover:border-gray-600 transition";
        });
        if (element) {
            element.className = "thumb-item h-20 bg-[#0d1424] border-2 border-cyan-400 rounded-lg p-1.5 cursor-pointer overflow-hidden flex items-center justify-center";
        }
    }

    addToCart() {
        if (!this.currentProduct) return;

        const finalItemPrice = Number(this.currentProduct.price) + this.extraAnalogPrice + this.extraWarrantyPrice;
        const mainImg = document.getElementById("main-product-img");

        const itemToAdd = {
            id: this.currentProduct.id,
            name: `${this.currentProduct.name} (${this.selectedColor})`,
            price: finalItemPrice,
            image: mainImg ? mainImg.src : this.currentProduct.image,
            quantity: this.quantity
        };

        this.cart.addItem(itemToAdd, this.quantity);
        this.updateHeaderCart();
        this.showToast(`Đã thêm ${this.quantity}x ${itemToAdd.name} vào giỏ!`);
    }

    updateHeaderCart() {
        const badge = document.getElementById("header-cart-badge");
        const total = document.getElementById("header-cart-total");
        if (badge) badge.innerText = this.cart.totalCount;
        if (total) total.innerText = Number(this.cart.totalAmount).toLocaleString("vi-VN") + " đ";
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

    async init() {
        this.updateHeaderCart();
        const id = this.getIdFromUrl();

        // Gọi trực tiếp dữ liệu từ API db.json
        const data = await getProductById(id);
        if (!data) {
            console.error(`Không tìm thấy sản phẩm id: ${id}`);
            return;
        }

        this.currentProduct = new Product(data.id, data.name, data.image, data.detail, data.price, data.cate_id);

        const titleEl = document.querySelector("h1");
        if (titleEl) titleEl.innerText = this.currentProduct.name;

        const breadcrumb = document.querySelector(".text-cyan-400.font-semibold");
        if (breadcrumb) breadcrumb.innerText = this.currentProduct.name.toUpperCase();

        const mainImg = document.getElementById("main-product-img");
        if (mainImg) {
            mainImg.src = this.currentProduct.image;
            mainImg.alt = this.currentProduct.name;
        }

        this.calculatePrice();
    }
}

const detailCtrl = new ProductDetailController();

// Đưa các hàm lên window để liên kết trực tiếp với các onclick có sẵn trong HTML
window.selectColor = (name, el) => detailCtrl.setColor(name, el);
window.selectAnalog = (name, priceUSD, el) => {
    const priceVND = priceUSD > 0 ? 350000 : 0;
    detailCtrl.setAnalog(name, priceVND, el);
};
window.selectWarranty = (name, priceUSD, el) => {
    const priceVND = priceUSD > 0 ? 490000 : 0;
    detailCtrl.setWarranty(name, priceVND, el);
};
window.changeMainImage = (el, url) => detailCtrl.changeThumbnail(url, el);
window.handleAddToCartDetail = () => detailCtrl.addToCart();

document.addEventListener("DOMContentLoaded", () => {
    detailCtrl.init();
});