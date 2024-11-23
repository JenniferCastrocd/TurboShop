document.addEventListener('DOMContentLoaded', async function () {
  let storedShoppingCart = localStorage["shoppingCart"];

  if (!storedShoppingCart) {
    console.log("El carrito está vacío.");
    return;
  }

  let shoppingCart = JSON.parse(storedShoppingCart);
  const table = document.getElementById('product-details');
  let total = 0;
  let totalUnits = 0;

  try {
    // Obtener todos los productos desde /client
    const response = await fetch('/client');
    if (!response.ok) {
      throw new Error(`Error al obtener productos: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error("No se pudieron cargar los productos desde el servidor.");
    }

    const allProducts = data.products;

    for (let i = 0; i < shoppingCart.length; i++) {
      const productInCart = shoppingCart[i];
      const product = allProducts.find(p => p.name === productInCart.productName);

      if (!product) {
        console.error(`Producto "${productInCart.productName}" no encontrado.`);
        continue;
      }

      let tableRow = table.insertRow();
      let cell1Name = tableRow.insertCell();
      let cell2Description = tableRow.insertCell();
      let cell3UnitPrice = tableRow.insertCell();
      let cell4Units = tableRow.insertCell();
      let cell5Subtotal = tableRow.insertCell();

      cell1Name.innerHTML = product.name;
      cell2Description.innerHTML = product.description;
      cell3UnitPrice.innerHTML = product.price;
      cell4Units.innerHTML = productInCart.productQuantity;

      let subtotal = product.price * productInCart.productQuantity;
      total += subtotal;
      totalUnits += productInCart.productQuantity;

      cell5Subtotal.innerHTML = subtotal.toFixed(2);
    }

    const totalDiv = document.getElementById('total-div');
    totalDiv.innerHTML = `TOTAL: $${total.toFixed(2)}`;

    const purchaseButton = document.getElementById('purchase');
    if (purchaseButton) {
      purchaseButton.addEventListener('click', () => handlePurchase(shoppingCart));
    } else {
      console.error('Botón de compra no encontrado.');
    }

  } catch (error) {
    console.error('Error al cargar el carrito:', error);
    const totalDiv = document.getElementById('total-div');
    totalDiv.innerHTML = '<p>Error al conectar con el servidor.</p>';
  }
});

// Función para procesar la compra
async function handlePurchase(shoppingCart) {
  try {
    const purchaseData = {
      username: localStorage.getItem("myUsername"),
      products: shoppingCart,
    };

    const response = await fetch('/client/purchase', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(purchaseData),
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    if (data.success) {
      alert('Compra realizada correctamente.');
      localStorage.removeItem('shoppingCart'); // Limpiar el carrito después de la compra
      window.location.href = '/client.html';
    } else {
      alert('Error al realizar la compra.');
    }
  } catch (error) {
    console.error('Error durante la compra:', error);
  }
}
