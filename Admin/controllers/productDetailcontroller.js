import { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} from "../../app/services/api.js";

// 1. Render danh sách sản phẩm & Thống kê
export async function renderProducts() {
    const products = await getProducts();
    const tbody = document.getElementById("product-table-body");
    if (!tbody) return;

    if (!products || products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-slate-500 font-mono">Không có dữ liệu sản phẩm.</td></tr>`;
        updateStats([]);
        return;
    }

    // Cập nhật 4 thẻ thống kê
    updateStats(products);

    // Render bảng dữ liệu sản phẩm
    tbody.innerHTML = products.map(product => {
        const stock = Number(product.stock || 0);
        let stockText = `<span class="text-emerald-400">Đủ hàng</span>`;
        let barColor = `bg-emerald-400`;
        let percent = Math.min(100, Math.round((stock / 400) * 100));

        if (stock === 0) {
            stockText = `<span class="text-rose-400">Hết hàng</span>`;
            barColor = `bg-rose-500`;
            percent = 0;
        } else if (stock < 20) {
            stockText = `<span class="text-amber-400">Sắp hết</span>`;
            barColor = `bg-amber-400`;
        }

        return `
            <tr class="hover:bg-slate-800/30 transition-colors border-b border-slate-800/60">
                <td class="py-3.5 px-4 text-center">
                    <input type="checkbox" class="rounded bg-slate-800 border-slate-700 text-cyan-500">
                </td>
                <td class="py-3.5 px-4">
                    <div class="flex items-center space-x-3">
                        <img src="${product.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200'}" class="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0" alt="Img">
                        <div>
                            <div class="font-bold text-slate-100 hover:text-cyan-400 transition-colors">${product.name}</div>
                            <div class="text-[10px] text-slate-400 font-mono mt-0.5">${product.spec || 'HALL EFFECT SENSORS'}</div>
                        </div>
                    </div>
                </td>
                <td class="py-3.5 px-4 font-mono text-slate-300">${product.sku || 'N/A'}</td>
                <td class="py-3.5 px-4">
                    <span class="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Hardware</span>
                </td>
                <td class="py-3.5 px-4 font-mono font-bold text-cyan-400">$${Number(product.price || 0).toFixed(2)}</td>
                <td class="py-3.5 px-4">
                    <div class="w-28 space-y-1">
                        <div class="flex justify-between text-[10px] font-mono">
                            <span class="text-slate-300">${stock} cái</span>
                            ${stockText}
                        </div>
                        <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div class="${barColor} h-full rounded-full" style="width: ${percent}%;"></div>
                        </div>
                    </div>
                </td>
                <td class="py-3.5 px-4 text-right">
                    <div class="flex items-center justify-end space-x-2">
                        <button class="btn-edit px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/30 font-medium transition-all cursor-pointer" data-id="${product.id}">Sửa</button>
                        <button class="btn-delete px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded border border-rose-500/30 font-medium transition-all cursor-pointer" data-id="${product.id}">Xóa</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    bindProductEvents();
}

// 2. Cập nhật các thẻ Thống Kê
function updateStats(products) {
    const total = products.length;
    const instock = products.filter(p => Number(p.stock || 0) >= 20).length;
    const lowstock = products.filter(p => Number(p.stock || 0) > 0 && Number(p.stock || 0) < 20).length;
    const outstock = products.filter(p => Number(p.stock || 0) === 0).length;

    const elTotal = document.getElementById("stat-total");
    const elIn = document.getElementById("stat-instock");
    const elLow = document.getElementById("stat-lowstock");
    const elOut = document.getElementById("stat-outstock");

    if (elTotal) elTotal.innerHTML = `${total} <span class="text-xs font-normal text-slate-400">SKUs</span>`;
    if (elIn) elIn.innerHTML = `${instock} <span class="text-xs font-normal text-slate-400">Đang bán</span>`;
    if (elLow) elLow.innerHTML = `${lowstock} <span class="text-xs font-normal text-amber-500/80">&lt; 20 units</span>`;
    if (elOut) elOut.innerHTML = `${outstock} <span class="text-xs font-normal text-rose-500/80">Restock req</span>`;
}

// 3. Đăng ký sự kiện Sửa & Xóa
function bindProductEvents() {
    // Xóa sản phẩm
    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.getAttribute("data-id");
            if (confirm("Xác nhận xóa sản phẩm này khỏi hệ thống NovaPad?")) {
                const ok = await deleteProduct(id);
                if (ok) renderProducts();
                else alert("Xóa thất bại!");
            }
        });
    });

    // Sửa sản phẩm
    document.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.getAttribute("data-id");
            const product = await getProductById(id);
            if (product) {
                document.getElementById("prod-id").value = product.id;
                document.getElementById("prod-name").value = product.name || "";
                document.getElementById("prod-sku").value = product.sku || "";
                document.getElementById("prod-price").value = product.price || 0;
                document.getElementById("prod-stock").value = product.stock || 0;
                document.getElementById("prod-image").value = product.image || "";

                document.getElementById("modal-title").innerText = `SỬA SẢN PHẨM #${product.id}`;
                toggleModal(true);
            }
        });
    });
}

// 4. Khởi tạo sự kiện Modal Form (Thêm/Sửa)
export function initProductModule() {
    const form = document.getElementById("product-form");
    const btnOpen = document.getElementById("btn-open-modal");
    const btnClose = document.getElementById("btn-close-modal");

    if (btnOpen) {
        btnOpen.addEventListener("click", () => {
            if (form) form.reset();
            document.getElementById("prod-id").value = "";
            document.getElementById("modal-title").innerText = "THÊM SẢN PHẨM MỚI";
            toggleModal(true);
        });
    }

    if (btnClose) {
        btnClose.addEventListener("click", () => toggleModal(false));
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = document.getElementById("prod-id").value;
            const data = {
                name: document.getElementById("prod-name").value,
                sku: document.getElementById("prod-sku").value,
                price: Number(document.getElementById("prod-price").value),
                stock: Number(document.getElementById("prod-stock").value),
                image: document.getElementById("prod-image").value
            };

            if (id) {
                await updateProduct(id, data);
            } else {
                await createProduct(data);
            }

            toggleModal(false);
            renderProducts();
        });
    }

    renderProducts();
}

function toggleModal(show) {
    const modal = document.getElementById("product-modal");
    if (!modal) return;
    if (show) modal.classList.remove("hidden");
    else modal.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
    initProductModule();
});