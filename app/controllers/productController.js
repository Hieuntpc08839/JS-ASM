class ProductItem {
    constructor(product) {
        this.product = product;
    }

    render() {
        const itemEl = document.createElement("div");
        itemEl.className = "bg-[#0b101c] border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/40 transition flex flex-col justify-between group";

        const origPriceHtml = this.product.origPrice
            ? `<span class="text-gray-500 text-xs line-through ml-1.5 font-mono">$${Number(this.product.origPrice).toFixed(2)}</span>`
            : "";

        const actionBtnHtml = this.product.preorder
            ? `<button class="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-mono font-semibold px-3 py-2 rounded transition">ĐẶT TRƯỚC</button>`
            : `<button class="add-cart-btn w-9 h-9 rounded-lg flex items-center justify-center bg-cyan-400 hover:bg-cyan-300 text-black transition shadow-lg" title="Thêm vào giỏ">
                 <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
               </button>`;

        let tagsHtml = "";
        if (this.product.tags && this.product.tags.length > 0) {
            tagsHtml = this.product.tags.map(t => `<span class="text-[10px] font-mono bg-gray-900 border border-gray-800 text-gray-300 px-2 py-0.5 rounded">${t}</span>`).join(" ");
        }

        itemEl.innerHTML = `
            <div class="p-3 bg-[#0d1424] relative">
                <div class="flex items-center justify-between text-xs font-mono mb-2">
                    <span class="border px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border-cyan-500/30">${this.product.badge}</span>
                    <span class="text-cyan-400 font-bold">${this.product.extra || ""}</span>
                </div>
                <a href="product-detail.html?id=${this.product.id}" class="block h-44 w-full flex items-center justify-center my-2 overflow-hidden rounded bg-black/40 cursor-pointer">
                    <img src="${this.product.image}" alt="${this.product.name}" class="h-full w-full object-cover group-hover:scale-105 transition duration-300">
                </a>
            </div>

            <div class="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between text-[11px] text-gray-400 font-mono mb-1">
                        <span>${this.product.series || "NOVAPAD HARDWARE"}</span>
                        <span class="text-cyan-400 flex items-center gap-1 font-bold">★ ${this.product.rating || "5.0"}</span>
                    </div>
                    <a href="product-detail.html?id=${this.product.id}" class="text-white font-bold text-base mb-2 group-hover:text-cyan-400 transition block">
                        ${this.product.name}
                    </a>
                    <p class="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">${this.product.detail}</p>
                    <div class="flex flex-wrap gap-1.5 mb-4">${tagsHtml}</div>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-gray-800/80 mt-auto">
                    <div>
                        <span class="text-white text-lg font-bold font-mono">$${Number(this.product.price).toFixed(2)}</span>
                        ${origPriceHtml}
                    </div>
                    ${actionBtnHtml}
                </div>
            </div>
        `;

        const addBtn = itemEl.querySelector(".add-cart-btn");
        if (addBtn) {
            addBtn.addEventListener("click", () => {
                if (typeof CartModel !== "undefined") {
                    CartModel.addItem(this.product);
                    updateCatalogHeaderCart();
                    showCatalogToast(`Đã thêm ${this.product.name} vào giỏ hàng!`);
                }
            });
        }

        return itemEl;
    }
}

class ProductList {
    constructor() {
        const p1 = new Product(1, "NovaPad Apex Pro v3.2", "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=500", "Chassis vân Carbon siêu nhẹ, cần xoay Hall-Effect chống drift, cò Hall 2 chặng.", 149.99, 1);
        p1.origPrice = 189.99; p1.badge = "FLAGSHIP APEX"; p1.extra = "-21% OFF"; p1.series = "WIRELESS 2.4G / TYPE-C"; p1.rating = "4.9 (120)";
        p1.connection = "wireless"; p1.tech = ["hall", "trigger", "macro"];
        p1.platforms = ["pc", "steam", "mobile"];
        p1.tags = ["1000Hz", "4 Back Paddles", "42h Pin"];

        const p2 = new Product(2, "Quantum Strike Chroma", "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=500", "Dải led RGB 16.8 triệu màu Aura Sync, switch cơ Tactile Micro switch nảy dòn.", 119.99, 1);
        p2.badge = "CHROMA RGB"; p2.extra = "MỚI RA MẮT"; p2.series = "TRI-MODE CONNECTIVITY"; p2.rating = "4.8 (94)";
        p2.connection = "wireless"; p2.tech = ["hall", "mechanical"];
        p2.platforms = ["pc", "xbox", "mobile"];
        p2.tags = ["Hall Effect", "Gyro 6 Trục", "Custom RGB"];

        const p3 = new Product(3, "Stealth X Ghost Tactical", "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=500", "Phiên bản trắng gốm mờ, đệm cao su tổ ong bọc tay cầm chống trơn trượt khi try-hard.", 89.99, 2);
        p3.badge = "TẠM HẾT HÀNG"; p3.extra = "PRE-ORDER ĐỢT 2"; p3.series = "ARCTIC CERAMIC EDITION"; p3.rating = "5.0 (62)"; p3.preorder = true;
        p3.connection = "cable"; p3.tech = ["hall", "trigger"];
        p3.platforms = ["pc", "steam"];
        p3.tags = ["White Ceramic", "1000Hz USB", "Grip Pad"];

        const p4 = new Product(4, "Cyberpunk Neo-2077 Pro", "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500", "Khắc laser số sê-ri độc bản, tặng kèm vali chống sốc hợp kim Titanium nguyên khối.", 199.99, 2);
        p4.badge = "LIMITED 500 PCS"; p4.extra = "#084/500"; p4.series = "COLLECTOR EDITION"; p4.rating = "5.0 (48)";
        p4.connection = "bluetooth"; p4.tech = ["hall", "macro", "mechanical"];
        p4.platforms = ["pc", "ps", "mobile"];
        p4.tags = ["Titanium Box", "Laser Etched", "Gold Plated"];

        const p5 = new Product(5, "NovaDock Ultra Hub", "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=500", "Đế sạc nam châm tự hít thông minh, tích hợp hub 2 cổng USB 3.2 mở rộng dongle tiện lợi.", 49.99, 3);
        p5.badge = "PHỤ KIỆN CAO CẤP"; p5.extra = "Fast Mag-Charge"; p5.series = "DOCK SẠC TỪ TÍNH"; p5.rating = "4.7 (210)";
        p5.connection = "cable"; p5.tech = [];
        p5.platforms = ["pc", "steam", "xbox", "ps", "mobile"];
        p5.tags = ["Mag-Lock", "2x USB 3.2", "LED Status"];

        const p6 = new Product(6, "Hall Stick Kit Pro (4 Nắp)", "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500", "Bộ 4 nắp cần xoay cao thấp tùy biến: lõm (concave), lồi (convex) bằng cao su fluoro.", 19.99, 3);
        p6.badge = "TACTICAL MOD KIT"; p6.extra = "Universal Fit"; p6.series = "DIY UPGRADE KIT"; p6.rating = "4.9 (342)";
        p6.connection = "cable"; p6.tech = ["hall"];
        p6.platforms = ["pc", "steam", "xbox", "ps", "mobile"];
        p6.tags = ["4 Height Options", "Zero Drift", "Tool Included"];

        this.products = [p1, p2, p3, p4, p5, p6];
        this.maxPrice = 250;
        this.keyword = "";
    }

    render(items = this.products) {
        const grid = document.getElementById("catalog-products-grid");
        if (!grid) return;
        grid.innerHTML = "";

        const countEl = document.getElementById("result-count");
        if (countEl) countEl.innerText = items.length;

        if (items.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-12 text-gray-500 font-mono text-sm">Không tìm thấy phần cứng phù hợp với bộ lọc.</div>`;
            return;
        }

        items.forEach(product => {
            grid.append(new ProductItem(product).render());
        });
    }

    applyAllFilters() {
        const connBoxes = Array.from(document.querySelectorAll(".conn-filter:checked")).map(cb => cb.value);
        const techBoxes = Array.from(document.querySelectorAll(".tech-filter:checked")).map(cb => cb.value);
        const platBoxes = Array.from(document.querySelectorAll('.platform-chip[data-active="true"]')).map(b => b.dataset.platform);

        const filtered = this.products.filter(p => {
            const matchPrice = p.price <= this.maxPrice;
            const matchName  = p.name.toLowerCase().includes(this.keyword.toLowerCase());
            const matchConn  = connBoxes.length === 0 || connBoxes.includes(p.connection);
            const matchTech  = techBoxes.length === 0 || techBoxes.some(t => p.tech && p.tech.includes(t));
            const matchPlat  = platBoxes.length === 0 || platBoxes.some(pl => p.platforms && p.platforms.includes(pl));

            return matchPrice && matchName && matchConn && matchTech && matchPlat;
        });

        this.render(filtered);
    }

    findById(id) {
        return this.products.find(p => p.id === id);
    }
}

function updateCatalogHeaderCart() {
    if (typeof CartModel !== "undefined") {
        const badge = document.getElementById("header-cart-badge");
        const total = document.getElementById("header-cart-total");
        if (badge) badge.innerText = CartModel.getTotalCount();
        if (total) total.innerText = "$" + CartModel.getTotalAmount().toFixed(2);
    }
}

function showCatalogToast(msg) {
    const toast = document.getElementById("cart-toast");
    if (!toast) return;
    toast.innerHTML = `<svg class="w-5 h-5 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg> <span>${msg}</span>`;
    toast.classList.remove("opacity-0", "translate-y-10", "pointer-events-none");
    setTimeout(() => {
        toast.classList.add("opacity-0", "translate-y-10", "pointer-events-none");
    }, 2000);
}

// Dùng cho nút "ĐẶT MUA NGAY" ở banner hero
function handleAddCatalogItem(id) {
    if (!catalogApp || typeof CartModel === "undefined") return;
    const product = catalogApp.findById(id);
    if (!product) return;
    CartModel.addItem(product);
    updateCatalogHeaderCart();
    showCatalogToast(`Đã thêm ${product.name} vào giỏ hàng!`);
}

// Trạng thái hiển thị của chip "Hệ máy tương thích"
function setChipState(chip, active) {
    chip.dataset.active = active ? "true" : "false";
    chip.className = "platform-chip text-[11px] font-mono px-2 py-1 rounded border transition " + (active
        ? "bg-cyan-950/60 border-cyan-800/80 text-cyan-300"
        : "bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600");
}

function updatePriceLabel(value) {
    const label = document.getElementById("price-label");
    if (label) label.innerText = "$20 - $" + value;
}

let catalogApp;
document.addEventListener("DOMContentLoaded", () => {
    catalogApp = new ProductList();
    updateCatalogHeaderCart();

    const priceSlider = document.querySelector('aside input[type="range"]');
    const searchInput = document.querySelector('input[placeholder="VD: Apex, Strike, White..."]');
    const chips = document.querySelectorAll(".platform-chip");

    // Chip hệ máy: bấm để bật/tắt
    chips.forEach(chip => {
        setChipState(chip, chip.dataset.default === "true");
        chip.addEventListener("click", () => {
            setChipState(chip, chip.dataset.active !== "true");
            catalogApp.applyAllFilters();
        });
    });

    // Slider khoảng giá
    if (priceSlider) {
        catalogApp.maxPrice = parseFloat(priceSlider.value);
        updatePriceLabel(priceSlider.value);
        priceSlider.addEventListener("input", (e) => {
            catalogApp.maxPrice = parseFloat(e.target.value);
            updatePriceLabel(e.target.value);
            catalogApp.applyAllFilters();
        });
    }

    // Ô tìm kiếm model
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            catalogApp.keyword = e.target.value.trim();
            catalogApp.applyAllFilters();
        });
    }

    // Checkbox chuẩn kết nối + công nghệ cốt lõi
    document.querySelectorAll(".conn-filter, .tech-filter").forEach(cb => {
        cb.addEventListener("change", () => catalogApp.applyAllFilters());
    });

    // Nút "MẶC ĐỊNH": đưa mọi bộ lọc về trạng thái ban đầu
    const resetBtn = document.getElementById("reset-filters");
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            document.querySelectorAll(".conn-filter, .tech-filter").forEach(cb => cb.checked = cb.defaultChecked);
            chips.forEach(chip => setChipState(chip, chip.dataset.default === "true"));
            if (priceSlider) priceSlider.value = 250;
            if (searchInput) searchInput.value = "";
            catalogApp.maxPrice = 250;
            catalogApp.keyword = "";
            updatePriceLabel(250);
            catalogApp.applyAllFilters();
        });
    }

    // Render lần đầu theo đúng trạng thái bộ lọc trên giao diện
    catalogApp.applyAllFilters();
});