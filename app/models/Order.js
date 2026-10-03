class Order {
    constructor(userId, createdDate = new Date().toISOString(), status = "pending") {
        this.userId = userId;
        this.createdDate = createdDate;
        this.status = status;
    }
}

class OrderDetail {
    constructor(orderId, productId, quantity, unitPrice) {
        this.orderId = orderId;
        this.productId = productId;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }
}