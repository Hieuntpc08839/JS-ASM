import { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} from "../../app/services/api.js";

// Format tiền tệ ($)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
};

// 1. RENDER CHÍNH: Danh sách sản phẩm & Thống kê
export async function renderProducts() {
    const tbody = document.getElementById("product-table-body");
    if (!tbody) return;

    const products = await getProducts();

    if (!products || products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8 text-slate-500 font-mono">
                    Không có dữ liệu sản phẩm trong hệ thống.
                </td>
            </tr>`;
        updateStats([]);
        return;
    }

    // Cập nhật thống kê & Render danh sách
    updateStats(products);
    tbody.innerHTML = products.map(renderTableRow).join("");
}

// 2. TEMPLATE RENDER: Tạo HTML cho từng dòng sản phẩm
function renderTableRow(product) {
    const stock = Number(product.stock || 0);
    const { stockText, barColor, percent } = calculateStockStatus(stock);
    const imageUrl = product.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200';

    return `
        <tr class="hover:bg-slate-800/30 transition-colors border-b border-slate-800/60">
            <td class="py-3.5 px-4 text-center">
                <input type="checkbox" class="rounded bg-slate-800 border-slate-700 text-cyan-500">
            </td>
            <td class="py-3.5 px-4">
                <div class="flex items-center space-x-3">
                    <img src="${imageUrl}" class="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0" alt="${product.name}">
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
            <td class="py-3.5 px-4 font-mono font-bold text-cyan-400">${formatCurrency(product.price)}</td>
            <td class="py-3.5 px-4">
                <div class="w-28 space-y-1">
                    <div class="flex justify-between text-[10px] font-mono">
                        <span class="text-slate-300">${stock} cái</span>
                        ${stockText}
                    </div>
                    <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div class="${barColor} h-full rounded-full transition-all duration-500" style="width: ${percent}%;"></div>
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
}

// 3. HELPER: Tính toán trạng thái kho hàng
function calculateStockStatus(stock) {
    if (stock === 0) {
        return { stockText: `<span class="text-rose-400">Hết hàng</span>`, barColor: 'bg-rose-500', percent: 0 };
    }
    if (stock < 20) {
        return { stockText: `<span class="text-amber-400">Sắp hết</span>`, barColor: 'bg-amber-400', percent: Math.min(100, Math.round((stock / 400) * 100)) };
    }
    return { stockText: `<span class="text-emerald-400">Đủ hàng</span>`, barColor: 'bg-emerald-400', percent: Math.min(100, Math.round((stock / 400) * 100)) };
}

// 4. THỐNG KÊ: Cập nhật 4 thẻ chỉ số
function updateStats(products = []) {
    const total = products.length;
    const instock = products.filter(p => Number(p.stock || 0) >= 20).length;
    const lowstock = products.filter(p => Number(p.stock || 0) > 0 && Number(p.stock || 0) < 20).length;
    const outstock = products.filter(p => Number(p.stock || 0) === 0).length;

    const setStat = (id, value, labelClass, labelText) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = `${value} <span class="text-xs font-normal ${labelClass}">${labelText}</span>`;
    };

    setStat("stat-total", total, "text-slate-400", "SKUs");
    setStat("stat-instock", instock, "text-slate-400", "Đang bán");
    setStat("stat-lowstock", lowstock, "text-amber-500/80", "< 20 units");
    setStat("stat-outstock", outstock, "text-rose-500/80", "Restock req");
}

// 5. EVENT DELEGATION: Xử lý sự kiện click trên bảng (Sửa / Xóa)
function bindTableEvents() {
    const tbody = document.getElementById("product-table-body");
    if (!tbody || tbody.dataset.hasListener) return;

    tbody.addEventListener("click", async (e) => {
        const editBtn = e.target.closest(".btn-edit");
        const deleteBtn = e.target.closest(".btn-delete");

        if (editBtn) {
            const id = editBtn.getAttribute("data-id");
            await handleEditProduct(id);
        } else if (deleteBtn) {
            const id = deleteBtn.getAttribute("data-id");
            await handleDeleteProduct(id);
        }
    });

    tbody.dataset.hasListener = "true"; // Đánh dấu tránh gán lặp lại listener
}

// Xử lý Xóa
async function handleDeleteProduct(id) {
    if (confirm("Xác nhận xóa sản phẩm này khỏi hệ thống NovaPad?")) {
        const ok = await deleteProduct(id);
        if (ok) {
            renderProducts();
        } else {
            alert("Xóa thất bại!");
        }
    }
}

// Xử lý Sửa
async function handleEditProduct(id) {
    const product = await getProductById(id);
    if (!product) return;

    setModalFields({
        id: product.id,
        name: product.name || "",
        sku: product.sku || "",
        price: product.price || 0,
        stock: product.stock || 0,
        image: product.image || ""
    });

    document.getElementById("modal-title").innerText = `SỬA SẢN PHẨM #${product.id}`;
    toggleModal(true);
}

// Helper điền thông tin vào Modal Form
function setModalFields({ id = "", name = "", sku = "", price = 0, stock = 0, image = "" }) {
    document.getElementById("prod-id").value = id;
    document.getElementById("prod-name").value = name;
    document.getElementById("prod-sku").value = sku;
    document.getElementById("prod-price").value = price;
    document.getElementById("prod-stock").value = stock;
    document.getElementById("prod-image").value = image;
}

// 6. KHỞI TẠO MODULE
export function initProductModule() {
    const form = document.getElementById("product-form");
    const btnOpen = document.getElementById("btn-open-modal");
    const btnClose = document.getElementById("btn-close-modal");

    // Mở Modal (Thêm mới)
    btnOpen?.addEventListener("click", () => {
        form?.reset();
        setModalFields({});
        document.getElementById("modal-title").innerText = "THÊM SẢN PHẨM MỚI";
        toggleModal(true);
    });

    // Đóng Modal
    btnClose?.addEventListener("click", () => toggleModal(false));

    // Submit Form
    form?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = document.getElementById("prod-id").value;
        const payload = {
            name: document.getElementById("prod-name").value,
            sku: document.getElementById("prod-sku").value,
            price: Number(document.getElementById("prod-price").value),
            stock: Number(document.getElementById("prod-stock").value),
            image: document.getElementById("prod-image").value
        };

        const success = id ? await updateProduct(id, payload) : await createProduct(payload);

        if (success !== false) {
            toggleModal(false);
            renderProducts();
        }
    });

    bindTableEvents();
    renderProducts();
}

// Helper Ẩn/Hiện Modal
function toggleModal(show) {
    const modal = document.getElementById("product-modal");
    if (modal) {
        modal.classList.toggle("hidden", !show);
    }
}

// Tự động khởi chạy khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", initProductModule);