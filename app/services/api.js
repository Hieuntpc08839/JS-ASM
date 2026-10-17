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

export const getCategories = async () => {
    try {
        const res = await fetch(`${BASE_URL}/categories`);
        return await res.json();
    } catch (err) {
        console.error("Lỗi getCategories:", err);
        return [];
    }
};