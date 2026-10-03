class ProductItem {
    constructor(product) {
        this.product = product;
    }

    render() {
        const productElement = document.createElement('div');
        productElement.className = 'bg-[#0b1019] border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/40 transition group flex flex-col justify-between';
        
        productElement.innerHTML = `
            <div class="p-3 bg-[#0d1424] relative">
                <span class="inline-block border border-cyan-500/40 bg-cyan-500/20 text-cyan-400 px-2.5 py-1 text-xs tracking-wider rounded font-mono font-semibold">
                    ${this.product.badge || 'FLAGSHIP'}
                </span>
                <div class="h-44 w-full flex items-center justify-center my-3 overflow-hidden rounded-lg bg-black/40">
                    <a href="product-detail.html?id=${this.product.id}">
                        <img src="${this.product.image}" alt="${this.product.name}" class="h-full w-full object-cover group-hover:scale-105 transition duration-300">
                    </a>
                </div>
            </div>

            <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between text-xs text-gray-400 font-mono mb-1">
                        <span>NOVAPAD ESPORTS</span>
                        <span class="text-cyan-400 flex items-center gap-1">${this.product.rating || '★ 4.9 (1.2K)'}</span>
                    </div>
                    <h3 class="text-white font-bold text-lg mb-2 line-clamp-1 hover:text-cyan-400 transition">
                        <a href="product-detail.html?id=${this.product.id}">${this.product.name}</a>
                    </h3>
                    <p class="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-4">${this.product.detail}</p>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-gray-800/80 mt-auto">
                    <div>
                        <span class="text-white text-xl font-bold font-mono">$${Number(this.product.price).toFixed(2)}</span>
                    </div>
                    <button class="add-cart-btn w-9 h-9 rounded-lg flex items-center justify-center bg-cyan-400 hover:bg-cyan-300 text-black transition shadow-lg" title="Thêm vào giỏ">
                        <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Bắt sự kiện thêm vào giỏ hàng
        const btn = productElement.querySelector('.add-cart-btn');
        btn.addEventListener('click', () => {
            if (typeof CartModel !== 'undefined') {
                CartModel.addItem(this.product);
                updateHeaderCartView();
                alert(`Đã thêm ${this.product.name} vào giỏ hàng!`);
            }
        });

        return productElement;
    }
}

// Class quản lý mảng và render danh sách 
class ProductList {
    constructor() {
        // Khởi tạo đối tượng Product khớp chính xác với bảng products trong db.json
        const p1 = new Product(
            1,
            "NovaPad Apex Pro v3.2",
            "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=500",
            "Chassis vân Carbon siêu nhẹ, cần xoay Hall-Effect chống drift, cò Hall 2 chặng.",
            149.99,
            1
        );
        p1.badge = "TOP 1 BESTSELLER";
        p1.rating = "★ 4.9 (1.8K)";

        const p2 = new Product(
            2,
            "Quantum Strike Chroma",
            "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=500",
            "Dải led RGB 16.8 triệu màu Aura Sync, switch cơ Tactile Micro switch nảy dòn.",
            119.99,
            1
        );
        p2.badge = "CHUYÊN FPS";
        p2.rating = "★ 4.8 (950)";

        const p3 = new Product(
            3,
            "Stealth X Ghost Tactical",
            "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=500",
            "Phiên bản trắng gốm mờ, đệm cao su tổ ong bọc tay cầm chống trơn trượt khi try-hard.",
            89.99,
            2
        );
        p3.badge = "TACTICAL ELITE";
        p3.rating = "★ 5.0 (620)";

        const p4 = new Product(
            4,
            "Cyberpunk Neo-2077 Pro",
            "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500",
            "Khắc laser số sê-ri độc bản, tặng kèm vali chống sốc hợp kim Titanium nguyên khối.",
            199.99,
            3
        );
        p4.badge = "BẢN GIỚI HẠN";
        p4.rating = "★ 5.0 (310)";

        this.products = [p1, p2, p3, p4];
    }

    render(items = this.products) {
        const renderHook = document.querySelector("#bestseller-grid");
        if (!renderHook) return;

        renderHook.innerHTML = "";
        items.forEach(product => {
            const productItem = new ProductItem(product);
            renderHook.append(productItem.render());
        });
    }

    // Lọc theo nút Tab danh mục trên trang chủ
    filterCategory(categoryKey) {
        if (categoryKey === "all") {
            this.render(this.products);
        } else if (categoryKey === "hall-effect") {
            this.render(this.products.filter(p => p.cate_id === 1));
        } else if (categoryKey === "wireless") {
            this.render(this.products.filter(p => p.cate_id === 2));
        } else if (categoryKey === "limited") {
            this.render(this.products.filter(p => p.cate_id === 3));
        }
    }
}

function updateHeaderCartView() {
    if (typeof CartModel !== 'undefined') {
        const badge = document.getElementById("header-cart-badge");
        const total = document.getElementById("header-cart-total");
        if (badge) badge.innerText = CartModel.getTotalCount();
        if (total) total.innerText = "$" + CartModel.getTotalAmount().toFixed(2);
    }
}

let homeApp;
document.addEventListener("DOMContentLoaded", () => {
    updateHeaderCartView();
    homeApp = new ProductList();
    homeApp.render();

    // sự kiện click các nút lọc danh mục
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => {
                b.className = "filter-btn px-4 py-1.5 text-xs font-semibold rounded bg-[#0d1424] text-gray-300 hover:text-white transition";
            });
            btn.className = "filter-btn px-4 py-1.5 text-xs font-semibold rounded bg-cyan-400 text-black";
            const cate = btn.getAttribute("data-category");
            homeApp.filterCategory(cate);
        });
    });
});