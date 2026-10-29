// admin/controllers/categoryController.js
import { getCategories, createCategory, updateCategory, deleteCategory, getProducts } from "../../app/services/api.js";

class CategoryAdminController {
    constructor() {
        this.categories = [];
        this.editId = null;
        this.keyword = "";

        this.el = {
            form: document.querySelector("#categoryForm"),
            name: document.querySelector("#categoryName"),
            slug: document.querySelector("#categorySlug"),
            desc: document.querySelector("#categoryDesc"),
            sort: document.querySelector("#sortOrder"),
            status: document.querySelector("#categoryStatus"),
            tableBody: document.querySelector("#categoryTableBody"),
            search: document.querySelector("#categorySearch"),
            modeBadge: document.querySelector("#categoryFormMode"),
            submitText: document.querySelector("#categorySubmitText"),
            statTotal: document.querySelector("#statTotalCount")
        };

        this.initGlobals();
    }

    async init() {
        // Kiểm tra nếu đang ở trang khách hàng products.html thì render danh mục và kích hoạt bộ lọc client-side
        if (window.location.pathname.includes("products.html")) {
            await this.renderStoreCategories();
            this.initStoreFilterEvents();
            return;
        }

        // Ngược lại, nếu đang ở trang quản trị category.html thì chạy các chức năng admin
        await this.loadCategories();
        this.bindEvents();
    }

    async loadCategories() {
        if (this.el.tableBody) {
            this.el.tableBody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-slate-500 font-mono">Đang tải dữ liệu danh mục...</td></tr>`;
        }
        this.categories = await getCategories();
        this.renderTable();
        this.updateStats();
    }

    renderTable() {
        if (!this.el.tableBody) return;
        const filtered = this.categories.filter(c => 
            (c.name && c.name.toLowerCase().includes(this.keyword)) || 
            (c.slug && c.slug.toLowerCase().includes(this.keyword))
        );

        if (!filtered.length) {
            this.el.tableBody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-slate-500 font-mono">Không có danh mục nào.</td></tr>`;
            return;
        }

        this.el.tableBody.innerHTML = "";
        filtered.forEach(cat => {
            const tr = document.createElement("tr");
            tr.className = "hover:bg-slate-800/40 transition";
            
            const isVisible = cat.status !== false && cat.status !== "false";
            const statusBadge = isVisible 
                ? `<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-500/20">HIỂN THỊ</span>`
                : `<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400">ĐÃ ẨN</span>`;

            tr.innerHTML = `
                <td class="p-3">
                    <div class="font-bold text-white">${cat.name || '---'}</div>
                    <div class="text-[10px] text-cyan-400 font-mono">/catalog/${cat.slug || '---'}</div>
                </td>
                <td class="p-3 text-slate-400 text-xs max-w-[200px] truncate">${cat.description || 'Không có mô tả'}</td>
                <td class="p-3">${statusBadge}</td>
                <td class="p-3 text-right space-x-1 font-mono">
                    <button onclick="window.editCategory('${cat.id}')" class="text-cyan-400 px-2 py-1 bg-cyan-500/10 rounded hover:bg-cyan-500/20">Sửa</button>
                    <button onclick="window.deleteCategoryItem('${cat.id}')" class="text-red-400 px-2 py-1 bg-red-500/10 rounded hover:bg-red-500/20">Xóa</button>
                </td>
            `;
            this.el.tableBody.appendChild(tr);
        });
    }

    updateStats() {
        if (this.el.statTotal) {
            this.el.statTotal.innerText = `${this.categories.length} DANH MỤC`;
        }
    }

    // Hàm render danh mục tự động ra sidebar của trang products.html với UI chuẩn không bị lệch
    async renderStoreCategories() {
        const container = document.getElementById("store-categories-list");
        if (!container) return;

        const categories = await getCategories();
        
        if (!categories || categories.length === 0) {
            container.innerHTML = `<span class="text-xs text-gray-500 font-mono">Chưa có danh mục.</span>`;
            return;
        }

        container.innerHTML = "";
        categories.forEach(cat => {
            if (cat.status !== false) {
                const label = document.createElement("label");
                label.className = "flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer";
                label.innerHTML = `
                    <input type="checkbox" value="${cat.name}" data-slug="${cat.slug || ''}" class="category-filter rounded border-gray-700 bg-gray-900 text-cyan-400 focus:ring-0 shrink-0">
                    <span class="truncate">${cat.name}</span>
                `;
                container.appendChild(label);
            }
        });
    }

    // Tự động gán bộ lọc ngay tại file này khi ở trang products.html
    initStoreFilterEvents() {
        document.addEventListener("change", async (e) => {
            if (e.target.classList.contains("category-filter")) {
                const checkedBoxes = document.querySelectorAll(".category-filter:checked");
                const selectedNames = Array.from(checkedBoxes).map(cb => cb.value.toLowerCase().trim());

                // Lấy toàn bộ sản phẩm từ API
                const products = await getProducts();
                const grid = document.getElementById("catalog-products-grid");
                const countEl = document.getElementById("result-count");
                if (!grid) return;

                // Lọc sản phẩm dựa theo từ khóa tên danh mục xuất hiện trong tên/mô tả sản phẩm
                const filtered = selectedNames.length === 0 
                    ? products 
                    : products.filter(p => {
                          const textToMatch = ((p.name || "") + " " + (p.spec || "") + " " + (p.sku || "")).toLowerCase();
                          return selectedNames.some(name => textToMatch.includes(name));
                      });

                // Cập nhật số lượng hiển thị
                if (countEl) countEl.innerText = filtered.length;

                // Render lại lưới sản phẩm ngoài giao diện client
                if (filtered.length === 0) {
                    grid.innerHTML = `<div class="col-span-full py-12 text-center text-gray-500 font-mono text-xs">Không tìm thấy sản phẩm phù hợp với danh mục này.</div>`;
                    return;
                }

                // Render lại danh sách sản phẩm khớp bộ lọc
                grid.innerHTML = filtered.map(product => {
                    const imageUrl = product.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400';
                    const priceFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price || 0);
                    return `
                        <div class="bg-[#090e17] border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500/40 transition">
                            <div>
                                <div class="h-44 w-full bg-[#0d1424] rounded-lg overflow-hidden flex items-center justify-center mb-3">
                                    <img src="${imageUrl}" alt="${product.name}" class="h-full w-full object-cover">
                                </div>
                                <span class="text-[10px] font-mono text-cyan-400 block mb-1">SKU: ${product.sku || 'N/A'}</span>
                                <h4 class="text-white font-bold text-sm mb-2">${product.name}</h4>
                            </div>
                            <div class="pt-3 border-t border-gray-800/80 flex items-center justify-between">
                                <span class="font-mono text-cyan-400 font-bold">${priceFormatted}</span>
                                <button onclick="window.handleAddCatalogItem && window.handleAddCatalogItem('${product.id}')" class="text-xs font-mono bg-cyan-500/10 text-cyan-400 px-3 py-1.5 rounded hover:bg-cyan-500/20 transition">Thêm vào giỏ</button>
                            </div>
                        </div>
                    `;
                }).join("");
            }
        });
    }

    bindEvents() {
        // Tự động sinh slug từ tên danh mục
        if (this.el.name && this.el.slug) {
            this.el.name.oninput = () => {
                if (!this.editId) {
                    const slug = this.el.name.value
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "");
                    this.el.slug.value = slug;
                }
            };
        }

        // Tìm kiếm nhanh danh mục
        if (this.el.search) {
            this.el.search.oninput = (e) => {
                this.keyword = e.target.value.toLowerCase().trim();
                this.renderTable();
            };
        }

        // Xử lý submit form (Thêm mới hoặc Cập nhật)
        if (this.el.form) {
            this.el.form.onsubmit = async (e) => {
                e.preventDefault();
                const name = this.el.name.value.trim();
                if (!name) return alert("Vui lòng nhập tên danh mục!");

                const catData = {
                    name,
                    slug: this.el.slug.value.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    description: this.el.desc.value.trim(),
                    sortOrder: parseInt(this.el.sort.value) || 1,
                    status: this.el.status.value === "true"
                };

                if (this.editId) {
                    const res = await updateCategory(this.editId, catData);
                    if (res) {
                        alert("Cập nhật danh mục thành công!");
                        this.createNewCategory();
                        await this.loadCategories();
                    } else {
                        alert("Cập nhật thất bại!");
                    }
                } else {
                    const res = await createCategory(catData);
                    if (res) {
                        alert("Thêm danh mục mới thành công!");
                        this.createNewCategory();
                        await this.loadCategories();
                    } else {
                        alert("Thêm thất bại!");
                    }
                }
            };
        }
    }

    editCategory(id) {
        const cat = this.categories.find(c => String(c.id) === String(id));
        if (!cat) return;

        this.editId = cat.id;
        this.el.name.value = cat.name || "";
        this.el.slug.value = cat.slug || "";
        this.el.desc.value = cat.description || "";
        this.el.sort.value = cat.sortOrder || 1;
        this.el.status.value = cat.status !== false && cat.status !== "false" ? "true" : "false";

        if (this.el.modeBadge) {
            this.el.modeBadge.innerText = `SỬA #${cat.id}`;
            this.el.modeBadge.className = "text-[10px] bg-amber-950/80 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded uppercase font-mono";
        }
        if (this.el.submitText) this.el.submitText.innerText = "CẬP NHẬT DANH MỤC";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async deleteCategoryItem(id) {
        if (confirm("Gỡ bỏ danh mục này?")) {
            const ok = await deleteCategory(id);
            if (ok) {
                alert("Xóa danh mục thành công!");
                await this.loadCategories();
            } else {
                alert("Xóa thất bại!");
            }
        }
    }

    createNewCategory() {
        this.editId = null;
        if (this.el.form) this.el.form.reset();
        if (this.el.modeBadge) {
            this.el.modeBadge.innerText = "THÊM MỚI";
            this.el.modeBadge.className = "text-[10px] bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded uppercase font-mono";
        }
        if (this.el.submitText) this.el.submitText.innerText = "LƯU DANH MỤC";
    }

    initGlobals() {
        window.editCategory = (id) => this.editCategory(id);
        window.deleteCategoryItem = (id) => this.deleteCategoryItem(id);
        window.createNewCategory = () => this.createNewCategory();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new CategoryAdminController().init();
});