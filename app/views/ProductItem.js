// app/views/ProductItem.js
import Component from "./Component.js";

export default class ProductItem extends Component {
    constructor(product, renderHookId, onAddToCart) {
        super(renderHookId);
        this.product = product;
        this.onAddToCart = onAddToCart;
        this.render();
    }

    addToCartHandler() {
        if (typeof this.onAddToCart === "function") {
            this.onAddToCart(this.product);
        }
    }

    render() {
        const prodEl = this.createRootElement(
            "div",
            "bg-[#0b101c] border border-gray-800 rounded-xl overflow-hidden hover:border-cyan-500/40 transition flex flex-col justify-between group p-4"
        );

        const origPriceHtml = this.product.origPrice
            ? `<span class="text-gray-500 text-xs line-through ml-1.5 font-mono">${Number(this.product.origPrice).toLocaleString("vi-VN")} đ</span>`
            : "";

        prodEl.innerHTML = `
            <div class="p-2 bg-[#0d1424] rounded-lg relative mb-3">
                <div class="h-44 w-full flex items-center justify-center overflow-hidden rounded bg-black/40">
                    <a href="product-detail.html?id=${this.product.id}">
                        <img src="${this.product.image}" alt="${this.product.name}" class="h-full w-full object-cover group-hover:scale-105 transition duration-300">
                    </a>
                </div>
            </div>
            <div class="flex-1 flex flex-col justify-between">
                <div>
                    <h3 class="text-white font-bold text-base mb-2 group-hover:text-cyan-400 transition">
                        <a href="product-detail.html?id=${this.product.id}">${this.product.name}</a>
                    </h3>
                    <p class="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">${this.product.detail || ""}</p>
                </div>
                <div class="flex items-center justify-between pt-3 border-t border-gray-800/80 mt-auto">
                    <div>
                        <span class="text-cyan-400 text-lg font-bold font-mono">${this.product.formattedPrice}</span>
                        ${origPriceHtml}
                    </div>
                    <button class="btn-add-cart w-9 h-9 rounded-lg flex items-center justify-center bg-cyan-400 hover:bg-cyan-300 text-black transition font-bold" data-id="${this.product.id}">
                        +
                    </button>
                </div>
            </div>
        `;

        const addCartBtn = prodEl.querySelector(".btn-add-cart");
        addCartBtn.addEventListener("click", this.addToCartHandler.bind(this));
    }
}