class Purchase {
    constructor(username, products) {
        this.username = username;
        this.products = products;
        this.date = new Date();
    }

    static addPurchase(purchase) {
        Purchase.purchases.push(purchase);
    }

    static getUserPurchases(username) {
        return Purchase.purchases.filter(purchase => purchase.username === username);
    }
}

Purchase.purchases = [];
module.exports = Purchase;
