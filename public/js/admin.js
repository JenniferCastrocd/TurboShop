document.addEventListener('DOMContentLoaded', function () {
    const productForm = document.getElementById('product-form');

    productForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const productData = {
            name: document.getElementById('name').value.trim(),
            description: document.getElementById('description').value.trim(),
            price: parseFloat(document.getElementById('price').value),
            quantity: parseInt(document.getElementById('quantity').value, 10),
        };

        console.log('Datos del producto a enviar:', productData);

        try {
            const response = await fetch('/admin/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            const data = await response.json();
            console.log('Respuesta del servidor:', data);

            if (data.success) {
                alert('Producto agregado con éxito');
                productForm.reset();
            } else {
                alert('Error al agregar producto: ' + data.message);
            }
        } catch (error) {
            console.error('Error al agregar el producto:', error);
            alert('Error al conectar con el servidor');
        }
    });
});

