class Product {
    constructor(id, name, image, detail, price, cate_id = 1) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.detail = detail;
        this.price = price;
        this.cate_id = cate_id;
 
        // Các trường phục vụ lọc Sidebar theo thiết kế
        this.connection = "wireless"; 
        this.tech = [];              
        this.platforms = [];         
        // Các trường hiển thị
        this.origPrice = null;
        this.badge = "";
        this.extra = "";
        this.series = "";
        this.rating = "";
        this.preorder = false;
        this.tags = [];
    }
}