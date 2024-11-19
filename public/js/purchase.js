
var productName = localStorage["productName"];

document.addEventListener('DOMContentLoaded', async function () {
  let storedShoppingCart = localStorage["shoppingCart"];

  if (storedShoppingCart === undefined) {
    return;
  }

  let shoppingCart = JSON.parse(storedShoppingCart);

  const table = document.getElementById('product-details');
  let total = 0;
  let totalUnits = 0;

  for (let i = 0; i < shoppingCart.length; i++) {
    const product = shoppingCart[i];
    let productName = product.productName;
    console.log("alo+aaaa" + productName);

    try {
      await fetch('client/product?productName=' + productName)
        .then(response => response.json())
        .then(data => {
          console.log(data.name);
          console.log(data.price);
          console.log(data.quantity);

          let tableRow = table.insertRow();
          let cell1Name = tableRow.insertCell();
          let cell3Description = tableRow.insertCell();
          let cell4UnitPrice = tableRow.insertCell();
          let cell5Units = tableRow.insertCell();
          let cell6Subtotal = tableRow.insertCell();

          cell1Name.innerHTML = data.name;
          cell3Description.innerHTML = data.description;
          cell4UnitPrice.innerHTML = data.price;
          cell5Units.innerHTML = product.productQuantity;
          totalUnits += product.productQuantity;

          let subtotal = data.price * product.productQuantity;
          total += subtotal;

          cell6Subtotal.innerHTML = subtotal;
          console.log("ESTE ES EL TOTAL" + total);
        });

    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

  const totalDiv = document.getElementById('total-div');
  totalDiv.innerHTML = "TOTAL: "+total;



  const purchaseButton = document.getElementById('purchase');
  if (purchaseButton) {
    purchaseButton.addEventListener('click', () => handlePurchase(shoppingCart));
  } else {
    console.error('Purchase button not found');
  }
});

async function handlePurchase(shoppingCart) {
  try {
    // Verificar el stock antes de realizar la compra
    for (const product of shoppingCart) {
      const productName = product.productName;

      await fetch('client/product?productName=' + productName)
        .then(response => response.json())
        .then(data => {
          if (data.quantity < product.productQuantity) {
            alert('No hay suficiente stock para el producto ' + productName);
            return;
          }
        });
    }

    const purchaseData = {
      username: localStorage.getItem("myUsername"),
      products: shoppingCart
    };

    await fetch('/client/purchase', { // Asegúrate de que la URL sea correcta
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(purchaseData)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      }
      )
      .then(data => {
        console.log('Response from server:', data);
        if (data.success) {
          alert('Compra realizada correctamente');
          localStorage.removeItem('shoppingCart'); // Limpiar el carrito después de la compra
          window.location.href = '/client.html';
        } else {
          alert('Error al realizar la compra');
        }
      })
  } catch (error) {
    console.error('Error during purchase:', error);
  }
}
