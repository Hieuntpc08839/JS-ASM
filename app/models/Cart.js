export default class Cart {
    constructor(storageKey = "novapad_cart_data") {
        this.storageKey = storageKey;
        this.items = this.loadCart();
    }

    loadCart() {
        const data = localStorage.getItem(this.storageKey);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    saveCart() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    }

    // Getter tính tổng tiền 
    get totalAmount() {
        return this.items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
    }

    // Getter tính tổng số lượng
    get totalCount() {
        return this.items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
    }

    addItem(product, qty = 1) {
        const id = product.id;
        const name = product.name || product.title || "Thiết bị NovaPad";
        const price = Number(product.price) || 0;
        const image = product.image || "";

        const existing = this.items.find(i => i.id === id && i.name === name);
        if (existing) {
            existing.quantity += qty;
        } else {
            this.items.push({
                id: id,
                name: name,
                price: price,
                image: image,
                quantity: qty
            });
        }
        this.saveCart();
    }

    removeItem(index) {
        if (this.items[index]) {
            this.items.splice(index, 1);
            this.saveCart();
        }
    }

    clear() {
        this.items = [];
        this.saveCart();
    }
}