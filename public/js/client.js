document.addEventListener('DOMContentLoaded', async () => {
  const productList = document.getElementById('product-list');

  try {
      const response = await fetch('/client'); // Llama a la API
      if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
          const products = data.products;

          if (products.length === 0) {
              productList.innerHTML = '<p>No hay productos disponibles.</p>';
              return;
          }

          products.forEach(product => {
              const productCard = document.createElement('div');
              productCard.className = 'product-card';
              productCard.innerHTML = `
                  <h3>${product.name}</h3>
                  <p>${product.description}</p>
                  <p><strong>Precio:</strong> $${product.price}</p>
                  <p><strong>Cantidad disponible:</strong> ${product.quantity}</p>
                  <button class="add-to-cart" data-product='${JSON.stringify(product)}'>Agregar al carrito</button>
              `;
              productList.appendChild(productCard);
          });

          // Manejar evento "Agregar al carrito"
          document.querySelectorAll('.add-to-cart').forEach(button => {
              button.addEventListener('click', event => {
                  const product = JSON.parse(event.target.getAttribute('data-product'));
                  showQuantityModal(product);
              });
          });
      } else {
          productList.innerHTML = '<p>Error al cargar productos.</p>';
      }
  } catch (error) {
      console.error('Error al cargar los productos:', error);
      productList.innerHTML = '<p>Error al conectar con el servidor.</p>';
  }
});

/**
 * Muestra un modal para seleccionar la cantidad antes de agregar al carrito.
 * @param {Object} product Producto seleccionado.
 */
function showQuantityModal(product) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
      <div class="modal-content">
          <h3>Agregar ${product.name} al carrito</h3>
          <p>${product.description}</p>
          <p><strong>Precio unitario:</strong> $${product.price}</p>
          <p><strong>Cantidad disponible:</strong> ${product.quantity}</p>
          <label for="quantity">Selecciona la cantidad:</label>
          <input type="number" id="quantity" min="1" max="${product.quantity}" value="1">
          <div class="modal-actions">
              <button id="add-to-cart-confirm">Agregar</button>
              <button id="close-modal">Cancelar</button>
          </div>
      </div>
  `;

  document.body.appendChild(modal);

  // Manejar confirmación y cancelación
  document.getElementById('add-to-cart-confirm').addEventListener('click', () => {
      const quantity = parseInt(document.getElementById('quantity').value, 10);

      if (quantity > 0 && quantity <= product.quantity) {
          addToCart(product, quantity);
          document.body.removeChild(modal);
      } else {
          alert('Por favor, selecciona una cantidad válida.');
      }
  });

  document.getElementById('close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
  });
}

/**
 * Agrega un producto al carrito en `localStorage`.
 * @param {Object} product Producto seleccionado.
 * @param {number} quantity Cantidad seleccionada.
 */
function addToCart(product, quantity) {
  let shoppingCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
  const existingProduct = shoppingCart.find(p => p.productName === product.name);

  if (existingProduct) {
      existingProduct.productQuantity += quantity; // Incrementar cantidad
  } else {
      shoppingCart.push({
          productName: product.name,
          productPrice: product.price,
          productQuantity: quantity,
      });
  }

  localStorage.setItem('shoppingCart', JSON.stringify(shoppingCart));
  alert(`Se agregaron ${quantity} unidades de ${product.name} al carrito 🛒`);
}
