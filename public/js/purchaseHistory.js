document.addEventListener('DOMContentLoaded', async function () {
    const username = localStorage.getItem("myUsername");

    if (!username) {
        alert("Por favor, inicia sesión primero.");
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch(`/client/orders?username=${username}`);
        if (!response.ok) {
            throw new Error(`Error al obtener órdenes: ${response.statusText}`);
        }

        const orders = await response.json();

        const orderCountDiv = document.getElementById('purchase-count');
        const orderListDiv = document.getElementById('purchase-list');

        orderCountDiv.innerHTML = `<p>Has realizado ${orders.length} órdenes.</p>`;

        if (orders.length > 0) {
            const orderList = document.createElement('ul');
            orders.forEach(order => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <strong>Fecha:</strong> ${new Date(order.date).toLocaleString()} <br>
                    <strong>Productos:</strong>
                    <ul>
                        ${order.products.map(product => `<li>${product.productName} - Cantidad: ${product.quantity}</li>`).join('')}
                    </ul>
                `;
                orderList.appendChild(listItem);
            });
            orderListDiv.appendChild(orderList);
        } else {
            orderListDiv.innerHTML = '<p>No has realizado ninguna orden.</p>';
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
        alert('Error al obtener las órdenes. Por favor, inténtelo más tarde.');
    }
});
