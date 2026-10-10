
function renderProductTable() {
    var tbody = document.getElementById('product-table-body');
    if (!tbody) return;

    var products = ProductService.getAll();
    var html = '';

    for (var i = 0; i < products.length; i++) {
        var item = products[i];
        var isLowStock = item.stock < 100;
        var badgeClass = isLowStock 
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        var statusText = isLowStock ? 'Cảnh báo kho' : 'Hoạt động';

        html += '<tr class="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">' +
            '<td class="py-3 px-4 font-mono text-cyan-400 font-semibold">' + item.id + '</td>' +
            '<td class="py-3 px-4">' +
                '<div class="flex items-center space-x-3">' +
                    '<img src="' + item.image + '" class="w-10 h-10 rounded border border-slate-700 object-cover" alt="Product" />' +
                    '<span class="font-medium text-slate-100">' + item.name + '</span>' +
                '</div>' +
            '</td>' +
            '<td class="py-3 px-4 text-slate-400">' + item.category + '</td>' +
            '<td class="py-3 px-4 font-bold text-slate-200">$' + Number(item.price).toFixed(2) + '</td>' +
            '<td class="py-3 px-4 text-slate-300">' + item.stock + ' chiếc</td>' +
            '<td class="py-3 px-4">' +
                '<span class="px-2.5 py-1 text-xs font-medium rounded ' + badgeClass + '">' + statusText + '</span>' +
            '</td>' +
            '<td class="py-3 px-4 text-right">' +
                '<button onclick="onDeleteProduct(\'' + item.id + '\')" class="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded border border-rose-500/20 transition-all" title="Xóa">' +
                    '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>' +
                '</button>' +
            '</td>' +
        '</tr>';
    }

    tbody.innerHTML = html;
}


function openAddProductModal() {
    var modal = document.getElementById('add-product-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeAddProductModal() {
    var modal = document.getElementById('add-product-modal');
    if (modal) modal.classList.add('hidden');
}


function handleAddProductForm(event) {
    event.preventDefault();
    
    var name = document.getElementById('prod-name').value;
    var category = document.getElementById('prod-category').value;
    var price = parseFloat(document.getElementById('prod-price').value);
    var stock = parseInt(document.getElementById('prod-stock').value, 10);
    var image = document.getElementById('prod-image').value;

    if (!image) {
        image = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80';
    }

    var autoId = 'NP-' + Math.floor(1000 + Math.random() * 9000);
    var status = stock < 100 ? 'Cảnh báo kho' : 'Hoạt động';

    var newProduct = new ProductModel(autoId, name, category, price, stock, status, image);
    ProductService.add(newProduct);

    
    document.getElementById('add-product-form').reset();
    closeAddProductModal();
    renderProductTable();
}


function onDeleteProduct(id) {
    if (confirm('Em có chắc chắn muốn xóa sản phẩm mã ' + id + ' này không?')) {
        ProductService.delete(id);
        renderProductTable();
    }
}


document.addEventListener('DOMContentLoaded', function() {
    renderProductTable();
    
    var form = document.getElementById('add-product-form');
    if (form) {
        form.addEventListener('submit', handleAddProductForm);
    }
});