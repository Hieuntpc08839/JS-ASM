// admin/controllers/categoryController.js
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../app/services/api.js";

class CategoryController {
    constructor() {
        this.form = document.querySelector("#categoryForm");
        this.nameInput = document.querySelector("#categoryName");
        this.slugInput = document.querySelector("#categorySlug");
        this.parentSelect = document.querySelector("#parentCategory");
        this.descInput = document.querySelector("#categoryDesc");
        this.sortOrderInput = document.querySelector("#sortOrder");
        this.toggleStatusBtn = document.querySelector("#toggleStatusBtn");
        this.toggleDot = document.querySelector("#toggleDot");
        this.statusText = document.querySelector("#statusText");
        
        this.treeContainer = document.querySelector("#categoryTree");
        this.searchInput = document.querySelector("#categorySearch");
        this.formModeBadge = document.querySelector("#categoryFormMode");
        this.submitText = document.querySelector("#categorySubmitText");
        this.resetBtn = document.querySelector("#btnResetForm");
        
        this.editIdInput = null;
        this.isActive = true;
        this.categoriesData = [];
        
        this.initEditIdField();
    }

    initEditIdField() {
        if (!this.form) return;
        if (!document.querySelector("#edit-category-id")) {
            const input = document.createElement("input");
            input.type = "hidden";
            input.id = "edit-category-id";
            this.form.appendChild(input);
        }
        this.editIdInput = document.querySelector("#edit-category-id");
    }

    async init() {
        await this.loadCategories();
        this.bindEvents();
    }

    async loadCategories() {
        if (this.treeContainer) {
            this.treeContainer.innerHTML = `<p class="text-xs text-gray-500 font-mono">Đang tải danh mục...</p>`;
        }
        this.categoriesData = await getCategories();
        this.renderTree(this.categoriesData);
        this.updateTotalStat(this.categoriesData.length);
        this.populateParentDropdown(this.categoriesData);
    }

    renderTree(categories) {
        if (!this.treeContainer) return;
        this.treeContainer.innerHTML = "";

        if (!categories || categories.length === 0) {
            this.treeContainer.innerHTML = `<p class="text-xs text-gray-500 font-mono">Chưa có danh mục nào.</p>`;
            return;
        }

        categories.forEach(cat => {
            const item = document.createElement("div");
            item.className = "bg-[#0b0f17] border border-[#1f293d] rounded p-3 flex items-center justify-between hover:border-cyan-500/40 transition";
            
            const statusBadge = cat.status !== false 
                ? `<span class="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded font-mono">HIỂN THỊ</span>`
                : `<span class="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-mono">ẨN</span>`;

            item.innerHTML = `
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-mono text-cyan-400">#${cat.id}</span>
                        <h4 class="text-sm font-bold text-white">${cat.name}</h4>
                        ${statusBadge}
                    </div>
                    <p class="text-[11px] text-gray-400 font-mono">Slug: /catalog/${cat.slug || '---'} | Thứ tự: ${cat.sortOrder || 1}</p>
                    ${cat.description ? `<p class="text-xs text-gray-300">${cat.description}</p>` : ''}
                </div>
                <div class="flex items-center gap-2 font-mono text-xs">
                    <button type="button" class="btn-edit text-cyan-400 hover:underline px-2 py-1 bg-cyan-500/10 rounded" data-id="${cat.id}">[SỬA]</button>
                    <button type="button" class="btn-delete text-red-400 hover:underline px-2 py-1 bg-red-500/10 rounded" data-id="${cat.id}">[XÓA]</button>
                </div>
            `;

            // Xử lý Xóa
            item.querySelector(".btn-delete").addEventListener("click", async () => {
                if (confirm(`Bạn có chắc muốn xóa danh mục "${cat.name}"?`)) {
                    const ok = await deleteCategory(cat.id);
                    if (ok) {
                        alert("Xóa danh mục thành công!");
                        this.loadCategories();
                    } else {
                        alert("Xóa thất bại!");
                    }
                }
            });

            // Xử lý Sửa (Đưa dữ liệu lên form)
            item.querySelector(".btn-edit").addEventListener("click", () => {
                this.editIdInput.value = cat.id;
                if (this.nameInput) this.nameInput.value = cat.name;
                if (this.slugInput) this.slugInput.value = cat.slug || "";
                if (this.parentSelect) this.parentSelect.value = cat.parentCategory || "root";
                if (this.descInput) this.descInput.value = cat.description || "";
                if (this.sortOrderInput) this.sortOrderInput.value = cat.sortOrder || 1;
                
                this.isActive = cat.status !== false;
                this.updateStatusToggleUI();

                if (this.formModeBadge) {
                    this.formModeBadge.innerText = "SỬA #" + cat.id;
                    this.formModeBadge.className = "text-[10px] bg-yellow-950 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded uppercase font-mono";
                }
                if (this.submitText) this.submitText.innerText = "CẬP NHẬT DANH MỤC";
                this.form.scrollIntoView({ behavior: 'smooth' });
            });

            this.treeContainer.appendChild(item);
        });
    }

    populateParentDropdown(categories) {
        if (!this.parentSelect) return;
        this.parentSelect.innerHTML = `<option value="root">-- Danh mục gốc --</option>`;
        categories.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat.id;
            opt.textContent = cat.name;
            this.parentSelect.appendChild(opt);
        });
    }

    updateTotalStat(count) {
        const statEl = document.getElementById("statTotalCount");
        if (statEl) {
            statEl.innerText = `${count} DANH MỤC`;
        }
    }

    updateStatusToggleUI() {
        if (!this.toggleStatusBtn) return;
        if (this.isActive) {
            this.toggleStatusBtn.setAttribute("aria-pressed", "true");
            this.toggleStatusBtn.className = "w-10 h-5 bg-cyan-400 rounded-full relative p-0.5 transition";
            if (this.toggleDot) this.toggleDot.className = "w-4 h-4 bg-black rounded-full translate-x-5 transition";
            if (this.statusText) {
                this.statusText.innerText = "HIỂN THỊ";
                this.statusText.className = "text-cyan-400 font-bold text-[11px] uppercase";
            }
        } else {
            this.toggleStatusBtn.setAttribute("aria-pressed", "false");
            this.toggleStatusBtn.className = "w-10 h-5 bg-gray-700 rounded-full relative p-0.5 transition";
            if (this.toggleDot) this.toggleDot.className = "w-4 h-4 bg-black rounded-full translate-x-0 transition";
            if (this.statusText) {
                this.statusText.innerText = "ĐÃ ẨN";
                this.statusText.className = "text-gray-400 font-bold text-[11px] uppercase";
            }
        }
    }

    bindEvents() {
        // Tự động tạo slug khi gõ tên
        if (this.nameInput && this.slugInput) {
            this.nameInput.addEventListener("input", () => {
                if (!this.editIdInput.value) {
                    const slug = this.nameInput.value
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "");
                    this.slugInput.value = slug;
                }
            });
        }

        // Toggle trạng thái hiển thị
        if (this.toggleStatusBtn) {
            this.toggleStatusBtn.addEventListener("click", () => {
                this.isActive = !this.isActive;
                this.updateStatusToggleUI();
            });
        }

        // Thêm mới hoặc Cập nhật
        if (this.form) {
            this.form.addEventListener("submit", async (e) => {
                e.preventDefault();
                const name = this.nameInput ? this.nameInput.value.trim() : "";
                const slug = this.slugInput ? this.slugInput.value.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : "";
                const parentCategory = this.parentSelect ? this.parentSelect.value : "root";
                const description = this.descInput ? this.descInput.value.trim() : "";
                const sortOrder = parseInt(this.sortOrderInput ? this.sortOrderInput.value : 1) || 1;
                const status = this.isActive;
                const editId = this.editIdInput ? this.editIdInput.value : "";

                if (!name) {
                    alert("Vui lòng nhập tên danh mục!");
                    return;
                }

                const catData = { name, slug, parentCategory, description, sortOrder, status };

                if (editId) {
                    const res = await updateCategory(editId, catData);
                    if (res) {
                        alert("Cập nhật danh mục thành công!");
                        this.resetForm();
                        this.loadCategories();
                    } else {
                        alert("Cập nhật thất bại!");
                    }
                } else {
                    const res = await createCategory(catData);
                    if (res) {
                        alert("Thêm danh mục thành công!");
                        this.resetForm();
                        this.loadCategories();
                    } else {
                        alert("Thêm thất bại!");
                    }
                }
            });
        }

        // Nút Làm mới / Hủy
        if (this.resetBtn) {
            this.resetBtn.addEventListener("click", () => {
                this.resetForm();
            });
        }

        // Tìm kiếm danh mục
        if (this.searchInput) {
            this.searchInput.addEventListener("input", (e) => {
                const keyword = e.target.value.toLowerCase().trim();
                const filtered = this.categoriesData.filter(cat => 
                    cat.name.toLowerCase().includes(keyword) || (cat.slug && cat.slug.toLowerCase().includes(keyword))
                );
                this.renderTree(filtered);
            });
        }
    }

    resetForm() {
        this.form.reset();
        if (this.editIdInput) this.editIdInput.value = "";
        this.isActive = true;
        this.updateStatusToggleUI();
        if (this.formModeBadge) {
            this.formModeBadge.innerText = "THÊM MỚI";
            this.formModeBadge.className = "text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded uppercase font-mono";
        }
        if (this.submitText) this.submitText.innerText = "THÊM DANH MỤC";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new CategoryController().init();
});