# Features del Módulo de Productos

Este documento lista todas las características (features) implementadas en el módulo de productos (`ProductosPage.jsx`) y sus componentes asociados.

## 1. Vista Principal (`ProductosPage.jsx`)
- **Visualización de Productos:** Muestra un grid responsivo con las tarjetas de los productos.
- **Filtrado por Categorías:** Pestañas de categorías ("Todos" y categorías dinámicas) para filtrar los productos en tiempo real.
- **Navegación Intuitiva:** Funcionalidad "drag-to-scroll" (arrastrar para desplazar) horizontal en la barra de categorías.
- **Panel Lateral Deslizante:** Integración de un panel lateral animado para la creación y edición de productos, optimizando el espacio visual.
- **Manejo de Errores:** Banner de alertas integrado para mostrar errores en las operaciones al usuario y cerrarlos.
- **Contadores Dinámicos:** Muestra la cantidad total de productos para la categoría actualmente seleccionada a través de `CategoryDivider`.

## 2. Gestión de Categorías (`NewCategoryInput`, `EditableCategoryContent`, `CategoryActionButton`)
- **Modo de Edición:** Permite activar un "modo edición" para manipular las categorías en la misma vista.
- **Creación Inline:** Capacidad de agregar nuevas categorías ingresando nombre y seleccionando ícono en línea.
- **Edición Inline:** Posibilidad de modificar el nombre y el ícono de las categorías existentes.
- **Eliminación:** Borrado de categorías con manejo de estado (si se elimina la categoría activa, redirige a "Todos").

## 3. Tarjeta de Producto (`ProductCard.jsx`)
- **Información Visual:** Renderizado de imagen (o placeholder), nombre, precio formateado y un texto resumen de los modificadores asociados.
- **Estado de Disponibilidad:** Indicador visual (verde/rojo) que muestra si un producto está "Disponible" o "Agotado".
- **Menú de Acciones:** Menú desplegable (dropdown) que incluye botones para "Editar" o "Borrar" el producto.
- **Interacción Mejorada:** El dropdown se cierra automáticamente al hacer clic fuera del mismo.

## 4. Formulario de Producto (`ProductForm.tsx`)
- **Subida de Imágenes:** Componente `ImageUpload` para visualizar la imagen actual y cargar nuevas.
- **Campos Estructurados:** Entradas para el nombre, precio, categoría y unidades (pieza, litros).
- **Toggle de Disponibilidad:** Switch interactivo para marcar si el producto está disponible o no.
- **Selector Avanzado de Modificadores:** Un dropdown multiselect agrupado por categorías para asignar modificadores al producto. Permite seleccionar/deseleccionar modificadores individuales o todos los de una categoría en lote.
- **Validación de Datos:** Uso de esquemas de Zod (`productFormSchema`) para validar los datos antes de enviar.
- **Sincronización:** Actualización en tiempo real de los datos con el formulario al editar un producto existente.

## 5. Gestión de Modificadores (`ModificadoresModal.tsx`, `NuevoModificadorModal`)
- **Listado Completo:** Visualización de todos los modificadores disponibles en el sistema y sus configuraciones.
- **Reordenamiento Drag and Drop:** Uso de `dnd-kit` para arrastrar y cambiar el orden visual y de la base de datos de los modificadores.
- **Creación y Edición de Modificadores:** Opciones para crear y editar modificadores configurando sus reglas (mínimos, máximos, si son obligatorios) y su categoría.
- **Gestión de Opciones:** Creación, edición y eliminación (Sincronización) de las opciones específicas dentro de cada modificador (nombre y precio extra).

## 6. Lógica de Datos (`useProducts.ts`)
- **Estado Centralizado:** Mantenimiento del estado del catálogo (`catalog`), estado de carga (`loading`) y errores (`error`).
- **Operaciones CRUD completas:** Proveedor de funciones para agregar, actualizar y eliminar tanto productos como categorías.
- **Sincronización Automática:** Recarga (refresh) automático del catálogo tras cada modificación exitosa a través del backend (`productService`).
