document.addEventListener('DOMContentLoaded', async function () {
    const username = localStorage.getItem("myUsername");

    if (!username) {
        alert("Por favor, inicia sesión primero.");
        window.location.href = '/login.html'; // Redirige a la página de inicio de sesión si no hay usuario
        return;
    }

    try {
        const response = await fetch('/client/purchases?username=' + username);
        const purchases = await response.json();

        const purchaseCountDiv = document.getElementById('purchase-count');
        const purchaseListDiv = document.getElementById('purchase-list');

        // Mostrar el número de compras
        purchaseCountDiv.innerHTML = `<p>Has realizado ${purchases.length} compras.</p>`;

        // Mostrar la lista de compras
        if (purchases.length > 0) {
            const purchaseList = document.createElement('ul');
            purchases.forEach(purchase => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <strong>Fecha:</strong> ${new Date(purchase.date).toLocaleString()} <br>
                    <strong>Productos:</strong>
                    <ul>
                        ${purchase.products.map(product => `<li>${product.productName} - Cantidad: ${product.productQuantity}</li>`).join('')}
                    </ul>
                `;
                purchaseList.appendChild(listItem);
            });
            purchaseListDiv.appendChild(purchaseList);
        } else {
            purchaseListDiv.innerHTML = '<p>No has realizado ninguna compra.</p>';
        }
    } catch (error) {
        console.error('Error fetching purchases:', error);
        alert('Error al obtener las compras. Por favor, inténtelo de nuevo más tarde.');
    }
});
