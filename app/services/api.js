const BASE_URL = "http://localhost:3000";
export const getProducts = async () => {
    try {
        const res = await fetch(`${BASE_URL}/products`);
        if (!res.ok) throw new Error("Lỗi khi tải danh sách sản phẩm");
        return await res.json();
    } catch (err) {
        console.error("Lỗi getProducts:", err);
        return [];
    }
};

export const getProductById = async (id) => {
    try {
        const res = await fetch(`${BASE_URL}/products/${id}`);
        if (!res.ok) throw new Error(`Không tìm thấy sản phẩm id ${id}`);
        return await res.json();
    } catch (err) {
        console.error("Lỗi getProductById:", err);
        return null;
    }
};

export const getProductsByCategory = async (cateId) => {
    try {
        const res = await fetch(`${BASE_URL}/products?cate_id=${cateId}`);
        return await res.json();
    } catch (err) {
        console.error("Lỗi getProductsByCategory:", err);
        return [];
    }
};

export const createProduct = async (productData) => {
    try {
        const res = await fetch(`${BASE_URL}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData)
        });
        return await res.json();
    } catch (err) {
        console.error("Lỗi createProduct:", err);
        return null;
    }
};

export const updateProduct = async (id, productData) => {
    try {
        const res = await fetch(`${BASE_URL}/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData)
        });
        return await res.json();
    } catch (err) {
        console.error("Lỗi updateProduct:", err);
        return null;
    }
};

export const deleteProduct = async (id) => {
    try {
        const res = await fetch(`${BASE_URL}/products/${id}`, {
            method: "DELETE"
        });
        return res.ok;
    } catch (err) {
        console.error("Lỗi deleteProduct:", err);
        return false;
    }
};

//BIẾN THỂ
export const getVariantsByProductId = async (productId) => {
    try {
        const res = await fetch(`${BASE_URL}/product_variants?product_id=${productId}`);
        return await res.json();
    } catch (err) {
        console.error("Lỗi getVariantsByProductId:", err);
        return [];
    }
};

//DANH MỤC
export const getCategories = async () => {
    try {
        const res = await fetch(`${BASE_URL}/categories`);
        if (!res.ok) throw new Error("Lỗi khi tải danh mục");
        return await res.json();
    } catch (err) {
        console.error("Lỗi getCategories:", err);
        return [];
    }
};

export const createCategory = async (catData) => {
    try {
        const res = await fetch(`${BASE_URL}/categories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(catData)
        });
        return await res.json();
    } catch (err) {
        console.error("Lỗi createCategory:", err);
        return null;
    }
};

export const deleteCategory = async (id) => {
    try {
        const res = await fetch(`${BASE_URL}/categories/${id}`, {
            method: "DELETE"
        });
        return res.ok;
    } catch (err) {
        console.error("Lỗi deleteCategory:", err);
        return false;
    }
};

//ĐƠN HÀNG
export const createOrder = async (orderInfo, cartItems = []) => {
    try {
        const orderRes = await fetch(`${BASE_URL}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderInfo)
        });
        const createdOrder = await orderRes.json();

        if (createdOrder && createdOrder.id && Array.isArray(cartItems)) {
            for (const item of cartItems) {
                await fetch(`${BASE_URL}/order_details`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        order_id: createdOrder.id,
                        product_id: item.id,
                        product_name: item.name,
                        quantity: Number(item.quantity) || 1,
                        unit_price: Number(item.price) || 0
                    })
                });
            }
        }
        return createdOrder;
    } catch (err) {
        console.error("Lỗi createOrder:", err);
        return null;
    }
};

export const getOrders = async () => {
    try {
        const res = await fetch(`${BASE_URL}/orders`);
        return await res.json();
    } catch (err) {
        console.error("Lỗi getOrders:", err);
        return [];
    }
};

export const getOrderDetails = async (orderId) => {
    try {
        const res = await fetch(`${BASE_URL}/order_details?order_id=${orderId}`);
        return await res.json();
    } catch (err) {
        console.error("Lỗi getOrderDetails:", err);
        return [];
    }
};

export const updateOrderStatus = async (id, newStatus) => {
    try {
        const res = await fetch(`${BASE_URL}/orders/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });
        return await res.json();
    } catch (err) {
        console.error("Lỗi updateOrderStatus:", err);
        return null;
    }
};

//NGƯỜI DÙNG
export const getUsers = async () => {
    try {
        const res = await fetch(`${BASE_URL}/users`);
        return await res.json();
    } catch (err) {
        console.error("Lỗi getUsers:", err);
        return [];
    }
};

export const registerUserApi = async (userData) => {
    try {
        const res = await fetch(`${BASE_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        });
        return await res.json();
    } catch (err) {
        console.error("Lỗi registerUserApi:", err);
        return null;
    }
};