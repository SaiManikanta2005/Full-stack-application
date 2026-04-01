const ordersTableBody = document.querySelector('#ordersTable tbody');
const highestDiv = document.getElementById('highest');
const activeDiv = document.getElementById('active');

function loadOrders() {
    fetch('http://localhost:3000/orders')
        .then(res => res.json())
        .then(data => {
            ordersTableBody.innerHTML = '';
            data.forEach(order => {
                const row = `
                    <tr>
                        <td>${order.customer}</td>
                        <td>${order.product}</td>
                        <td>${order.quantity}</td>
                        <td>${order.price}</td>
                        <td>${order.total_amount}</td>
                        <td>${new Date(order.order_date).toLocaleDateString()}</td>
                    </tr>
                `;
                ordersTableBody.innerHTML += row;
            });
        });
}

function loadHighestOrder() {
    fetch('http://localhost:3000/highest-order')
        .then(res => res.json())
        .then(data => {
            if (data.length > 0) {
                const order = data[0];
                highestDiv.innerHTML = `
                    <p><strong>Customer:</strong> ${order.name}</p>
                    <p><strong>Product:</strong> ${order.product}</p>
                    <p><strong>Total Amount:</strong> $${order.total_amount}</p>
                `;
            }
        });
}

function loadMostActiveCustomer() {
    fetch('http://localhost:3000/most-active')
        .then(res => res.json())
        .then(data => {
            if (data.length > 0) {
                activeDiv.innerHTML = `
                    <p><strong>${data[0].name}</strong></p>
                `;
            }
        });
}

loadOrders();
loadHighestOrder();
loadMostActiveCustomer();