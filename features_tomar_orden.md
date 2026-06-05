# Features del Módulo "Tomar Orden" (`TomarOrdenPage.jsx`)

A continuación se detalla la lista de características (features) y funcionalidades implementadas en la página `TomarOrdenPage.jsx` y sus componentes asociados.

## 1. Menú y Navegación de Productos
* **Filtros por Categoría**: Visualización de categorías del menú mediante un sistema de pestañas deslizables horizontales (`TabGroup`, `Tab`).
* **Categoría General "Todos"**: Opción fija al inicio de las pestañas para visualizar el catálogo completo sin filtros.
* **Filtrado Dinámico**: Renderizado en tiempo real del grid de productos de acuerdo a la categoría seleccionada por el usuario.
* **Indicadores de Estado**: Muestra de pantallas de carga ("Cargando menú...") y manejo de errores provenientes del servidor al cargar el catálogo de productos.

## 2. Visualización de Productos (`MenuProductCard`)
* **Grilla Responsiva**: Adaptación de columnas (2 en móviles/tablets, 3 en pantallas grandes) para mostrar las tarjetas de producto.
* **Detalle Rápido**: Cada tarjeta muestra la imagen del producto (con fallback si no tiene imagen), nombre (truncado si es muy largo) y el precio formateado.
* **Interacción Rápida**: Al dar clic sobre una tarjeta, se abre inmediatamente el modal de personalización del producto.

## 3. Personalización del Producto antes de Ordenar (`ProductOptionsModal`)
* **Vista Detalle**: Modal superpuesto que muestra la imagen, nombre y precio base del producto a personalizar.
* **Selección de Modificadores (Opciones)**: Interfaz para elegir variantes o modificadores del producto:
  * **Categorías con restricciones**: Por ejemplo, "Carne" con validaciones de mínimo/máximo de opciones a elegir.
  * **Opciones con recargo extra**: Identificación visual de opciones que suman un costo al producto base (ej. *Tripa +$2.00*).
  * **Categorías de selección múltiple / opcionales**: Posibilidad de elegir varios elementos sin límite (ej. "Salsa", "Verdura").
* **Control de Cantidades**: Botones `+` y `-` para definir cuántas unidades de ese producto con esas opciones específicas se quieren agregar.
* **Previsualización de Total**: Botón de "Añadir a la orden" que muestra el total calculado en tiempo real basado en el precio y la cantidad seleccionada.
* **Validación de Datos (Frontend)**: Uso de `orderItemClientSchema` para validar la selección del usuario e impedir que se agreguen productos con opciones incorrectas al carrito (muestra alerta en caso de error).
* **Limpieza de Estado**: Restablecimiento automático de las selecciones y cantidad al cerrar el modal o al agregar exitosamente el producto.

## 4. Gestión del Carrito (Panel Derecho de la Orden)
* **Visualización del Estado Actual**: Lista detallada de los ítems actualmente agregados a la orden (o mensaje de "No hay productos en la orden" si está vacío).
* **Detalle Individual por Ítem**:
  * Nombre del producto, imagen en miniatura y precio base calculado (`calculateItemBasePrice`).
  * Subtotal por ítem considerando opciones extra y cantidad (`calculateItemTotal`).
  * Desglose visual mediante etiquetas ("pills") de todos los modificadores/opciones seleccionadas para ese ítem.
* **Controladores en Carrito**:
  * Botones `+` y `-` independientes para actualizar la cantidad de un ítem ya agregado.
  * Botón de eliminación (icono de papelera) para quitar por completo un ítem del carrito.
* **Resumen de la Orden**: Cálculo del total final acumulado de todos los ítems.
* **Acciones Principales**:
  * **Cancelar Orden**: Botón para limpiar el carrito (requiere confirmación del usuario mediante un `window.confirm`).
  * **Cobrar / Crear Orden**: Botón que procesa la orden comunicándose con el backend (`useOrders.createOrder`) indicando tipo "mostrador". 
  * **Estados de Acción**: Deshabilitación de botones si el carrito está vacío o mientras la orden está siendo procesada ("COBRANDO...").
  * **Notificaciones**: Avisos (`alert`) informando el éxito de la creación de la orden o cualquier error devuelto por el servidor.

## 5. Integración con Hooks / Gestión de Estado Global
* **`useProducts`**: Encargado de traer el `catalog`, manejando los estados de `loading` y `error`.
* **`useOrders`**: Encargado de enviar la información estructurada a la API mediante la función `createOrder` y gestionar su propio estado de carga (`isCreatingOrder`).
* **`useCart`**: Gestor de estado que concentra la lógica de negocio del carrito (`orderItems`, `total`, `addItem`, `removeItem`, `updateItemQuantity`, `clearCart`, etc.).
