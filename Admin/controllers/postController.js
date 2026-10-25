// admin/controllers/postController.js

class PostAdminController {
    constructor() {
        this.storageKey = "novapad_articles_data";
        this.postsData = [];
        this.currentEditId = null;
        this.currentPage = 1;
        this.itemsPerPage = 5;
        this.filterKeyword = "";

        // Query các phần tử Admin (Dùng toán tử optional để tránh lỗi null khi chạy ở trang news.html)
        this.titleInput = document.querySelector("#articleTitle");
        this.slugInput = document.querySelector("#articleSlug");
        this.excerptInput = document.querySelector("#articleExcerpt");
        this.contentDiv = document.querySelector("#articleContent");
        this.authorInput = document.querySelector("#articleAuthor");
        this.statusSelect = document.querySelector("#articleStatus");
        this.categorySelect = document.querySelector("#articleCategory");
        this.tableBody = document.querySelector("#postTableBody");
        this.filterInput = document.querySelector("#tableFilterInput");
        
        this.statTotal = document.querySelector("#statTotalPosts");
        this.statPublished = document.querySelector("#statPublishedCount");
        this.statDraft = document.querySelector("#statDraftCount");
        this.paginationContainer = document.querySelector("#postPagination");

        this.initGlobals();
    }

    init() {
        // Tự động phân chia tác vụ tùy thuộc vào việc bạn đang ở trang nào
        if (window.location.pathname.includes("news.html")) {
            this.renderClientNews(); // Nếu ở trang khách -> Hiển thị bài viết
        } else {
            this.loadPosts();        // Nếu ở trang Admin -> Quản lý CRUD bài viết
            this.bindEvents();
        }
    }

    // ================= PHẦN DÀNH CHO TRANG KHÁCH (NEWS.HTML) =================
    renderClientNews() {
        const savedData = localStorage.getItem(this.storageKey);
        if (!savedData) return;

        const articles = JSON.parse(savedData);
        const container = document.querySelector(".grid.grid-cols-1.sm\\:grid-cols-2.gap-6"); 
        if (!container) return;

        const publishedArticles = articles.filter(art => art.status === "published");
        if (publishedArticles.length === 0) return;

        publishedArticles.reverse(); // Đưa bài viết mới nhất lên đầu

        publishedArticles.forEach(art => {
            const card = document.createElement("div");
            card.className = "bg-[#070b16] border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/40 transition flex flex-col justify-between group";
            
            card.innerHTML = `
                <div>
                    <div class="relative h-44 w-full overflow-hidden bg-black/60">
                        <span class="absolute top-3 left-3 bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 text-[10px] font-mono px-2 py-0.5 rounded z-10 font-bold">
                            ${art.category || 'TIN TỨC'}
                        </span>
                        <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60" alt="Thumbnail" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                    </div>
                    <div class="p-5">
                        <span class="text-[10px] font-mono text-gray-500 block mb-1">${art.date || '2025'} • QUẢN TRỊ VIÊN</span>
                        <h3 class="text-white font-bold text-sm leading-snug hover:text-cyan-400 transition cursor-pointer">
                            ${art.title}
                        </h3>
                        <p class="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                            ${art.excerpt || ''}
                        </p>
                    </div>
                </div>
                <div class="p-5 pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span class="text-gray-500 flex items-center gap-1">Tác giả: ${art.author || 'Admin'}</span>
                    <span class="text-cyan-400 cursor-pointer">Đọc Bài Viết &rarr;</span>
                </div>
            `;
            container.prepend(card);
        });
    }

    // ================= PHẦN DÀNH CHO TRANG ADMIN (POST.HTML) =================
    loadPosts() {
        const data = localStorage.getItem(this.storageKey);
        this.postsData = data ? JSON.parse(data) : [];
        this.renderTable();
        this.updateStats();
    }

    renderTable() {
        if (!this.tableBody) return;
        const filtered = this.postsData.filter(p => p.title.toLowerCase().includes(this.filterKeyword.toLowerCase()));
        const totalPages = Math.ceil(filtered.length / this.itemsPerPage) || 1;
        if (this.currentPage > totalPages) this.currentPage = totalPages;
        
        const paginated = filtered.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
        this.tableBody.innerHTML = paginated.length === 0 ? `<tr><td colspan="4" class="p-4 text-center text-slate-500 font-mono">Không có bài viết.</td></tr>` : "";

        paginated.forEach(art => {
            const tr = document.createElement("tr");
            tr.className = "hover:bg-slate-800/40 transition";
            tr.innerHTML = `
                <td class="p-3">
                    <div class="font-bold text-white line-clamp-1">${art.title}</div>
                    <div class="text-[10px] text-cyan-400 font-mono">${art.category} • ${art.date}</div>
                </td>
                <td class="p-3 font-mono text-slate-400">${art.author}</td>
                <td class="p-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${art.status === 'published' ? 'bg-cyan-950/60 text-cyan-400' : 'bg-amber-950/60 text-amber-400'}">
                        ${art.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                </td>
                <td class="p-3 text-right space-x-1 font-mono">
                    <button onclick="window.previewArticle('${art.id}')" class="text-blue-400 px-2 py-1 bg-blue-500/10 rounded">Xem</button>
                    <button onclick="window.editArticle('${art.id}')" class="text-cyan-400 px-2 py-1 bg-cyan-500/10 rounded">Sửa</button>
                    <button onclick="window.deleteArticle('${art.id}')" class="text-red-400 px-2 py-1 bg-red-500/10 rounded">Xóa</button>
                </td>
            `;
            this.tableBody.appendChild(tr);
        });

        if (this.paginationContainer) {
            this.paginationContainer.innerHTML = totalPages > 1 ? Array.from({length: totalPages}, (_, i) => `<button class="w-8 h-8 rounded text-xs font-mono ${i+1 === this.currentPage ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-[#111622] text-slate-300'}" onclick="window.setPage(${i+1})">${i+1}</button>`).join('') : "";
        }
    }

    updateStats() {
        const total = this.postsData.length;
        const pub = this.postsData.filter(p => p.status === "published").length;
        if (this.statTotal) this.statTotal.innerText = `${total} BÀI ĐÃ ĐĂNG`;
        if (this.statPublished) this.statPublished.innerText = pub < 10 ? '0' + pub : pub;
        if (this.statDraft) this.statDraft.innerText = (total - pub) < 10 ? '0' + (total - pub) : (total - pub);
    }

    bindEvents() {
        if (this.titleInput && this.slugInput) {
            this.titleInput.addEventListener("input", () => {
                if (!this.currentEditId) {
                    const slug = this.titleInput.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                    this.slugInput.value = `/tin-tuc/${slug}`;
                }
            });
        }
        if (this.filterInput) {
            this.filterInput.addEventListener("input", (e) => { this.filterKeyword = e.target.value.trim(); this.currentPage = 1; this.renderTable(); });
        }
    }

    saveArticle() {
        const title = this.titleInput.value.trim();
        if (!title) return alert("Vui lòng nhập tiêu đề bài viết!");
        
        const postData = {
            id: this.currentEditId || "art_" + Date.now(),
            title,
            slug: this.slugInput.value.trim() || `/tin-tuc/${Date.now()}`,
            excerpt: this.excerptInput.value.trim(),
            content: this.contentDiv.innerHTML.trim(),
            author: this.authorInput.value.trim() || "Admin Dev",
            status: this.statusSelect.value,
            category: this.categorySelect.value,
            date: new Date().toISOString().split('T')[0]
        };

        let data = localStorage.getItem(this.storageKey);
        this.postsData = data ? JSON.parse(data) : [];

        if (this.currentEditId) {
            const idx = this.postsData.findIndex(p => p.id === this.currentEditId);
            if (idx !== -1) this.postsData[idx] = postData;
            alert("Cập nhật bài viết thành công!");
        } else {
            this.postsData.push(postData);
            alert("Thêm bài viết mới thành công!");
        }

        localStorage.setItem(this.storageKey, JSON.stringify(this.postsData));
        this.createNewArticle();
        this.loadPosts();
    }

    editArticle(id) {
        const art = this.postsData.find(p => p.id === id);
        if (!art) return;
        this.currentEditId = art.id;
        this.titleInput.value = art.title;
        this.slugInput.value = art.slug;
        this.excerptInput.value = art.excerpt || "";
        this.contentDiv.innerHTML = art.content || "";
        this.authorInput.value = art.author;
        this.statusSelect.value = art.status;
        this.categorySelect.value = art.category;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    deleteArticle(id) {
        if (confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
            let data = localStorage.getItem(this.storageKey);
            this.postsData = data ? JSON.parse(data) : [];
            this.postsData = this.postsData.filter(p => p.id !== id);
            localStorage.setItem(this.storageKey, JSON.stringify(this.postsData));
            this.loadPosts();
            alert("Đã xóa bài viết!");
        }
    }

    previewArticle(id) {
        let data = localStorage.getItem(this.storageKey);
        this.postsData = data ? JSON.parse(data) : [];
        const art = this.postsData.find(p => p.id === id);
        if (!art) return;
        document.getElementById("previewModalCategory").innerText = art.category;
        document.getElementById("previewModalTitle").innerText = art.title;
        document.getElementById("previewModalAuthor").innerText = art.author;
        document.getElementById("previewModalSlug").innerText = art.slug;
        document.getElementById("previewModalExcerpt").innerText = art.excerpt;
        document.getElementById("previewModalContent").innerHTML = art.content;
        document.getElementById("previewModalStatusBadge").innerHTML = `<strong>${art.status}</strong>`;
        document.getElementById("previewPostModal").classList.remove("hidden");
    }

    createNewArticle() {
        this.currentEditId = null;
        if (this.titleInput) this.titleInput.value = "";
        if (this.slugInput) this.slugInput.value = "";
        if (this.excerptInput) this.excerptInput.value = "";
        if (this.contentDiv) this.contentDiv.innerHTML = "";
    }

    initGlobals() {
        window.saveArticle = () => this.saveArticle();
        window.editArticle = (id) => this.editArticle(id);
        window.deleteArticle = (id) => this.deleteArticle(id);
        window.previewArticle = (id) => this.previewArticle(id);
        window.createNewArticle = () => this.createNewArticle();
        window.setPage = (p) => { this.currentPage = p; this.renderTable(); };
    }
}

document.addEventListener("DOMContentLoaded", () => new PostAdminController().init());