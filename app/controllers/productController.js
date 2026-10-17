// app/controllers/productController.js
import { getProducts } from "../services/api.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import ProductList from "../views/ProductList.js";

class CatalogController {
    constructor() {
        this.cart = new Cart();
        this.allProducts = [];
        this.maxPrice = 5000000; // Mặc định mở tối đa 5 triệu đồng
        this.keyword = "";
        
        // Khởi tạo View Component render vào #catalog-products-grid
        this.productListView = new ProductList(
            "#catalog-products-grid",
            this.handleAddToCart.bind(this)
        );
    }

    handleAddToCart(product) {
        this.cart.addItem(product, 1);
        this.updateHeaderCart();
        alert(`Đã thêm ${product.name} vào giỏ hàng!`);
    }

    updateHeaderCart() {
        const badge = document.getElementById("header-cart-badge");
        const total = document.getElementById("header-cart-total");
        if (badge) badge.innerText = this.cart.totalCount;
        if (total) total.innerText = Number(this.cart.totalAmount).toLocaleString("vi-VN") + " đ";
    }

    // Xử lý bộ lọc đa tiêu chí
    applyFilters() {
        const connBoxes = Array.from(document.querySelectorAll(".conn-filter:checked")).map(cb => cb.value);
        const techBoxes = Array.from(document.querySelectorAll(".tech-filter:checked")).map(cb => cb.value);
        const platBoxes = Array.from(document.querySelectorAll('.platform-chip[data-active="true"]')).map(b => b.dataset.platform);

        const filtered = this.allProducts.filter(p => {
            const matchPrice = p.price <= this.maxPrice;
            const matchName  = p.name.toLowerCase().includes(this.keyword.toLowerCase());
            const matchConn  = connBoxes.length === 0 || connBoxes.includes(p.connection);
            const matchTech  = techBoxes.length === 0 || techBoxes.some(t => p.tech && p.tech.includes(t));
            const matchPlat  = platBoxes.length === 0 || platBoxes.some(pl => p.platforms && p.platforms.includes(pl));

            return matchPrice && matchName && matchConn && matchTech && matchPlat;
        });

        const countEl = document.getElementById("result-count");
        if (countEl) countEl.innerText = filtered.length;

        this.productListView.renderProducts(filtered);
    }

    // Bắt sự kiện cho tất cả thành phần bộ lọc trên Sidebar
    bindEvents() {
        // 1. Ô tìm kiếm Model
        const searchInput = document.querySelector('input[placeholder="VD: Apex, Strike, White..."]');
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                this.keyword = e.target.value.trim();
                this.applyFilters();
            });
        }

        // 2. Thanh trượt giá (Slider)
        const priceSlider = document.getElementById("price-range-slider") || document.querySelector('aside input[type="range"]');
        const priceLabel = document.getElementById("price-label");
        if (priceSlider) {
            priceSlider.addEventListener("input", (e) => {
                this.maxPrice = Number(e.target.value);
                if (priceLabel) priceLabel.innerText = "<= " + this.maxPrice.toLocaleString("vi-VN") + " đ";
                this.applyFilters();
            });
        }

        // 3. Checkbox Chuẩn kết nối & Công nghệ cốt lõi
        document.querySelectorAll(".conn-filter, .tech-filter").forEach(cb => {
            cb.addEventListener("change", () => this.applyFilters());
        });

        // 4. Các nút bấm chọn Hệ máy tương thích
        document.querySelectorAll(".platform-chip").forEach(chip => {
            chip.dataset.active = "false";
            chip.className = "platform-chip text-[11px] font-mono px-2 py-1 rounded border transition bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600";
            
            chip.addEventListener("click", () => {
                const isActive = chip.dataset.active === "true";
                chip.dataset.active = isActive ? "false" : "true";
                chip.className = "platform-chip text-[11px] font-mono px-2 py-1 rounded border transition " + (!isActive
                    ? "bg-cyan-950/60 border-cyan-800/80 text-cyan-300"
                    : "bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600");
                this.applyFilters();
            });
        });

        // 5. Nút "MẶC ĐỊNH" Reset bộ lọc
        const resetBtn = document.getElementById("reset-filters");
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                document.querySelectorAll(".conn-filter, .tech-filter").forEach(cb => cb.checked = false);
                document.querySelectorAll(".platform-chip").forEach(chip => {
                    chip.dataset.active = "false";
                    chip.className = "platform-chip text-[11px] font-mono px-2 py-1 rounded border transition bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600";
                });
                if (priceSlider) priceSlider.value = 5000000;
                if (priceLabel) priceLabel.innerText = "<= 5.000.000 đ";
                if (searchInput) searchInput.value = "";
                this.maxPrice = 5000000;
                this.keyword = "";
                this.applyFilters();
            });
        }

        // 6. Nút "ĐẶT MUA NGAY" trên Banner Hero của trang products.html
        const heroBuyBtn = document.querySelector(".lg\\:col-span-7 button");
        if (heroBuyBtn) {
            heroBuyBtn.removeAttribute("onclick");
            heroBuyBtn.addEventListener("click", () => {
                const flagship = this.allProducts.find(p => p.id === 1) || this.allProducts[0];
                if (flagship) {
                    this.handleAddToCart(flagship);
                }
            });
        }
    }

    async init() {
        this.updateHeaderCart();
        this.bindEvents();

        // Nạp sản phẩm bất đồng bộ từ JSON-Server qua api.js
        let rawData = await getProducts();



        // Chuyển đổi sang mảng Model Product chuẩn
        this.allProducts = rawData.map(item => {
            const p = new Product(item.id, item.name, item.image, item.detail, item.price, item.cate_id);
            p.origPrice = item.original_price;
            p.badge = item.badge;
            p.connection = (item.connection && typeof item.connection === "string" && item.connection.toLowerCase().includes("wireless")) 
                ? "wireless" 
                : (item.connection && item.connection.toLowerCase().includes("bluetooth") ? "bluetooth" : "cable");
            p.tech = item.tags || ["hall", "trigger"];
            p.platforms = item.platforms || ["pc", "steam", "mobile"];
            return p;
        });

        // Hiển thị danh sách sản phẩm lần đầu
        this.applyFilters();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new CatalogController().init();
});