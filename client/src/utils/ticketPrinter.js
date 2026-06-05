// Archivo: src/utils/ticketPrinter.js

export const imprimirTicket = (items, total, numeroOrden = "Mostrador") => {
    if (!items || items.length === 0) {
        alert("No hay productos para imprimir.");
        return;
    }

    const fecha = new Date().toLocaleString('es-MX');

    // Mapeamos los productos (soporta el formato del carrito o el de la BD)
    const itemsHTML = items.map(item => {
        const nombre = item.product?.name || item.nombre || "Producto";
        const cantidad = item.quantity || item.cantidad || 1;
        // Calculamos el precio según lo que traiga el objeto
        const precioTotal = item.precio_total || (item.product?.price * cantidad) || 0;

        return `
        <div class="item">
            <span>${cantidad}x ${nombre}</span>
            <span>$${Number(precioTotal).toFixed(2)}</span>
        </div>
        `;
    }).join('');

    const ticketHTML = `
      <html>
        <head>
          <title>Ticket Orden #${numeroOrden}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 80mm; margin: 0; padding: 10px; color: black; font-size: 14px; }
            h2 { text-align: center; margin-bottom: 5px; font-size: 18px; }
            p { text-align: center; margin: 2px 0; font-size: 12px; }
            .divider { border-bottom: 1px dashed black; margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h2>Taquería Delgado</h2>
          <p>León, Gto.</p>
          <p>Fecha: ${fecha}</p>
          <p><strong>Orden #${numeroOrden}</strong></p>
          <div class="divider"></div>
          ${itemsHTML}
          <div class="divider"></div>
          <div class="total-row">
            <span>TOTAL:</span>
            <span>$${Number(total).toFixed(2)}</span>
          </div>
          <p style="margin-top: 20px;">¡Gracias por su preferencia!</p>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write(ticketHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
};