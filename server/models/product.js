class Product {
    constructor(name, description, price, quantity) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.quantity = quantity;
    }

    static addProduct(product) {
        Product.products.push(product);
    }

    static getAllProducts() {
        return Product.products;
    }

    static updateProductQuantity(name, quantitySold) {
        const product = Product.products.find(p => p.name === name);
        if (product) {
            product.quantity -= quantitySold;
            console.log(`Updated quantity for product ${product.name} is now ${product.quantity}`);  // Añadir log para confirmar la actualización de la cantidad
        }
    }
}

Product.products = [];
Product.products.push(new Product("product", "pro", 10, 10))
module.exports = Product;
