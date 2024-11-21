document.addEventListener('DOMContentLoaded', async () => {
  const productList = document.getElementById('product-list');

  try {
      // Solicita los productos desde el backend
      const response = await fetch('/client');
      const data = await response.json();

      if (data.success) {
          const products = data.products;

          if (products.length === 0) {
              productList.innerHTML = '<p>No hay productos disponibles.</p>';
              return;
          }

          // Renderiza los productos
          products.forEach(product => {
              const productDiv = document.createElement('div');
              productDiv.className = 'product';
              productDiv.innerHTML = `
                  <h3>${product.name}</h3>
                  <p>${product.description}</p>
                  <p>Precio: $${product.price}</p>
                  <p>Cantidad disponible: ${product.quantity}</p>
                  <button data-product="${product.name}" class="add-to-cart">Agregar al carrito</button>
              `;
              productList.appendChild(productDiv);
          });

          // Agregar evento a los botones de agregar al carrito
          const addToCartButtons = document.querySelectorAll('.add-to-cart');
          addToCartButtons.forEach(button => {
              button.addEventListener('click', event => {
                  const productName = event.target.getAttribute('data-product');
                  alert(`Producto agregado al carrito: ${productName}`);
                  // Lógica para agregar al carrito
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

  