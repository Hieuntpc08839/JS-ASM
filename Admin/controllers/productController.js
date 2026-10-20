import { 
    getProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    getProductById 
} from "../../app/services/api.js";

// 1. Hiển thị danh sách sản phẩm
export async function renderProducts() {
    const products = await getProducts();
    const tableBody = document.getElementById("product-list");
    if (!tableBody) return;

    tableBody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${Number(product.price).toLocaleString()} VNĐ</td>
            <td>
                <button class="btn-edit" data-id="${product.id}">Sửa</button>
                <button class="btn-delete" data-id="${product.id}">Xóa</button>
            </td>
        </tr>
    `).join("");

    bindEvents();
}

// 2. Gán sự kiện cho nút Sửa & Xóa
function bindEvents() {
    // Sự kiện Xóa
    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.getAttribute("data-id");
            if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
                const isSuccess = await deleteProduct(id);
                if (isSuccess) {
                    alert("Xóa thành công!");
                    renderProducts();
                } else {
                    alert("Xóa thất bại!");
                }
            }
        });
    });

    // Sự kiện Sửa (Mở form điền thông tin cũ)
    document.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = e.target.getAttribute("data-id");
            const product = await getProductById(id);
            if (product) {
                document.getElementById("prod-id").value = product.id;
                document.getElementById("prod-name").value = product.name;
                document.getElementById("prod-price").value = product.price;
            }
        });
    });
}

// 3. Sự kiện submit Form (Xử lý cả Thêm mới & Cập nhật)
export function initProductForm() {
    const form = document.getElementById("product-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("prod-id").value;
        const name = document.getElementById("prod-name").value;
        const price = Number(document.getElementById("prod-price").value);

        const productData = { name, price };

        if (id) {
            // Nếu có ID -> Thực hiện Sửa (Update)
            const updated = await updateProduct(id, productData);
            if (updated) alert("Cập nhật sản phẩm thành công!");
        } else {
            // Nếu chưa có ID -> Thực hiện Thêm mới (Create)
            const created = await createProduct(productData);
            if (created) alert("Thêm sản phẩm thành công!");
        }

        form.reset();
        document.getElementById("prod-id").value = "";
        renderProducts();
    });
}