var CartModel = {
    key: "novapad_cart_data",

    getCart: function() {
        var data = localStorage.getItem(this.key);
        try {
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    saveCart: function(items) {
        localStorage.setItem(this.key, JSON.stringify(items));
    },

    addItem: function(product) {
        var cart = this.getCart();
        var id = product.id;
        var name = product.title || product.name || "Thiết bị NovaPad";
        var price = Number(product.price) || 0;
        var image = product.image || "";

        var exist = cart.find(function(item) {
            return item.id === id && item.name === name;
        });

        if (exist) {
            exist.quantity += (product.quantity || 1);
        } else {
            cart.push({
                id: id,
                name: name,
                price: price,
                image: image,
                quantity: product.quantity || 1
            });
        }

        this.saveCart(cart);
        this.updateHeaderCart();
        return cart;
    },

    getTotalCount: function() {
        var cart = this.getCart();
        return cart.reduce(function(sum, item) {
            return sum + (Number(item.quantity) || 0);
        }, 0);
    },

    getTotalAmount: function() {
        var cart = this.getCart();
        return cart.reduce(function(sum, item) {
            return sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0));
        }, 0);
    },

    updateHeaderCart: function() {
        var count = this.getTotalCount();
        var amount = this.getTotalAmount();
        var badge = document.getElementById("header-cart-badge");
        var totalEl = document.getElementById("header-cart-total");

        if (badge) badge.innerText = count;
        if (totalEl) totalEl.innerText = "$" + amount.toFixed(2);
    }
};  