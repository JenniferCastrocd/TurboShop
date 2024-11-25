async function verifyAdminAccess() {
    const token = localStorage.getItem('token'); 

    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch('/api/admin/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}` 
            }
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('welcome-message').innerText = data.message;
            loadProducts();
        } else {
            alert(data.message);
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Error:', error); 
        alert('Error de conexión con el servidor.');
    }
}

async function loadProducts() {
    try {
        const response = await fetch('/api/items');
        const items = await response.json();

        if (response.ok) {
            const productList = document.getElementById('product-list');
            productList.innerHTML = ''; // Limpiar la lista de productos

            items.forEach(item => {
                addProductToList(item); // Agregar cada producto a la lista
            });
        } else {
            alert('No se pudieron cargar los productos: ' + (items.message || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error al cargar los productos:', error);
    }
}

function addProductToList(product) {
    const productList = document.getElementById('product-list');

    // Crear un div para cada producto
    const productItem = document.createElement('div');
    productItem.classList.add('product-item');
    productItem.dataset.id = product.id;

    // Contenido HTML del producto
    productItem.innerHTML = `
        <div class="left">
            <img src="${product.image_url}" class="product-image" alt="${product.name}">
        </div>
        <div class="right">
            <strong>${product.name}</strong><br>
            Descripción: ${product.description}<br><br> 
            Precio: $${product.price} | Stock: ${product.quantity} <br>
        </div>
    `;

    // Agregar atributos extra si existen
    if (product.attributes) {
        for (const [key, value] of Object.entries(product.attributes)) {
            productItem.querySelector('.right').innerHTML += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}<br>`;
        }
    }

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-product');
    deleteButton.textContent = 'Eliminar';

    productItem.querySelector('.right').appendChild(deleteButton);

    // Evento para eliminar el producto
    deleteButton.addEventListener('click', async () => {
        await deleteProduct(product.product_id);
        productItem.remove();
    });

    // Agregar el producto al listado
    productList.appendChild(productItem);
}

async function deleteProduct(productId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/items/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (response.ok) {
            alert('Producto eliminado exitosamente');
        } else {
            alert(data.message || 'Error al eliminar producto');
        }
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Hubo un error al intentar eliminar el producto');
    }
}

let extraAttributes = [];

document.getElementById('add-attribute-btn').addEventListener('click', function() {

    const container = document.getElementById('extra-attributes-container');

    const attributeDiv = document.createElement('div');
    attributeDiv.classList.add('attribute-field');
    const attributeId = `attribute-${extraAttributes.length + 1}`;

    attributeDiv.innerHTML = `
        <label for="name-${attributeId}">Nombre del Atributo ${extraAttributes.length + 1}:</label>
        <input type="text" id="name-${attributeId}" name="attribute-name-${extraAttributes.length + 1}" placeholder="Nombre del atributo">
        
        <label for="value-${attributeId}">Valor del Atributo ${extraAttributes.length + 1}:</label>
        <input type="text" id="value-${attributeId}" name="attribute-value-${extraAttributes.length + 1}" placeholder="Valor del atributo">
        
        <button type="button" class="remove-attribute-btn">Eliminar</button>
    `;

    container.appendChild(attributeDiv);

    extraAttributes.push(attributeId);

    attributeDiv.querySelector('.remove-attribute-btn').addEventListener('click', function() {
        container.removeChild(attributeDiv);
        extraAttributes = extraAttributes.filter(attr => attr !== attributeId);
    });
});

document.getElementById('product-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const price = parseFloat(document.getElementById('price').value);
    const stock = parseInt(document.getElementById('stock').value);
    const imageFile = document.getElementById('image').files[0];

    let extraAttributesData = {};
    extraAttributes.forEach((attributeId, index) => {
        const attributeName = document.getElementById(`name-${attributeId}`).value; // Nombre del atributo
        const attributeValue = document.getElementById(`value-${attributeId}`).value; // Valor del atributo
        
        if (attributeName && attributeValue) {
            extraAttributesData[attributeName] = attributeValue; // Guardamos el nombre y valor como un par clave-valor
        }
    });

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('image', imageFile);

    Object.keys(extraAttributesData).forEach(key => {
        formData.append(key, extraAttributesData[key]); // Se agregan los atributos adicionales al FormData
    });

    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/api/items', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            alert('Producto agregado exitosamente');
            addProductToList(data.item);
            document.getElementById('product-form').reset();

            const extraAttributesContainer = document.getElementById('extra-attributes-container');
            if (extraAttributesContainer) {
                extraAttributesContainer.innerHTML = '';
            }

        } else {
            alert(data.message || 'Error al agregar producto');
        }
    } catch (error) {
        alert('Hubo un error al intentar agregar el producto: ' + error.message);
    }
});

verifyAdminAccess();