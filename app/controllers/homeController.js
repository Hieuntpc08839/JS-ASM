// app/controllers/homeController.js
import { getProducts } from "../services/api.js";

// 1. Quản lý giỏ hàng cục bộ an toàn
const CART_KEY = "novapad_cart_data";

function getCart() {
    try {
        const data = localStorage.getItem(CART_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price) || 0,
            image: product.image,
            quantity: 1
        });
    }
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateHeaderCartBadge();
    alert(`Đã thêm ${product.name} vào giỏ hàng!`);
}

function updateHeaderCartBadge() {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const totalAmount = cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);

    const badge = document.getElementById("header-cart-badge");
    const totalEl = document.getElementById("header-cart-total");

    if (badge) badge.innerText = totalCount;
    if (totalEl) totalEl.innerText = totalAmount.toLocaleString("vi-VN") + " đ";
}

// 2. Tạo phần tử DOM Card Sản phẩm
function createCard(p) {
    const card = document.createElement("div");
    card.className = "bg-[#0b1019] border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/40 transition group flex flex-col justify-between";

    const formattedPrice = Number(p.price || 0).toLocaleString("vi-VN") + " đ";

    card.innerHTML = `
        <div class="p-3 bg-[#0d1424] relative">
            <span class="inline-block border border-cyan-500/40 bg-cyan-500/20 text-cyan-400 px-2.5 py-1 text-xs tracking-wider rounded font-mono font-semibold">
                ${p.badge || "FLAGSHIP"}
            </span>
            <div class="h-44 w-full flex items-center justify-center my-3 overflow-hidden rounded-lg bg-black/40">
                <a href="product-detail.html?id=${p.id}">
                    <img src="${p.image}" alt="${p.name}" class="h-full w-full object-cover group-hover:scale-105 transition duration-300">
                </a>
            </div>
        </div>

        <div class="p-5 flex-1 flex flex-col justify-between">
            <div>
                <div class="flex items-center justify-between text-xs text-gray-400 font-mono mb-1">
                    <span>${p.series || "NOVAPAD ESPORTS"}</span>
                    <span class="text-cyan-400 flex items-center gap-1">${p.rating || "★ 4.9 (1.2K)"}</span>
                </div>
                <h3 class="text-white font-bold text-lg mb-2 line-clamp-1 hover:text-cyan-400 transition">
                    <a href="product-detail.html?id=${p.id}">${p.name}</a>
                </h3>
                <p class="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-4">${p.detail || ""}</p>
            </div>

            <div class="flex items-center justify-between pt-3 border-t border-gray-800/80 mt-auto">
                <div>
                    <span class="text-white text-xl font-bold font-mono">${formattedPrice}</span>
                </div>
                <button class="btn-add-cart w-9 h-9 rounded-lg flex items-center justify-center bg-cyan-400 hover:bg-cyan-300 text-black transition shadow-lg font-bold" title="Thêm vào giỏ">
                    +
                </button>
            </div>
        </div>
    `;

    card.querySelector(".btn-add-cart").addEventListener("click", () => addToCart(p));
    return card;
}

// 3. Render danh sách và xử lý bộ lọc tab
async function initHomePage() {
    updateHeaderCartBadge();

    const grid = document.querySelector("#bestseller-grid");
    if (!grid) {
        console.error("Không tìm thấy phần tử #bestseller-grid trong index.html!");
        return;
    }

    grid.innerHTML = '<p class="col-span-full text-center py-8 text-cyan-400 font-mono animate-pulse">Đang nạp thiết bị từ server...</p>';

    // Gọi API lấy dữ liệu từ JSON-Server
    let products = await getProducts();

    function renderList(list) {
        grid.innerHTML = "";
        list.forEach(p => grid.append(createCard(p)));
    }

    // Hiển thị 4 sản phẩm bán chạy ban đầu
    renderList(products.slice(0, 4));

    // lọc danh mục 
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => {
                b.className = "filter-btn px-4 py-1.5 text-xs font-semibold rounded bg-[#0d1424] text-gray-300 hover:text-white transition";
            });
            btn.className = "filter-btn px-4 py-1.5 text-xs font-semibold rounded bg-cyan-400 text-black";

            const cat = btn.getAttribute("data-category");
            if (cat === "all") {
                renderList(products.slice(0, 4));
            } else if (cat === "hall-effect") {
                renderList(products.filter(p => Number(p.cate_id) === 1));
            } else if (cat === "wireless") {
                renderList(products.filter(p => Number(p.cate_id) === 2));
            } else if (cat === "limited") {
                renderList(products.filter(p => Number(p.cate_id) === 3));
            }
        });
    });

    // Nút đặt mua ngay trên Hero Banner
    const heroBtn = document.querySelector("#btn-hero-buy, button[onclick*='handleAddToCart']");
    if (heroBtn) {
        heroBtn.removeAttribute("onclick");
        heroBtn.addEventListener("click", () => {
            if (products.length > 0) addToCart(products[0]);
        });
    }
}

document.addEventListener("DOMContentLoaded", initHomePage);