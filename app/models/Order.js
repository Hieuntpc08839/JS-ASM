// app/models/Order.js
export class Order {
    constructor(userId, customerName = "", totalPrice = 0, status = "pending") {
        this.id = null;
        this.order_code = "#NV-" + Math.floor(1000 + Math.random() * 9000);
        this.user_id = userId;
        this.customer_name = customerName;
        this.total_price = Number(totalPrice);
        this.created_date = new Date().toISOString();
        this.status = status;
    }
}

export class OrderDetail {
    constructor(orderId, productId, productName, quantity, unitPrice) {
        this.id = null;
        this.order_id = orderId;
        this.product_id = productId;
        this.product_name = productName;
        this.quantity = Number(quantity);
        this.unit_price = Number(unitPrice);
    }
}