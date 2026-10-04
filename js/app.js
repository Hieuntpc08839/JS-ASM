/* JavaScript ES5-style: var + function, không dùng let/const/arrow function */

var products = [
  {id:1,name:'NovaPad Apex Pro v3.2',price:189.99,category:'Tay cầm',image:'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=900&q=80',desc:'Tay cầm gaming hiệu năng cao, thiết kế dành cho thi đấu.'},
  {id:2,name:'CyberStrike HE Elite',price:129.50,category:'Tay cầm',image:'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=900&q=80',desc:'Controller phong cách hiện đại với cảm giác bấm nhanh.'},
  {id:3,name:'NovaDock Fast Charge',price:49.99,category:'Phụ kiện',image:'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=900&q=80',desc:'Dock sạc nhanh cho hệ sinh thái NovaPad.'},
  {id:4,name:'Aim Stick Kit v4',price:24.99,category:'Phụ kiện',image:'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=900&q=80',desc:'Bộ thumbstick thay thế cho game thủ.'}
];

function getCart() {
  var cart = localStorage.getItem('novapad_cart');
  if (!cart) { return []; }
  try { return JSON.parse(cart); } catch (e) { return []; }
}

function saveCart(cart) {
  localStorage.setItem('novapad_cart', JSON.stringify(cart));
}

function addToCart(id) {
  var cart = getCart();
  var found = false;
  var i;
  for (i = 0; i < cart.length; i++) {
    if (cart[i].id === id) {
      cart[i].qty += 1;
      found = true;
      break;
    }
  }
  if (!found) { cart.push({id:id,qty:1}); }
  saveCart(cart);
  updateCartCount();
  alert('Đã thêm sản phẩm vào giỏ hàng.');
}

function removeFromCart(id) {
  var cart = getCart();
  var result = [];
  var i;
  for (i = 0; i < cart.length; i++) {
    if (cart[i].id !== id) { result.push(cart[i]); }
  }
  saveCart(result);
  renderCart();
  updateCartCount();
}

function changeQty(id, delta) {
  var cart = getCart();
  var i;
  for (i = 0; i < cart.length; i++) {
    if (cart[i].id === id) {
      cart[i].qty += delta;
      if (cart[i].qty <= 0) { cart.splice(i, 1); }
      break;
    }
  }
  saveCart(cart);
  renderCart();
  updateCartCount();
}

function updateCartCount() {
  var el = document.getElementById('cart-count');
  var cart = getCart();
  var total = 0;
  var i;
  if (!el) { return; }
  for (i = 0; i < cart.length; i++) { total += cart[i].qty; }
  el.innerHTML = total;
}

function formatMoney(value) {
  return '$' + value.toFixed(2);
}

function findProduct(id) {
  var i;
  for (i = 0; i < products.length; i++) {
    if (products[i].id === id) { return products[i]; }
  }
  return null;
}

function renderProducts() {
  var box = document.getElementById('product-list');
  var html = '';
  var i;
  if (!box) { return; }
  for (i = 0; i < products.length; i++) {
    html += '<article class="overflow-hidden rounded-xl border border-line bg-panel">';
    html += '<img class="h-52 w-full object-cover" src="' + products[i].image + '" alt="' + products[i].name + '">';
    html += '<div class="p-4">';
    html += '<div class="text-[9px] uppercase tracking-wider text-cyanx">' + products[i].category + '</div>';
    html += '<h2 class="mt-1 font-bold">' + products[i].name + '</h2>';
    html += '<p class="mt-2 text-xs leading-5 text-slate-500">' + products[i].desc + '</p>';
    html += '<div class="mt-4 flex items-center justify-between"><b class="text-lg">' + formatMoney(products[i].price) + '</b>';
    html += '<button onclick="addToCart(' + products[i].id + ')" class="rounded-lg bg-cyanx px-3 py-2 text-xs font-extrabold text-[#071015]">THÊM GIỎ</button></div>';
    html += '<a href="product-detail.html?id=' + products[i].id + '" class="mt-3 block text-center text-[10px] text-slate-500 hover:text-cyanx">Xem chi tiết</a>';
    html += '</div></article>';
  }
  box.innerHTML = html;
}

function renderProductDetail() {
  var box = document.getElementById('product-detail');
  var params = new URLSearchParams(window.location.search);
  var id = parseInt(params.get('id') || '1', 10);
  var p = findProduct(id);
  if (!box || !p) { return; }
  box.innerHTML = '<div class="grid gap-8 md:grid-cols-2">' +
    '<img class="h-[420px] w-full rounded-2xl border border-line object-cover" src="' + p.image + '" alt="' + p.name + '">' +
    '<div class="flex flex-col justify-center">' +
    '<div class="text-[10px] uppercase tracking-[.2em] text-cyanx">' + p.category + '</div>' +
    '<h1 class="mt-2 text-4xl font-extrabold">' + p.name + '</h1>' +
    '<p class="mt-5 text-sm leading-7 text-slate-500">' + p.desc + ' Sản phẩm được tối ưu cho trải nghiệm chơi game ổn định và thao tác nhanh.</p>' +
    '<div class="mt-7 text-3xl font-extrabold">' + formatMoney(p.price) + '</div>' +
    '<button onclick="addToCart(' + p.id + ')" class="mt-7 rounded-xl bg-cyanx px-6 py-4 text-sm font-extrabold text-[#071015]">THÊM VÀO GIỎ HÀNG</button>' +
    '</div></div>';
}

function renderCart() {
  var box = document.getElementById('cart-items');
  var totalBox = document.getElementById('cart-total');
  var checkout = document.getElementById('checkout-btn');
  var cart = getCart();
  var html = '';
  var total = 0;
  var i, p, line;
  if (!box) { return; }

  if (cart.length === 0) {
    box.innerHTML = '<div class="rounded-xl border border-dashed border-line bg-panel p-10 text-center text-sm text-slate-500">Giỏ hàng đang trống.</div>';
    if (totalBox) { totalBox.innerHTML = '$0.00'; }
    return;
  }

  for (i = 0; i < cart.length; i++) {
    p = findProduct(cart[i].id);
    if (!p) { continue; }
    line = p.price * cart[i].qty;
    total += line;
    html += '<div class="flex flex-col gap-4 rounded-xl border border-line bg-panel p-4 sm:flex-row sm:items-center">';
    html += '<img class="h-20 w-20 rounded-lg object-cover" src="' + p.image + '" alt="' + p.name + '">';
    html += '<div class="flex-1"><b>' + p.name + '</b><div class="mt-1 text-xs text-slate-500">' + formatMoney(p.price) + ' / sản phẩm</div></div>';
    html += '<div class="flex items-center gap-3"><button onclick="changeQty(' + p.id + ',-1)" class="h-8 w-8 rounded border border-line">-</button><span class="w-6 text-center">' + cart[i].qty + '</span><button onclick="changeQty(' + p.id + ',1)" class="h-8 w-8 rounded border border-line">+</button></div>';
    html += '<b class="w-24 text-right">' + formatMoney(line) + '</b>';
    html += '<button onclick="removeFromCart(' + p.id + ')" class="text-xs text-rose-300">Xóa</button>';
    html += '</div>';
  }
  box.innerHTML = html;
  if (totalBox) { totalBox.innerHTML = formatMoney(total); }
  if (checkout) {
    checkout.onclick = function () {
      alert('Đặt hàng thành công. Đây là chức năng demo phía frontend.');
      localStorage.removeItem('novapad_cart');
      renderCart();
      updateCartCount();
    };
  }
}
