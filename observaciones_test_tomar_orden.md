# Reporte de Pruebas: Módulo "Tomar Orden"

Se realizaron pruebas exhaustivas sobre las features implementadas en la página `http://localhost:5173/tomar-orden`. A continuación se registilan las observaciones y fallos detectados:

### 1. Categorización de Productos
*   **Error en "Bebidas":** Al filtrar por la categoría "Bebidas", se incluye erróneamente el producto "Pay de Limon" (postre).
*   **Error en "Postres":** Al filtrar por la categoría "Postres", la lista se muestra completamente vacía (no aparece el "Pay de Limon").

### 2. Personalización en Modal (Límites y Validaciones)
*   **Falta de Validación Visual:** En la categoría "Carne" se indica un límite de "Mín 1 / Max 2", pero la interfaz permite seleccionar más de dos opciones simultáneamente (ej. Bistec, Chorizo, Pastor y Tripa) sin bloquear la selección.
*   **Fallo al Añadir con Exceso de Opciones:** Si el usuario intenta agregar un producto excediendo los límites (ej. con 4 carnes seleccionadas), la validación interna lo rechaza, pero **no se muestra ningún mensaje de error ni retroalimentación visual**, dejando la interfaz congelada en el modal (el botón no hace nada).

### 3. Precios y Recargos
*   **Recargos no reflejados:** Al seleccionar modificadores que tienen costo extra (como "Tripa +$2.00"), el precio mostrado en el botón "Añadir a la orden" no se actualiza, manteniéndose en el precio base ($17.00). Al agregarlo al carrito, el recargo tampoco se suma al total.

### 4. Lógica de Productos Especiales (Bebidas)
*   **Opciones incoherentes para bebidas:** El producto "Agua de sabor" abre el mismo modal de personalización que un taco, mostrando opciones de "Carne", "Salsa" y "Verdura". Esto permite agregar una bebida con la opción de "Bistec".

### 5. Flujo de Cobro / Creación de Orden
*   **Ausencia de Modal de Pago:** Al presionar "COBRAR" teniendo productos en el carrito, la orden se envía y la pantalla se limpia, pero **no aparece el modal esperado para confirmar el pago** o seleccionar un método (Efectivo/Tarjeta). La orden pasa directamente a estado pendiente.
*   El botón de "Cobrar" funciona (se muestra alerta nativa y limpia el carrito), pero omite el flujo UX deseado para un punto de venta real.

### 6. Otros Hallazgos
*   La funcionalidad de agregar cantidades (+ y -), así como la eliminación de productos del carrito individualmente (icono basurero) o la cancelación global (botón "CANCELAR"), **funcionan correctamente**.
*   Se observó que la vista de "Ventas" (navegando desde el menú inferior) no está implementada (solo muestra texto de relleno).

---
**Conclusión General:** El flujo principal o *happy path* de agregar al carrito y cobrar funciona en un nivel muy básico, pero existen fallos críticos de UX/UI en el control del modal (silencio en errores de validación, recargos no reflejados, asignación de opciones genéricas a todos los productos) y en la falta del paso de pago antes de confirmar la orden.
