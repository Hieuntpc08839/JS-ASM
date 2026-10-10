
function ProductModel(id, name, category, price, stock, status, image) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.price = price;
    this.stock = stock;
    this.status = status;
    this.image = image;
}


function CategoryModel(id, name, description) {
    this.id = id;
    this.name = name;
    this.description = description;
}