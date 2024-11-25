document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/items')
        .then(response => response.json())
        .then(items => {
            const productList = document.getElementById('product-list');

            items.forEach(item => {
                const productElement = document.createElement('div');
                productElement.classList.add('product');

                productElement.innerHTML = `
                    <h3 id="name-${item.product_id}">${item.name}</h3>
                    <p>${item.description}</p>
                    <p>Precio: $${item.price}</p>
                    <input type="hidden" id="price-${item.product_id}" value="${item.price}">
                    <p>Stock: ${item.quantity}</p>
                    <img src="${item.image_url}" alt="${item.name}" width="200">
                    <button class="view-details" data-item-id="${item.product_id}">Ver detalles</button>
                    <button class="add-to-cart" data-item-id="${item.product_id}">Añadir al carrito</button>
                    <div class="quantity-container" style="display: none;">
                        <label for="quantity-${item.product_id}">Cantidad:</label>
                        <input type="number" id="quantity-${item.product_id}" name="quantity" min="1" max="${item.quantity}" value="1">
                        <button class="confirm-add" data-item-id="${item.product_id}">Confirmar</button>
                    </div>
                `;

                productList.appendChild(productElement);
            });

            productList.addEventListener('click', (event) => {
                const viewDetailsButton = event.target.closest('.view-details');
                const modal = document.getElementById('product-modal');
                const modalName = document.getElementById('modal-product-name');
                const modalImage = document.getElementById('modal-product-image');
                const modalDescription = document.getElementById('modal-product-description');
                const modalPrice = document.getElementById('modal-product-price');
                const modalAttributes = document.getElementById('modal-attributes');

                if (viewDetailsButton) {
                    const itemId = viewDetailsButton.getAttribute('data-item-id');
                    const item = items.find(i => i.product_id == itemId); // Buscar el producto en el array de items

                    // Rellenar el contenido del modal con los detalles del producto
                    modalName.textContent = item.name;
                    modalImage.src = item.image_url;
                    modalDescription.textContent = item.description;
                    modalPrice.textContent = `Precio: $${item.price}`;
                    modalAttributes.innerHTML = ''; // Limpiar los atributos previos

                    if (item.attributes) {
                        // Mostrar los atributos adicionales en el modal
                        for (const [key, value] of Object.entries(item.attributes)) {
                            modalAttributes.innerHTML += `<p><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}</p>`;
                        }
                    }

                    // Mostrar el modal
                    modal.style.display = 'block';
                }

                // Para cerrar el modal
                const closeBtn = document.querySelector('.close-btn');
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        modal.style.display = 'none';
                    });
                }
            });

            // Delegación de eventos para el botón de confirmar
            productList.addEventListener('click', (event) => {
                const confirmButton = event.target.closest('.confirm-add');

                if (confirmButton) {
                    const itemId = confirmButton.getAttribute('data-item-id');
                    const quantityContainer = confirmButton.closest('.quantity-container');
                    const quantityInput = quantityContainer.querySelector(`#quantity-${itemId}`);
                    const quantity = quantityInput.value;
                    const name = document.getElementById(`name-${itemId}`).textContent;
                    const price = document.getElementById(`price-${itemId}`).value;

                    const token = localStorage.getItem('token');
                    if (token) {
                        const decodedToken = jwt_decode(token);
                        const userId = decodedToken.id;

                        fetch(`/api/carts/${userId}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`,
                            },
                            body: JSON.stringify({ itemId, name, price, quantity })
                        })
                        .then(response => response.json())
                        .then(data => {
                            alert(data.message);
                        })
                        .catch(error => {
                            console.error('Error al agregar al carrito:', error);
                        });
                    }

                    quantityContainer.style.display = 'none';  // Ocultamos la cantidad después de confirmar
                }

                // Mostrar el input de cantidad cuando se hace clic en el botón "Añadir al carrito"
                const addToCartButton = event.target.closest('.add-to-cart');
                if (addToCartButton) {
                    const itemId = addToCartButton.getAttribute('data-item-id');
                    const quantityContainer = addToCartButton.nextElementSibling; 
                    quantityContainer.style.display = 'block';
                }
            });
        })
        .catch(error => {
            console.error('Error al cargar los productos:', error);
            document.getElementById('product-list').innerHTML = '<p>Error al cargar los productos.</p>';
        });
});

document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.querySelector('.close-btn');
    const modal = document.getElementById('product-modal');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
});
