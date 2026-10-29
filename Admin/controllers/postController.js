// admin/controllers/postController.js
class PostAdminController {
    constructor() {
        this.key = "novapad_articles_data";
        this.editId = null;
        this.posts = [];
        this.page = 1;
        this.limit = 5;
        this.keyword = "";

        this.el = {
            title: document.querySelector("#articleTitle"),
            slug: document.querySelector("#articleSlug"),
            excerpt: document.querySelector("#articleExcerpt"),
            content: document.querySelector("#articleContent"),
            author: document.querySelector("#articleAuthor"),
            status: document.querySelector("#articleStatus"),
            category: document.querySelector("#articleCategory"),
            table: document.querySelector("#postTableBody"),
            filter: document.querySelector("#tableFilterInput"),
            pagination: document.querySelector("#postPagination")
        };
        this.initGlobals();
    }

    init() {
        if (window.location.pathname.includes("news.html")) {
            this.renderNews();
        } else {
            this.load();
            if (this.el.title && this.el.slug) {
                this.el.title.oninput = () => {
                    if (!this.editId) {
                        const s = this.el.title.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                        this.el.slug.value = `/tin-tuc/${s}`;
                    }
                };
            }
            if (this.el.filter) {
                this.el.filter.oninput = (e) => { 
                    this.keyword = e.target.value.trim(); 
                    this.page = 1; 
                    this.renderTable(); 
                };
            }
        }
    }

    renderNews() {
        const data = localStorage.getItem(this.key);
        const container = document.querySelector(".grid.grid-cols-1.sm\\:grid-cols-2.gap-6");
        if (!data || !container) return;

        JSON.parse(data).filter(a => a.status === "published").reverse().forEach(art => {
            const card = document.createElement("div");
            card.className = "bg-[#070b16] border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/40 transition flex flex-col justify-between group";
            card.innerHTML = `
                <div>
                    <div class="relative h-44 w-full overflow-hidden bg-black/60">
                        <span class="absolute top-3 left-3 bg-cyan-950/80 border border-cyan-800/80 text-cyan-400 text-[10px] font-mono px-2 py-0.5 rounded z-10 font-bold">${art.category || 'TIN TỨC'}</span>
                        <img src="${art.thumbnail || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60'}" alt="Thumb" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                    </div>
                    <div class="p-5">
                        <span class="text-[10px] font-mono text-gray-500 block mb-1">${art.date || '2025'} • QUẢN TRỊ VIÊN</span>
                        <h3 class="text-white font-bold text-sm leading-snug hover:text-cyan-400 transition cursor-pointer">${art.title}</h3>
                        <p class="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">${art.excerpt || ''}</p>
                    </div>
                </div>
                <div class="p-5 pt-3 border-t border-gray-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span class="text-gray-500">Tác giả: ${art.author || 'Admin'}</span>
                    <span class="text-cyan-400 cursor-pointer">Đọc Bài Viết &rarr;</span>
                </div>
            `;
            container.prepend(card);
        });
    }

    load() {
        this.posts = JSON.parse(localStorage.getItem(this.key) || "[]");
        this.renderTable();
        this.updateStats();
    }

    renderTable() {
        if (!this.el.table) return;
        const filtered = this.posts.filter(p => p.title.toLowerCase().includes(this.keyword.toLowerCase()));
        this.el.table.innerHTML = filtered.length ? "" : `<tr><td colspan="4" class="p-4 text-center text-slate-500 font-mono">Không có bài viết.</td></tr>`;
        
        filtered.forEach(art => {
            const tr = document.createElement("tr");
            tr.className = "hover:bg-slate-800/40 transition";
            tr.innerHTML = `
                <td class="p-3"><div class="font-bold text-white line-clamp-1">${art.title}</div><div class="text-[10px] text-cyan-400 font-mono">${art.category} • ${art.date}</div></td>
                <td class="p-3 font-mono text-slate-400">${art.author}</td>
                <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${art.status === 'published' ? 'bg-cyan-950/60 text-cyan-400' : 'bg-amber-950/60 text-amber-400'}">${art.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}</span></td>
                <td class="p-3 text-right space-x-1 font-mono">
                    <button onclick="window.previewArticle('${art.id}')" class="text-blue-400 px-2 py-1 bg-blue-500/10 rounded">Xem</button>
                    <button onclick="window.editArticle('${art.id}')" class="text-cyan-400 px-2 py-1 bg-cyan-500/10 rounded">Sửa</button>
                    <button onclick="window.deleteArticle('${art.id}')" class="text-red-400 px-2 py-1 bg-red-500/10 rounded">Xóa</button>
                </td>
            `;
            this.el.table.appendChild(tr);
        });
    }

    updateStats() {
        const total = this.posts.length;
        const pub = this.posts.filter(p => p.status === "published").length;
        if (document.querySelector("#statTotalPosts")) document.querySelector("#statTotalPosts").innerText = `${total} BÀI ĐÃ ĐĂNG`;
        if (document.querySelector("#statPublishedCount")) document.querySelector("#statPublishedCount").innerText = pub < 10 ? '0' + pub : pub;
        if (document.querySelector("#statDraftCount")) document.querySelector("#statDraftCount").innerText = (total - pub) < 10 ? '0' + (total - pub) : (total - pub);
    }

    saveArticle() {
        const title = this.el.title.value.trim();
        if (!title) return alert("Vui lòng nhập tiêu đề!");
        const contentHtml = this.el.content.innerHTML.trim();
        
        let thumb = "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60";
        const temp = document.createElement("div");
        temp.innerHTML = contentHtml;
        const img = temp.querySelector("img");
        if (img && img.src) {
            thumb = img.src;
        }

        const art = {
            id: this.editId || "art_" + Date.now(),
            title,
            slug: this.el.slug.value.trim() || `/tin-tuc/${Date.now()}`,
            excerpt: this.el.excerpt.value.trim(),
            content: contentHtml,
            thumbnail: thumb,
            author: this.el.author.value.trim() || "Admin Dev",
            status: this.el.status.value,
            category: this.el.category.value,
            date: new Date().toISOString().split('T')[0]
        };

        this.posts = JSON.parse(localStorage.getItem(this.key) || "[]");
        if (this.editId) {
            const idx = this.posts.findIndex(p => p.id === this.editId);
            if (idx !== -1) this.posts[idx] = art;
        } else {
            this.posts.push(art);
        }

        localStorage.setItem(this.key, JSON.stringify(this.posts));
        alert(this.editId ? "Cập nhật bài viết thành công!" : "Thêm bài viết mới thành công!");
        this.createNewArticle();
        this.load();
    }

    editArticle(id) {
        const art = this.posts.find(p => p.id === id);
        if (!art) return;
        this.editId = art.id;
        this.el.title.value = art.title;
        this.el.slug.value = art.slug;
        this.el.excerpt.value = art.excerpt || "";
        this.el.content.innerHTML = art.content || "";
        this.el.author.value = art.author;
        this.el.status.value = art.status;
        this.el.category.value = art.category;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    deleteArticle(id) {
        if (confirm("Xóa bài viết này?")) {
            this.posts = this.posts.filter(p => p.id !== id);
            localStorage.setItem(this.key, JSON.stringify(this.posts));
            this.load();
        }
    }

    previewArticle(id) {
        const art = this.posts.find(p => p.id === id);
        if (!art) return;
        document.getElementById("previewModalCategory").innerText = art.category || 'TIN TỨC';
        document.getElementById("previewModalTitle").innerText = art.title;
        document.getElementById("previewModalAuthor").innerText = art.author || 'Admin';
        document.getElementById("previewModalSlug").innerText = art.slug || '';
        document.getElementById("previewModalExcerpt").innerText = art.excerpt || '';
        
        // Giải mã ký tự HTML để render trực quan tuyệt đối
        let rawContent = art.content || '';
        const parser = new DOMParser();
        const decodedContent = parser.parseFromString(rawContent, 'text/html').body.textContent;
        
        const container = document.getElementById("previewModalContent");
        if (decodedContent.includes('<p>') || decodedContent.includes('<h2>') || decodedContent.includes('<img')) {
            container.innerHTML = decodedContent;
        } else {
            container.innerHTML = rawContent;
        }
        
        document.getElementById("previewModalStatusBadge").innerHTML = `<strong>${art.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}</strong>`;
        document.getElementById("previewPostModal").classList.remove("hidden");
    }

    createNewArticle() {
        this.editId = null;
        if (this.el.title) this.el.title.value = "";
        if (this.el.slug) this.el.slug.value = "";
        if (this.el.excerpt) this.el.excerpt.value = "";
        if (this.el.content) this.el.content.innerHTML = "";
    }

    initGlobals() {
        window.saveArticle = () => this.saveArticle();
        window.editArticle = (id) => this.editArticle(id);
        window.deleteArticle = (id) => this.deleteArticle(id);
        window.previewArticle = (id) => this.previewArticle(id);
        window.createNewArticle = () => this.createNewArticle();

        let savedRange = null;
        const saveSelection = () => {
            const sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount > 0) savedRange = sel.getRangeAt(0);
        };
        const restoreSelection = () => {
            if (savedRange) {
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(savedRange);
            } else if (this.el.content) { 
                this.el.content.focus(); 
            }
        };

        if (this.el.content) {
            ['blur', 'keyup', 'mouseup'].forEach(ev => this.el.content.addEventListener(ev, saveSelection));
        }

        const setupModal = (type) => {
            let mode = 'url';
            const modalId = type === 'img' ? 'mediaImageModal' : 'mediaVideoModal';
            window[`open${type === 'img' ? 'Image' : 'Video'}Modal`] = () => { 
                saveSelection(); 
                document.getElementById(modalId).classList.remove('hidden'); 
            };
            window[`close${type === 'img' ? 'Image' : 'Video'}Modal`] = () => document.getElementById(modalId).classList.add('hidden');
            window[`switch${type === 'img' ? 'Img' : 'Vid'}Tab`] = (m) => {
                mode = m;
                document.getElementById(`${type}TabUrl`).className = `py-2 rounded-lg ${m==='url'?'bg-cyan-500 text-slate-950 font-bold':'text-slate-400'} transition`;
                document.getElementById(`${type}TabFile`).className = `py-2 rounded-lg ${m==='file'?'bg-cyan-500 text-slate-950 font-bold':'text-slate-400'} transition`;
                document.getElementById(`${type}ContentUrl`).classList.toggle('hidden', m !== 'url');
                document.getElementById(`${type}ContentFile`).classList.toggle('hidden', m !== 'file');
            };
            window[`confirmInsert${type === 'img' ? 'Image' : 'Video'}`] = () => {
                restoreSelection();
                if (mode === 'url') {
                    const url = document.getElementById(`modal${type === 'img' ? 'Img' : 'Vid'}UrlInput`).value.trim();
                    if (url) {
                        const html = type === 'img' 
                            ? `<img src="${url}" style="max-width:100%; border-radius:8px; margin:10px 0;" alt="Img"/>`
                            : ((url.includes("youtube.com") || url.includes("youtu.be")) ? `<div style="position:relative; padding-bottom:56.15%; height:0; overflow:hidden; margin:10px 0;"><iframe src="${url.replace('watch?v=', 'embed/')}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0; border-radius:8px;" allowfullscreen></iframe></div>` : `<video controls style="max-width:100%; border-radius:8px; margin:10px 0;"><source src="${url}" type="video/mp4"></video>`);
                        document.execCommand('insertHTML', false, html);
                        document.getElementById(`modal${type === 'img' ? 'Img' : 'Vid'}UrlInput`).value = "";
                    }
                } else {
                    const file = document.getElementById(`modal${type === 'img' ? 'Img' : 'Vid'}FileInput`).files[0];
                    if (file) {
                        const r = new FileReader();
                        r.onload = (e) => {
                            const html = type === 'img' 
                                ? `<img src="${e.target.result}" style="max-width:100%; border-radius:8px; margin:10px 0;" alt="Img"/>`
                                : `<video controls style="max-width:100%; border-radius:8px; margin:10px 0;"><source src="${e.target.result}" type="${file.type}"></video>`;
                            document.execCommand('insertHTML', false, html);
                            document.getElementById(`modal${type === 'img' ? 'Img' : 'Vid'}FileInput`).value = "";
                        };
                        r.readAsDataURL(file);
                    }
                }
                window[`close${type === 'img' ? 'Image' : 'Video'}Modal`]();
            };
        };
        setupModal('img');
        setupModal('vid');
    }
}

document.addEventListener("DOMContentLoaded", () => new PostAdminController().init());