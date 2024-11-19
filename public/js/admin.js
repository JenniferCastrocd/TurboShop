document.addEventListener('DOMContentLoaded', function() {
    const productForm = document.getElementById('product-form');

    productForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const productData = {
            name: document.getElementById('name').value,
            description: document.getElementById('description').value,
            price: document.getElementById('price').value,
            quantity: document.getElementById('quantity').value
        };

        console.log('Product data to be sent:', productData);  // Añadir log para ver los datos enviados

        fetch('/admin/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Response from server:', data);  // Añadir log para ver la respuesta del servidor
            if (data.success) {
                alert('Producto agregado con éxito');
                productForm.reset() 
            } else {
                alert('Error al agregar producto');
            }
        })
        .catch(error => console.error('Error:', error));
    });
});
