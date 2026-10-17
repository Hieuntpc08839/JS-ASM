import Component from "./Component.js";
import ProductItem from "./ProductItem.js";

export default class ProductList extends Component {
    constructor(renderHookId, onAddToCart) {
        super(renderHookId);
        this.onAddToCart = onAddToCart;
    }

    renderProducts(products) {
        const hook = document.querySelector(this.hookId);
        if (!hook) return;
        hook.innerHTML = "";

        if (products.length === 0) {
            hook.innerHTML = `<p class="col-span-full text-center py-10 text-gray-500 font-mono">Không có sản phẩm nào phù hợp.</p>`;
            return;
        }

        for (const prod of products) {
            new ProductItem(prod, this.hookId, this.onAddToCart);
        }
    }
}