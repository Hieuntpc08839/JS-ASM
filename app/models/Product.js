export default class Product {
    #price = 0;

    constructor(id, name, image, detail, price, cate_id = 1) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.detail = detail;
        this.price = price;
        this.cate_id = Number(cate_id);

        this.connection = "wireless";
        this.tech = [];
        this.platforms = [];
        this.origPrice = null;
        this.badge = "";
        this.rating = "";
    }

    set price(value) {
        const num = Number(value);
        if (num >= 0) {
            this.#price = num;
        } else {
            console.error("Giá tiền không hợp lệ!");
        }
    }

    get price() {
        return this.#price;
    }

    get formattedPrice() {
        return this.#price.toLocaleString("vi-VN") + " đ";
    }
}