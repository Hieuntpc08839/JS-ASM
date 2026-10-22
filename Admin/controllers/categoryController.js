import { getCategories, createCategory, deleteCategory } from '../../app/services/api.js';

let currentEditingId = null;
let currentPage = 1;
const itemsPerPage = 6; // Số lượng danh mục gốc hiển thị trên mỗi trang
let collapsedCategories = {}; // Lưu trạng thái thu gọn/mở rộng của danh mục cha

// --- HÀM LOAD DANH SÁCH VÀO DROPDOWN DANH MỤC CHA (PHÂN CẤP CHA - CON CHUẨN XÁC) ---
async function loadParentCategories(currentId = null) {
    const parentSelect = document.getElementById('parentCategory');
    if (!parentSelect) return;

    const categories = await getCategories();
    let html = '<option value="root">-- Danh mục Gốc (Root) --</option>';

    if (categories) {
        const roots = categories.filter(c => (!c.parent_id || c.parent_id === 'root' || c.parent_id === '') && c.id !== currentId);

        roots.forEach(parent => {
            html += `<option value="${parent.id}"> ${parent.name}</option>`;
            const children = categories.filter(c => c.parent_id === parent.id && c.id !== currentId);
            children.forEach(child => {
                html += `<option value="${child.id}">&nbsp;&nbsp;&nbsp;&nbsp;└─ ${child.name}</option>`;
            });
        });
    }
    parentSelect.innerHTML = html;
}

// --- HÀM BẬT/TẮT THU GỌN DANH MỤC CHA ---
window.toggleCategoryCollapse = function(parentId) {
    collapsedCategories[parentId] = !collapsedCategories[parentId];
    renderCategoryTree();
};

// --- 1. RENDER CÂY DANH MỤC CÓ PHÂN TRANG 6 GỐC/TRANG VÀ KÉO THẢ ---
async function renderCategoryTree() {
    const categories = await getCategories();
    
    // Tìm khung chứa danh sách danh mục
    let container = document.querySelector('.space-y-3');
    if (!container) return;

    let html = '';

    if (!categories || categories.length === 0) {
        html = '<div class="text-gray-500 text-center py-4">Chưa có danh mục nào trên hệ thống.</div>';
        container.innerHTML = html;
        let oldPag = document.getElementById('categoryPagination');
        if (oldPag) oldPag.remove();
        return;
    }

    // Lọc toàn bộ danh mục gốc và sắp xếp theo sortOrder
    const roots = categories
        .filter(c => !c.parent_id || c.parent_id === 'root' || c.parent_id === '')
        .sort((a, b) => (Number(a.sortOrder) || 1) - (Number(b.sortOrder) || 1));

    const totalPages = Math.ceil(roots.length / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedRoots = roots.slice(startIdx, startIdx + itemsPerPage);

    paginatedRoots.forEach(parent => {
        html += renderCategoryItem(parent, categories);

        if (!collapsedCategories[parent.id]) {
            const children = categories
                .filter(c => c.parent_id === parent.id)
                .sort((a, b) => (Number(a.sortOrder) || 1) - (Number(b.sortOrder) || 1));

            children.forEach(child => {
                html += renderCategoryItem(child, categories);
            });
        }
    });

    container.innerHTML = html;

    // --- XỬ LÝ KHUNG PHÂN TRANG BÊN DƯỚI ---
    let wrapperSection = container.closest('div.bg-\\[\\#111827\\]') || container.parentElement;
    let paginationContainer = document.getElementById('categoryPagination');
    
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'categoryPagination';
        paginationContainer.className = 'flex items-center justify-center space-x-2 mt-6 pt-4 border-t border-[#1e293b]';
        wrapperSection.appendChild(paginationContainer);
    }

    let paginationHtml = '';
    if (totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                paginationHtml += `
                    <button onclick="window.changeCategoryPage(${i})" class="w-10 h-10 bg-cyan-400 text-black font-bold rounded flex items-center justify-center shadow transition">
                        ${i}
                    </button>
                `;
            } else {
                paginationHtml += `
                    <button onclick="window.changeCategoryPage(${i})" class="w-10 h-10 bg-[#111827] text-slate-300 border border-[#1e293b] font-bold rounded flex items-center justify-center hover:bg-slate-800 transition">
                        ${i}
                    </button>
                `;
            }
        }
    }
    paginationContainer.innerHTML = paginationHtml;

    // Kích hoạt tính năng kéo thả trực tiếp trên giao diện danh mục
    initDragAndDrop();
}

// Hàm render chi tiết từng dòng danh mục (hỗ trợ kéo thả draggable)
function renderCategoryItem(item, allCategories) {
    const isHidden = item.status === false;
    const statusText = isHidden ? 'ẨN' : 'HIỂN THỊ';
    const statusColor = isHidden ? 'text-gray-500' : 'text-cyan-400';

    const iconContent = item.icon || `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a2 2 0 01-2 2 2 2 0 01-2-2V4zM4 8a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V8z"></path>
        </svg>
    `;

    const isChild = item.parent_id && item.parent_id !== 'root' && item.parent_id !== '';
    const indentClass = isChild ? 'ml-8 border-l-2 border-cyan-500/40 pl-3 mt-1' : 'mt-2';
    const badgeClass = isChild 
        ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' 
        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    const badgeText = isChild ? 'CON' : 'GỐC';
    const sortOrderVal = item.sortOrder !== undefined && item.sortOrder !== null ? item.sortOrder : 1;

    let toggleArrowHtml = '';
    if (!isChild) {
        const hasChildren = allCategories.some(c => c.parent_id === item.id);
        if (hasChildren) {
            const isCollapsed = collapsedCategories[item.id];
            const arrowSvg = isCollapsed ? `
                <svg class="w-4 h-4 transform -rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            ` : `
                <svg class="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            `;
            toggleArrowHtml = `
                <button onclick="window.toggleCategoryCollapse('${item.id}')" class="p-1 hover:bg-gray-800 rounded text-cyan-400 transition mr-1" title="Thu gọn / Mở rộng">
                    ${arrowSvg}
                </button>
            `;
        }
    }

    return `
        <div class="category-draggable-item bg-[#0b0f17] border border-[#1f293d] rounded p-3 ${indentClass} cursor-move transition hover:border-cyan-500/50" draggable="true" data-id="${item.id}">
            <div class="flex items-center justify-between pointer-events-none">
                <div class="flex items-center space-x-3 pointer-events-auto">
                    ${toggleArrowHtml}
                    <span class="cursor-grab text-gray-400 hover:text-white font-bold select-none" title="Giữ để kéo thả">:::</span>
                    <div class="w-8 h-8 bg-cyan-950/60 border border-cyan-500/30 rounded flex items-center justify-center text-cyan-400">
                        ${iconContent}
                    </div>
                    <div>
                        <div class="flex items-center space-x-2">
                            <span class="font-bold text-white text-sm">${item.name}</span>
                            <span class="text-[9px] ${badgeClass} border px-1.5 py-0.2 rounded font-mono uppercase">${badgeText}</span>
                            <span class="text-[10px] text-gray-400 font-mono bg-gray-800 px-1 rounded">STT: <span class="item-sort-display">${sortOrderVal}</span></span>
                        </div>
                        <span class="text-[10px] text-gray-500 font-mono">id: ${item.id}</span>
                    </div>
                </div>

                <div class="flex items-center space-x-3 text-xs pointer-events-auto">
                    <span class="${statusColor} font-bold text-[10px]">${statusText}</span>
                    <button onclick="window.onEditCategory('${item.id}', '${item.name.replace(/'/g, "\\'")}', '${item.slug || ''}', '${item.parent_id || ''}', '${(item.description || '').replace(/'/g, "\\'")}', ${item.status}, ${sortOrderVal})" class="p-1 hover:bg-gray-800 rounded text-gray-400 transition" title="Sửa">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        </svg>
                    </button>
                    <button onclick="window.onDeleteCategory('${item.id}')" class="p-1 hover:bg-gray-800 rounded text-red-400 transition" title="Xóa">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// --- LOGIC KÉO THẢ SẮP XẾP TRỰC TIẾP ---
function initDragAndDrop() {
    const container = document.querySelector('.space-y-3');
    if (!container) return;

    let draggedItem = null;

    const items = container.querySelectorAll('.category-draggable-item');
    items.forEach(item => {
        item.addEventListener('dragstart', function(e) {
            draggedItem = this;
            setTimeout(() => this.classList.add('opacity-40', 'border-dashed', 'border-cyan-400'), 0);
        });

        item.addEventListener('dragend', function() {
            this.classList.remove('opacity-40', 'border-dashed', 'border-cyan-400');
            draggedItem = null;
            // Cập nhật lại số thứ tự hiển thị tạm thời trên giao diện
            updateSortOrderNumbers();
        });

        item.addEventListener('dragover', function(e) {
            e.preventDefault();
        });

        item.addEventListener('drop', function(e) {
            e.preventDefault();
            if (this !== draggedItem) {
                let allItems = Array.from(container.querySelectorAll('.category-draggable-item'));
                let draggedIdx = allItems.indexOf(draggedItem);
                let targetIdx = allItems.indexOf(this);

                if (draggedIdx < targetIdx) {
                    this.after(draggedItem);
                } else {
                    this.before(draggedItem);
                }
            }
        });
    });
}

// Cập nhật lại số thứ tự STT hiển thị trên màn hình sau khi kéo thả
function updateSortOrderNumbers() {
    const container = document.querySelector('.space-y-3');
    if (!container) return;
    const items = container.querySelectorAll('.category-draggable-item');
    items.forEach((item, index) => {
        const sortDisplay = item.querySelector('.item-sort-display');
        if (sortDisplay) {
            sortDisplay.textContent = index + 1;
        }
    });
}

// --- XỬ LÝ NÚT "ĐỒNG BỘ THỨ TỰ" ---
document.addEventListener('DOMContentLoaded', () => {
    // Tìm nút có chữ "Đồng Bộ Thứ Tự"
    const syncBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('ĐỒNG BỘ THỨ TỰ'));
    if (syncBtn) {
        syncBtn.addEventListener('click', async () => {
            const container = document.querySelector('.space-y-3');
            if (!container) return;

            const items = container.querySelectorAll('.category-draggable-item');
            const categories = await getCategories();

            let updatePromises = Array.from(items).map(async (item, index) => {
                const id = item.getAttribute('data-id');
                const categoryObj = categories.find(c => c.id === id);
                if (categoryObj) {
                    categoryObj.sortOrder = index + 1;
                    return fetch(`http://localhost:3000/categories/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(categoryObj)
                    });
                }
            });

            try {
                await Promise.all(updatePromises);
                alert('Đã đồng bộ và lưu thứ tự mới thành công!');
                await renderCategoryTree();
            } catch (err) {
                console.error('Lỗi đồng bộ thứ tự:', err);
                alert('Có lỗi xảy ra khi lưu thứ tự.');
            }
        });
    }
});

window.changeCategoryPage = function(page) {
    currentPage = page;
    renderCategoryTree();
};

window.resetForm = async function() {
    const form = document.getElementById('categoryForm');
    if (form) form.reset();
    
    if (document.getElementById('categoryName')) document.getElementById('categoryName').value = '';
    if (document.getElementById('categorySlug')) document.getElementById('categorySlug').value = '';
    if (document.getElementById('categoryDesc')) document.getElementById('categoryDesc').value = '';
    if (document.getElementById('sortOrder')) document.getElementById('sortOrder').value = '1';
    
    currentEditingId = null; 
    await loadParentCategories();
};

window.addNewCategory = function() {
    window.resetForm(); 
    const nameInput = document.getElementById('categoryName');
    if (nameInput) nameInput.focus(); 
};

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('categoryName');
    const slugInput = document.getElementById('categorySlug');
    const parentSelect = document.getElementById('parentCategory');
    const descInput = document.getElementById('categoryDesc');
    const sortOrderInput = document.getElementById('sortOrder');

    const name = nameInput ? nameInput.value.trim() : '';
    let slug = slugInput ? slugInput.value.trim() : '';
    const parentId = parentSelect ? parentSelect.value : 'root';
    const description = descInput ? descInput.value.trim() : '';
    const sortOrder = sortOrderInput ? Number(sortOrderInput.value) || 1 : 1;

    if (!name) {
        alert('Vui lòng nhập tên danh mục!');
        return;
    }

    if (!slug) {
        slug = name.toLowerCase()
                   .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                   .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                   .replace(/[^a-z0-9 ]/g, '')
                   .trim().replace(/\s+/g, '-');
    }

    const activeIconBtn = document.querySelector('.grid.grid-cols-5.gap-2 button.border-cyan-400');
    const iconSvg = activeIconBtn ? activeIconBtn.innerHTML : '';

    const toggleBtn = document.getElementById('toggleStatusBtn');
    const isVisible = toggleBtn ? toggleBtn.classList.contains('bg-cyan-400') : true;

    const categoryData = {
        name: name,
        slug: slug,
        parent_id: parentId === 'root' ? null : parentId,
        description: description,
        icon: iconSvg,
        status: isVisible,
        sortOrder: sortOrder
    };

    if (currentEditingId) {
        try {
            await fetch(`http://localhost:3000/categories/${currentEditingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(categoryData)
            });
            alert('Cập nhật danh mục thành công!');
        } catch (err) {
            console.error('Lỗi khi sửa:', err);
        }
    } else {
        const result = await createCategory(categoryData);
        if (result) {
            alert('Đã thêm danh mục mới thành công!');
        }
    }

    window.resetForm();
    await renderCategoryTree();
}

window.onEditCategory = async function(id, name, slug, parentId, description, status, sortOrder) {
    currentEditingId = id;
    
    if (document.getElementById('categoryName')) document.getElementById('categoryName').value = name || '';
    if (document.getElementById('categorySlug')) document.getElementById('categorySlug').value = slug || '';
    if (document.getElementById('categoryDesc')) document.getElementById('categoryDesc').value = description || '';
    if (document.getElementById('sortOrder')) document.getElementById('sortOrder').value = sortOrder !== undefined ? sortOrder : 1;
    
    await loadParentCategories(id);
    if (document.getElementById('parentCategory')) {
        document.getElementById('parentCategory').value = parentId || 'root';
    }

    const toggleBtn = document.getElementById('toggleStatusBtn');
    const toggleDot = document.getElementById('toggleDot');
    const statusText = document.getElementById('statusText');

    if (toggleBtn && toggleDot && statusText) {
        if (status === false) {
            toggleBtn.classList.replace('bg-cyan-400', 'bg-gray-700');
            toggleDot.classList.remove('translate-x-5');
            statusText.textContent = 'ẨN';
            statusText.classList.replace('text-cyan-400', 'text-gray-500');
        } else {
            toggleBtn.classList.replace('bg-gray-700', 'bg-cyan-400');
            toggleDot.classList.add('translate-x-5');
            statusText.textContent = 'HIỂN THỊ';
            statusText.classList.replace('text-gray-500', 'text-cyan-400');
        }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.onDeleteCategory = async function(id) {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này không?')) {
        const success = await deleteCategory(id);
        if (success) {
            alert('Đã xóa thành công!');
            await renderCategoryTree();
        } else {
            alert('Xóa thất bại!');
        }
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    await renderCategoryTree();
    await loadParentCategories();
    await updateCategoryStats();
    
    // --- THÊM DÒNG NÀY ĐỂ KHI TẢI LẠI TRANG FORM SẼ HOÀN TOÀN TRỐNG SẠCH ---
    window.resetForm(); 

    const form = document.getElementById('categoryForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const iconButtons = document.querySelectorAll('.grid.grid-cols-5.gap-2 button');

    iconButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            iconButtons.forEach(b => {
                b.classList.remove('border-2', 'border-cyan-400', 'text-cyan-400');
                b.classList.add('border', 'border-[#1f293d]', 'text-gray-400');
            });

            this.classList.remove('border', 'border-[#1f293d]', 'text-gray-400');
            this.classList.add('border-2', 'border-cyan-400', 'text-cyan-400');
        });
    });
});

const btnUpload = document.getElementById('btnUpload');
const fileInput = document.getElementById('fileInput');

if (btnUpload && fileInput) {
    btnUpload.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const fileNameDisplay = document.querySelector('.text-white.font-mono');
            if (fileNameDisplay) {
                fileNameDisplay.textContent = file.name;
            }
        }
    });
}

window.toggleStatus = function() {
    const btn = document.getElementById('toggleStatusBtn');
    const dot = document.getElementById('toggleDot');
    const text = document.getElementById('statusText');

    const isVisible = btn.classList.contains('bg-cyan-400');

    if (isVisible) {
        btn.classList.replace('bg-cyan-400', 'bg-gray-700');
        dot.classList.remove('translate-x-5');
        text.textContent = 'ẨN';
        text.classList.replace('text-cyan-400', 'text-gray-500');
    } else {
        btn.classList.replace('bg-gray-700', 'bg-cyan-400');
        dot.classList.add('translate-x-5');
        text.textContent = 'HIỂN THỊ';
        text.classList.replace('text-gray-500', 'text-cyan-400');
    }
};

const nameInput = document.getElementById('categoryName');
const slugInput = document.getElementById('categorySlug');

if (nameInput && slugInput) {
    nameInput.addEventListener('input', () => {
        const nameValue = nameInput.value;
        const slug = nameValue.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/[^a-z0-9 ]/g, '')
            .trim()
            .replace(/\s+/g, '-');
        slugInput.value = slug;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const sortOrderInput = document.getElementById('sortOrder');
    if (sortOrderInput && !sortOrderInput.value) {
        sortOrderInput.value = '1';
    }
});

// --- TÍNH NĂNG LỌC NHANH NHÁNH DANH MỤC ---
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[placeholder*="Lọc nhanh"]');
    if (searchInput) {
        searchInput.addEventListener('input', async (e) => {
            const keyword = e.target.value.toLowerCase().trim();
            const categories = await getCategories();
            const container = document.querySelector('.space-y-3');
            if (!container) return;

            if (!keyword) {
                renderCategoryTree();
                return;
            }

            const filtered = categories.filter(c => c.name.toLowerCase().includes(keyword));
            let html = '';
            if (filtered.length === 0) {
                html = '<div class="text-gray-500 text-center py-4">Không tìm thấy danh mục phù hợp.</div>';
            } else {
                filtered.forEach(item => {
                    const isHidden = item.status === false;
                    const statusText = isHidden ? 'ẨN' : 'HIỂN THỊ';
                    const statusColor = isHidden ? 'text-gray-500' : 'text-cyan-400';
                    const isChild = item.parent_id && item.parent_id !== 'root' && item.parent_id !== '';
                    const badgeText = isChild ? 'CON' : 'GỐC';
                    const sortOrderVal = item.sortOrder !== undefined && item.sortOrder !== null ? item.sortOrder : 1;

                    html += `
                        <div class="bg-[#0b0f17] border border-[#1f293d] rounded p-3 mt-2">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-3">
                                    <span class="cursor-grab text-gray-600">:::</span>
                                    <div>
                                        <div class="flex items-center space-x-2">
                                            <span class="font-bold text-white text-sm">${item.name}</span>
                                            <span class="text-[9px] border px-1.5 rounded font-mono uppercase">${badgeText}</span>
                                            <span class="text-[10px] text-gray-400 font-mono bg-gray-800 px-1 rounded">STT: ${sortOrderVal}</span>
                                        </div>
                                        <span class="text-[10px] text-gray-500 font-mono">id: ${item.id}</span>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-3 text-xs">
                                    <span class="${statusColor} font-bold text-[10px]">${statusText}</span>
                                    <button onclick="window.onEditCategory('${item.id}', '${item.name.replace(/'/g, "\\'")}', '${item.slug || ''}', '${item.parent_id || ''}', '${(item.description || '').replace(/'/g, "\\'")}', ${item.status}, ${sortOrderVal})" class="p-1 hover:bg-gray-800 rounded text-gray-400 transition" title="Sửa">✏️</button>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
            container.innerHTML = html;
            
            const paginationContainer = document.getElementById('categoryPagination');
            if (paginationContainer) paginationContainer.innerHTML = '';
        });
    }
});

// --- HÀM CẬP NHẬT TỔNG SỐ NHÁNH LÊN GIAO DIỆN ---
async function updateCategoryStats() {
    const categories = await getCategories();
    if (!categories) return;
    const totalCount = categories.length;
    const statTotalEl = document.getElementById('statTotalCount');
    if (statTotalEl) {
        statTotalEl.textContent = `${totalCount} NHÁNH`;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // --- THÊM ĐOẠN NÀY ĐỂ MẶC ĐỊNH THU GỌN TẤT CẢ KHI TẢI LẠI TRANG ---
    const categories = await getCategories();
    if (categories) {
        categories.forEach(item => {
            // Nếu là danh mục gốc (không có parent_id hoặc là root), gán trạng thái thu gọn là true
            if (!item.parent_id || item.parent_id === 'root' || item.parent_id === '') {
                collapsedCategories[item.id] = true; 
            }
        });
    }

    await renderCategoryTree();
    await loadParentCategories();
    await updateCategoryStats();
    
    window.resetForm(); 

    const form = document.getElementById('categoryForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});