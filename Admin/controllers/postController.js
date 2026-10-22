let currentEditingId = null;
let currentPage = 1;
const itemsPerPage = 4;

// Dữ liệu mẫu khởi tạo ban đầu nếu LocalStorage chưa có gì
const defaultPosts = [
    {
        id: '1',
        title: 'Kỹ Thuật Cảm Biến Hall-Effect: Vì Sao Tuyển Thủ eSports Loại Bỏ Hoàn Toàn Stick Drift?',
        slug: '/tin-tuc/ky-thuat-hall-effect-chong-stick-drift',
        category: 'CẨM NANG PHẦN CỨNG',
        author: 'Hoàng Long',
        status: 'published',
        excerpt: 'Tìm hiểu sâu về nguyên lý vật lý từ trường vĩnh cửu trên cần analog Hall-Effect...',
        content: 'Nội dung chi tiết bài viết cẩm nang kỹ thuật về Hall Effect...'
    },
    {
        id: '2',
        title: 'Phân Tích Độ Trễ Polling Rate 1000Hz vs 8000Hz Trên Controller',
        slug: '/tin-tuc/polling-rate-1000hz-vs-8000hz',
        category: 'REVIEW & SO SÁNH',
        author: 'TechLab Team',
        status: 'published',
        excerpt: 'So sánh tốc độ phản hồi cổng USB trong các trận đấu cạnh tranh eSports đỉnh cao...',
        content: 'Nội dung chi tiết phân tích so sánh độ trễ Polling Rate...'
    }
];

// Lấy danh sách bài viết từ LocalStorage
function getLocalPosts() {
    const data = localStorage.getItem('novapad_posts');
    if (!data) {
        localStorage.setItem('novapad_posts', JSON.stringify(defaultPosts));
        return defaultPosts;
    }
    return JSON.parse(data);
}

// Lưu danh sách bài viết vào LocalStorage
function saveLocalPosts(posts) {
    localStorage.setItem('novapad_posts', JSON.stringify(posts));
}

// --- 1. RENDER DANH SÁCH BÀI VIẾT & PHÂN TRANG ---
async function renderPostTable(keyword = '') {
    const tableBody = document.getElementById('postTableBody');
    if (!tableBody) return;

    let posts = getLocalPosts();
    updatePostStats(posts);

    let paginationContainer = document.getElementById('postPagination');

    if (!posts || posts.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-slate-500 font-mono">Chưa có bài viết nào trên hệ thống.</td></tr>`;
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    // Lọc theo từ khóa tìm kiếm (nếu có)
    if (keyword) {
        posts = posts.filter(p =>
            p.title.toLowerCase().includes(keyword) ||
            (p.category && p.category.toLowerCase().includes(keyword))
        );
    }

    const totalPages = Math.ceil(posts.length / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * itemsPerPage;
    const paginatedPosts = posts.slice(startIdx, startIdx + itemsPerPage);

    let html = '';
    paginatedPosts.forEach(item => {
        const isPublished = item.status === 'published';
        const statusBadge = isPublished
            ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>ĐÃ ĐĂNG</span>`
            : `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-950 text-amber-400 border border-amber-500/30"><span class="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>BẢN NHÁP</span>`;

        html += `
            <tr class="hover:bg-slate-800/30 transition">
                <td class="p-3">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-8 rounded bg-[#090d16] border border-[#1e293b] flex items-center justify-center text-slate-400 shrink-0 font-mono text-xs">📄</div>
                        <div>
                            <div class="font-bold text-white hover:text-cyan-400 cursor-pointer transition" onclick="window.onEditPost('${item.id}')">${item.title}</div>
                            <div class="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center space-x-2">
                                <span class="text-cyan-400 uppercase font-bold">${item.category || 'TIN TỨC'}</span>
                                <span>•</span>
                                <span>Slug: ${item.slug || ''}</span>
                            </div>
                        </div>
                    </div>
                </td>
                <td class="p-3 font-semibold text-slate-300">${item.author || 'Admin'}</td>
                <td class="p-3">${statusBadge}</td>
                <td class="p-3 text-right">
                    <button onclick="window.onEditPost('${item.id}')" class="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400 transition" title="Sửa">✏️ Sửa</button>
                    <button onclick="window.openPreviewPost('${item.id}')" class="p-1.5 hover:bg-slate-800 rounded text-cyan-400 transition" title="Xem chi tiết">👁️ Xem</button>
                    <button onclick="window.onDeletePost('${item.id}')" class="p-1.5 hover:bg-slate-800 rounded text-red-400 transition ml-2" title="Xóa">🗑️ Xóa</button>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;

    // --- RENDER THANH PHÂN TRANG ---
    if (paginationContainer) {
        let paginationHtml = '';
        if (totalPages > 1) {
            for (let i = 1; i <= totalPages; i++) {
                if (i === currentPage) {
                    paginationHtml += `<button onclick="window.changePostPage(${i})" class="px-3 py-1 bg-cyan-400 text-black font-bold rounded">${i}</button>`;
                } else {
                    paginationHtml += `<button onclick="window.changePostPage(${i})" class="px-3 py-1 bg-[#090d16] border border-[#1e293b] rounded text-slate-400 hover:text-white">${i}</button>`;
                }
            }
        }
        paginationContainer.innerHTML = paginationHtml;
    }
}

// --- 2. CẬP NHẬT THỐNG KÊ KPI ---
function updatePostStats(postsData) {
    const posts = postsData || getLocalPosts();
    if (!posts) return;

    const publishedCount = posts.filter(p => p.status === 'published').length;
    const draftCount = posts.filter(p => p.status === 'draft').length;

    if (document.getElementById('statTotalPosts')) {
        document.getElementById('statTotalPosts').textContent = `${posts.length} BÀI ĐÃ ĐĂNG`;
    }
    if (document.getElementById('statPublishedCount')) {
        document.getElementById('statPublishedCount').textContent = String(publishedCount).padStart(2, '0');
    }
    if (document.getElementById('statDraftCount')) {
        document.getElementById('statDraftCount').textContent = String(draftCount).padStart(2, '0');
    }
}

// --- 3. ĐỔ DỮ LIỆU BÀI VIẾT LÊN FORM ĐỂ SỬA ---
window.onEditPost = function (id) {
    const posts = getLocalPosts();
    const post = posts.find(p => p.id === id);
    if (!post) return;

    currentEditingId = id;
    if (document.getElementById('articleTitle')) document.getElementById('articleTitle').value = post.title || '';
    if (document.getElementById('articleSlug')) document.getElementById('articleSlug').value = post.slug || '';
    if (document.getElementById('articleExcerpt')) document.getElementById('articleExcerpt').value = post.excerpt || '';

    // ĐỔI TỪ .value SANG .innerHTML ĐỂ ĐỔ DỮ LIỆU VÀO KHUNG DIV CONTENTEDITABLE
    const contentEl = document.getElementById('articleContent');
    if (contentEl) contentEl.innerHTML = post.content || '';

    if (document.getElementById('articleAuthor')) document.getElementById('articleAuthor').value = post.author || '';
    if (document.getElementById('articleStatus')) document.getElementById('articleStatus').value = post.status || 'published';
    if (document.getElementById('articleCategory')) document.getElementById('articleCategory').value = post.category || 'CẨM NANG PHẦN CỨNG';

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// --- 4. LƯU BÀI VIẾT (THÊM MỚI / CẬP NHẬT) ---
window.saveArticle = function () {
    const title = document.getElementById('articleTitle') ? document.getElementById('articleTitle').value.trim() : '';
    const slug = document.getElementById('articleSlug') ? document.getElementById('articleSlug').value.trim() : '';
    const excerpt = document.getElementById('articleExcerpt') ? document.getElementById('articleExcerpt').value.trim() : '';
    const contentEl = document.getElementById('articleContent');
    const content = contentEl ? contentEl.innerHTML.trim() : '';
    const author = document.getElementById('articleAuthor') ? document.getElementById('articleAuthor').value.trim() : 'Admin Dev';
    const status = document.getElementById('articleStatus') ? document.getElementById('articleStatus').value : 'published';
    const category = document.getElementById('articleCategory') ? document.getElementById('articleCategory').value : 'CẨM NANG PHẦN CỨNG';

    if (!title) {
        alert('Vui lòng nhập tiêu đề bài viết!');
        return;
    }

    let posts = getLocalPosts();

    if (currentEditingId) {
        // Cập nhật bài viết cũ
        posts = posts.map(p => p.id === currentEditingId ? { ...p, title, slug, excerpt, content, author, status, category } : p);
        alert('Cập nhật bài viết thành công!');
    } else {
        // Thêm bài viết mới
        const newPost = {
            id: Date.now().toString(),
            title,
            slug: slug || `/tin-tuc/${title.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, '-')}`,
            excerpt,
            content,
            author,
            status,
            category
        };
        posts.unshift(newPost);
        alert('Thêm bài viết mới thành công!');
    }

    saveLocalPosts(posts);
    window.createNewArticle();
    renderPostTable();
};

// --- 5. TẠO BÀI VIẾT MỚI / RESET FORM ---
window.createNewArticle = function() {
    currentEditingId = null; // Đưa về trạng thái tạo mới
    
    // Reset các trường input
    if (document.getElementById('articleTitle')) document.getElementById('articleTitle').value = '';
    if (document.getElementById('articleSlug')) document.getElementById('articleSlug').value = '';
    if (document.getElementById('articleExcerpt')) document.getElementById('articleExcerpt').value = '';
    
    // --- THÊM DÒNG NÀY ĐỂ LÀM TRỐNG KHUNG SOẠN THẢO TRỰC QUAN ---
    const contentEl = document.getElementById('articleContent');
    if (contentEl) contentEl.innerHTML = ''; 
    // -------------------------------------------------------------

    if (document.getElementById('articleAuthor')) document.getElementById('articleAuthor').value = 'Admin Dev';
    if (document.getElementById('articleStatus')) document.getElementById('articleStatus').value = 'published';
    if (document.getElementById('articleCategory')) document.getElementById('articleCategory').selectedIndex = 0;

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// --- 6. XÓA BÀI VIẾT ---
window.onDeletePost = function (id) {
    if (confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
        let posts = getLocalPosts();
        posts = posts.filter(p => p.id !== id);
        saveLocalPosts(posts);
        alert('Đã xóa bài viết thành công!');
        renderPostTable();
    }
};

window.changePostPage = function (page) {
    currentPage = page;
    renderPostTable();
};

// --- KHỞI CHẠY KHI TẢI TRANG ---
document.addEventListener('DOMContentLoaded', () => {
    renderPostTable();

    // Tự động sinh Slug khi gõ Tiêu đề (Áp dụng cho cả lúc thêm mới lẫn chỉnh sửa)
    const titleInput = document.getElementById('articleTitle');
    const slugInput = document.getElementById('articleSlug');

    if (titleInput && slugInput) {
        titleInput.addEventListener('input', () => {
            const slug = titleInput.value.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                .replace(/[^a-z0-9 ]/g, '')
                .trim().replace(/\s+/g, '-');
            slugInput.value = `/tin-tuc/${slug}`;
        });
    }

    // Lọc nhanh bài viết theo từ khóa
    const filterInput = document.getElementById('tableFilterInput');
    if (filterInput) {
        filterInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase().trim();
            currentPage = 1;
            renderPostTable(keyword);
        });
    }
});

// Hàm nạp các danh mục đã lưu trong localStorage vào thẻ select
function loadSavedCategories() {
    const selectEl = document.getElementById('articleCategory');
    if (!selectEl) return;

    const savedCats = JSON.parse(localStorage.getItem('novapad_custom_categories')) || [];

    // Kiểm tra xem đã thêm các danh mục custom vào select chưa, nếu chưa thì thêm vào
    savedCats.forEach(catName => {
        // Kiểm tra xem option đã tồn tại chưa để tránh bị lặp
        let exists = false;
        for (let option of selectEl.options) {
            if (option.value === catName) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            const opt = document.createElement('option');
            opt.value = catName;
            opt.textContent = catName;
            selectEl.appendChild(opt);
        }
    });
}

// Chức năng bấm nút "+ Tạo mới" danh mục
window.addNewCategory = function () {
    const newCat = prompt('Nhập tên danh mục bài viết mới:');
    if (!newCat || !newCat.trim()) return;

    const catName = newCat.trim();
    const selectEl = document.getElementById('articleCategory');
    if (!selectEl) return;

    // Kiểm tra xem đã có trong select chưa
    let exists = false;
    for (let option of selectEl.options) {
        if (option.value.toLowerCase() === catName.toLowerCase()) {
            exists = true;
            break;
        }
    }

    if (exists) {
        alert('Danh mục này đã tồn tại trong danh sách!');
        return;
    }

    // Thêm option mới vào thẻ select và chọn luôn nó
    const opt = document.createElement('option');
    opt.value = catName;
    opt.textContent = catName;
    selectEl.appendChild(opt);
    selectEl.value = catName;

    // Lưu vào localStorage để lần sau mở lên vẫn còn
    let savedCats = JSON.parse(localStorage.getItem('novapad_custom_categories')) || [];
    savedCats.push(catName);
    localStorage.setItem('novapad_custom_categories', JSON.stringify(savedCats));

    alert(`Đã thêm danh mục "${catName}" thành công!`);
};

document.addEventListener('DOMContentLoaded', () => {
    renderPostTable();
    loadSavedCategories(); // Nạp các danh mục tự tạo
    // ... các đoạn code khác
});

// Chức năng xóa danh mục tự tạo
window.deleteCustomCategory = function () {
    const selectEl = document.getElementById('articleCategory');
    if (!selectEl) return;

    const selectedVal = selectEl.value;

    // Danh sách các danh mục mặc định cố định không được xóa (nếu muốn)
    const defaultCategories = [
        "CẨM NANG PHẦN CỨNG",
        "REVIEW & SO SÁNH",
        "THỦ THUẬT MOD",
        "TIN TỨC GIẢI ĐẤU"
    ];

    if (defaultCategories.includes(selectedVal)) {
        alert('Không thể xóa danh mục mặc định của hệ thống!');
        return;
    }

    if (confirm(`Bạn có chắc chắn muốn xóa danh mục "${selectedVal}" không?`)) {
        // Xóa khỏi localStorage
        let savedCats = JSON.parse(localStorage.getItem('novapad_custom_categories')) || [];
        savedCats = savedCats.filter(cat => cat !== selectedVal);
        localStorage.setItem('novapad_custom_categories', JSON.stringify(savedCats));

        // Xóa option khỏi thẻ select trên giao diện
        selectEl.remove(selectEl.selectedIndex);

        alert(`Đã xóa danh mục "${selectedVal}" thành công!`);
    }
};
// --- XỬ LÝ THANH CÔNG CỤ (WYSIWYG TOOLBAR ACTIONS) ---
const editorDiv = document.getElementById('articleContent');
if (editorDiv) {
    // 1. Đặt hàm insertFormatting NẰM BÊN TRONG ĐÂY
    function insertFormatting(openTag, closeTag) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);

        const div = document.createElement('div');
        div.innerHTML = openTag + (selection.toString() || 'Nhập văn bản...') + closeTag;

        range.deleteContents();
        range.insertNode(div.firstChild);
        editorDiv.focus();
    }

    // 2. Lắng nghe sự kiện click trên các nút của toolbar
    const toolbarButtons = document.querySelectorAll('.bg-\\[\\#131b2e\\] button');
    toolbarButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const title = btn.getAttribute('title');
            if (!title) return;

            switch (title) {
                case 'Bold':
                    insertFormatting('<strong>', '</strong>');
                    break;
                case 'Italic':
                    insertFormatting('<em>', '</em>');
                    break;
                case 'Underline':
                    insertFormatting('<u>', '</u>');
                    break;
                case 'Strikethrough':
                    insertFormatting('<del>', '</del>');
                    break;
                case 'Heading 1':
                    insertFormatting('<h1>', '</h1>');
                    break;
                case 'Heading 2':
                    insertFormatting('<h2>', '</h2>');
                    break;
                case 'Heading 3':
                    insertFormatting('<h3>', '</h3>');
                    break;
                case 'Bullet List':
                    insertFormatting('<ul>\n  <li>', '</li>\n</ul>');
                    break;
                case 'Numbered List':
                    insertFormatting('<ol>\n  <li>', '</li>\n</ol>');
                    break;
                case 'Quote':
                    insertFormatting('<blockquote>', '</blockquote>');
                    break;
                case 'Code Block':
                    insertFormatting('<pre><code>', '</code></pre>');
                    break;
                case 'Insert Image':
                    window.openImagePicker((imageUrlOrBase64) => {
                        insertFormatting(`<img src="${imageUrlOrBase64}" alt="image" />`, '');
                    });
                    break;
                case 'Insert Media':
                    window.openVideoPicker((videoUrlOrBase64) => {
                        insertFormatting(`<video src="${videoUrlOrBase64}" controls class="w-full max-h-96 my-3 rounded-lg"></video>`, '');
                    });
                    break;
            }
        });
    });
}

let imageCallback = null; // Biến lưu hàm callback khi chèn ảnh thành công

// Hàm mở Modal chọn ảnh (gọi hàm này khi người dùng bấm vào nút chèn ảnh)
window.openImagePicker = function (callback) {
    imageCallback = callback;
    const modal = document.getElementById('imagePickerModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.getElementById('modalImageUrl').value = '';
        document.getElementById('modalImageFile').value = '';
        switchImageTab('url'); // Mặc định mở tab URL
    }
};

// Hàm đóng Modal
window.closeImageModal = function () {
    const modal = document.getElementById('imagePickerModal');
    if (modal) modal.classList.add('hidden');
    imageCallback = null;
};

// Chuyển đổi giữa 2 Tab (URL / Tải từ máy)
window.switchImageTab = function (type) {
    const tabUrlBtn = document.getElementById('tabUrlBtn');
    const tabFileBtn = document.getElementById('tabFileBtn');
    const contentUrlTab = document.getElementById('contentUrlTab');
    const contentFileTab = document.getElementById('contentFileTab');

    if (type === 'url') {
        tabUrlBtn.className = "flex-1 py-2 text-sm font-semibold rounded-md bg-cyan-500 text-black transition";
        tabFileBtn.className = "flex-1 py-2 text-sm font-semibold rounded-md text-gray-400 hover:text-white transition";
        contentUrlTab.classList.remove('hidden');
        contentFileTab.classList.add('hidden');
    } else {
        tabFileBtn.className = "flex-1 py-2 text-sm font-semibold rounded-md bg-cyan-500 text-black transition";
        tabUrlBtn.className = "flex-1 py-2 text-sm font-semibold rounded-md text-gray-400 hover:text-white transition";
        contentFileTab.classList.remove('hidden');
        contentUrlTab.classList.add('hidden');
    }
};

// Xác nhận chèn ảnh
window.confirmInsertImage = function () {
    const isUrlTabActive = !document.getElementById('contentUrlTab').classList.contains('hidden');

    if (isUrlTabActive) {
        // Trường hợp dùng Link URL
        const url = document.getElementById('modalImageUrl').value.trim();
        if (!url) {
            alert('Vui lòng nhập đường dẫn URL hình ảnh!');
            return;
        }
        if (imageCallback) imageCallback(url);
        closeImageModal();
    } else {
        // Trường hợp chọn file từ thư mục máy tính
        const fileInput = document.getElementById('modalImageFile');
        const file = fileInput.files[0];
        if (!file) {
            alert('Vui lòng chọn một file ảnh từ máy tính!');
            return;
        }

        // Đọc file ảnh dưới dạng Base64 hoặc tạo URL ảo để hiển thị ngay lập tức
        const reader = new FileReader();
        reader.onload = function (e) {
            const base64Image = e.target.result;
            if (imageCallback) imageCallback(base64Image);
            closeImageModal();
        };
        reader.readAsDataURL(file);
    }
};

let videoCallback = null;

// Hàm mở Modal Video
window.openVideoPicker = function (callback) {
    videoCallback = callback;
    const modal = document.getElementById('videoPickerModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.getElementById('modalVideoUrl').value = '';
        document.getElementById('modalVideoFile').value = '';
        switchVideoTab('url');
    }
};

// Hàm đóng Modal Video
window.closeVideoModal = function () {
    const modal = document.getElementById('videoPickerModal');
    if (modal) modal.classList.add('hidden');
    videoCallback = null;
};

// Chuyển Tab URL / File
window.switchVideoTab = function (type) {
    const tabUrlBtn = document.getElementById('tabVideoUrlBtn');
    const tabFileBtn = document.getElementById('tabVideoFileBtn');
    const contentUrlTab = document.getElementById('contentVideoUrlTab');
    const contentFileTab = document.getElementById('contentVideoFileTab');

    if (type === 'url') {
        tabUrlBtn.className = "flex-1 py-2 text-sm font-semibold rounded-md bg-cyan-500 text-black transition";
        tabFileBtn.className = "flex-1 py-2 text-sm font-semibold rounded-md text-gray-400 hover:text-white transition";
        contentUrlTab.classList.remove('hidden');
        contentFileTab.classList.add('hidden');
    } else {
        tabFileBtn.className = "flex-1 py-2 text-sm font-semibold rounded-md bg-cyan-500 text-black transition";
        tabUrlBtn.className = "flex-1 py-2 text-sm font-semibold rounded-md text-gray-400 hover:text-white transition";
        contentFileTab.classList.remove('hidden');
        contentUrlTab.classList.add('hidden');
    }
};

// Xác nhận chèn Video
window.confirmInsertVideo = function () {
    const isUrlTabActive = !document.getElementById('contentVideoUrlTab').classList.contains('hidden');

    if (isUrlTabActive) {
        const url = document.getElementById('modalVideoUrl').value.trim();
        if (!url) {
            alert('Vui lòng nhập đường dẫn URL Video!');
            return;
        }
        if (videoCallback) videoCallback(url);
        closeVideoModal();
    } else {
        const fileInput = document.getElementById('modalVideoFile');
        const file = fileInput.files[0];
        if (!file) {
            alert('Vui lòng chọn một file video từ máy tính!');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const base64Video = e.target.result;
            if (videoCallback) videoCallback(base64Video);
            closeVideoModal();
        };
        reader.readAsDataURL(file);
    }
};

// --- TÍNH NĂNG XEM CHI TIẾT BÀI VIẾT ---
window.openPreviewPost = function (id) {
    const posts = getLocalPosts();
    const post = posts.find(p => p.id === id);
    if (!post) return;

    document.getElementById('previewModalCategory').textContent = post.category || 'TIN TỨC KỸ THUẬT';
    document.getElementById('previewModalTitle').textContent = post.title || '';
    document.getElementById('previewModalAuthor').textContent = post.author || 'Admin';
    document.getElementById('previewModalSlug').textContent = post.slug || '';
    document.getElementById('previewModalExcerpt').textContent = post.excerpt || 'Chưa có tóm tắt ngắn...';

    // Gán nội dung (Hỗ trợ hiển thị trực tiếp các thẻ HTML như img, video do người dùng chèn)
    const contentArea = document.getElementById('previewModalContent');
    if (contentArea) {
        // Nếu nội dung chứa thẻ HTML, gán qua innerHTML để render trực tiếp ảnh/video/định dạng
        contentArea.innerHTML = post.content ? post.content.replace(/\n/g, '<br>') : '<span class="text-slate-500 italic">Chưa có nội dung chi tiết...</span>';
    }

    const isPublished = post.status === 'published';
    const statusBadge = document.getElementById('previewModalStatusBadge');
    if (statusBadge) {
        statusBadge.innerHTML = isPublished
            ? `<span class="text-emerald-400 font-bold">ĐÃ XUẤT BẢN</span>`
            : `<span class="text-amber-400 font-bold">BẢN NHÁP</span>`;
    }

    const modal = document.getElementById('previewPostModal');
    if (modal) modal.classList.remove('hidden');
};

window.closePreviewModal = function () {
    const modal = document.getElementById('previewPostModal');
    if (modal) modal.classList.add('hidden');
};