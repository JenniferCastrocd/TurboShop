document.addEventListener('DOMContentLoaded', async () => {
    const productList = document.getElementById('product-list');
  
    try {
        const response = await fetch('/client'); // Llama a la API
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
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
                    <button class="add-to-cart" data-product="${product.name}">Agregar al carrito</button>
                `;
                productList.appendChild(productCard);
            });
        } else {
            productList.innerHTML = '<p>Error al cargar productos.</p>';
        }
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        productList.innerHTML = '<p>Error al conectar con el servidor.</p>';
    }
  });