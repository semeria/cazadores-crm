# Interfaz de usuario

**Resumen:** La UI es una SPA multipágina servida con React e Inertia, con una plantilla Blade raíz. Las páginas por módulo comparten layout autenticado y componentes UI; los textos visibles están principalmente en español.

## Índice

- [Arranque y navegación](#arranque-y-navegación)
- [Páginas](#páginas)
- [Componentes](#componentes)
- [Diseño y comportamiento](#diseño-y-comportamiento)
- [Dependencias visuales](#dependencias-visuales)
- [Pendientes de documentar](#pendientes-de-documentar)

## Arranque y navegación

`resources/views/app.blade.php` incluye Vite y `@inertia`. `resources/js/app.jsx` crea la aplicación Inertia y resuelve `./Pages/${name}.jsx`. Las acciones de formulario usan `useForm`; navegación y acciones REST usan `Link`/`router` donde corresponde.

## Páginas

- `Auth/Login.jsx` y `Auth/Register.jsx`: acceso y alta.
- `Dashboard.jsx`: panel operativo por rol con filtros temporales, indicadores, estado, avance y fechas límite.
- `Activities/Index.jsx`: vista de lista y filtros.
- `Activities/Kanban.jsx`: tablero por estados, reordenamiento drag-and-drop y formulario de actividad.
- `Team/Index.jsx`: gestión unificada de usuarios member y agent, con filtros por rol, edición, alta y restablecimiento de contraseña.
- `Quotes/Index.jsx`, `Create.jsx`, `Edit.jsx`, `Show.jsx` y `Settings/Edit.jsx`: lista con acciones, formulario, detalle y ajustes de cotizaciones.
- `Components/Quotes/ClientPicker.jsx`: búsqueda de clientes existentes de la organización y selección para una cotización.
- `Agents/` y `Members/`: páginas de los flujos previos, conservadas para las rutas existentes.

## Componentes

- `Layouts/AuthenticatedLayout.jsx`: layout autenticado, barra móvil y estado del modo oscuro.
- `Components/PlatformAdminHeader.jsx`: encabezado superior, navegación de plataforma, tema y sesión para superadministración.
- `Components/Sidebar/Sidebar.jsx`: compone el menú lateral, el encabezado de marca, navegación por rol y menú de usuario.
- `Components/Sidebar/SidebarBrand.jsx`, `SidebarNavigation.jsx` y `SidebarNavItem.jsx`: marca expandida/compacta, controles explícitos para expandir/buscar, filtro local de enlaces, grupos y estados activos.
- `Components/Sidebar/SidebarUserMenu.jsx`: usuario autenticado, rol, alternador de tema y cierre de sesión.
- `Pages/SuperAdmin/Organizations/`, `Plans/`, `Coupons/`, `Payments/`, `Subscriptions/` y `BillingSettings/`: control SaaS, catálogo, reporte de pagos/suscripciones/canjes, aprobación manual e instrucciones de transferencia; acceso limitado al superadministrador.
- `Pages/Subscription/Index.jsx`: planes visibles, solicitud del owner, estado de suscripción, transferencia pendiente, periodo de gracia e historial.
- `Components/Transitions/PageTransition.jsx` y `ModalTransition.jsx`: transiciones reutilizables de navegación y diálogos.
- `Components/UI/`: `Button`, `Input`, `Card`, `Badge`.
- `Components/Activities/CommentTimeline.jsx`: presentación y envío de comentarios.
- `Components/Dashboard/KpiCard.jsx`: tarjeta de indicador.
- `Components/Dashboard/DashboardFilters.jsx`, `ActivityStatusSummary.jsx`, `CompletionProgressCard.jsx` y `UpcomingActivities.jsx`: filtros y secciones del panel.
- `Pages/Quotes/Form.jsx`: formulario compartido de alta/edición, conceptos, moneda, descuento, IVA y resumen.

## Diseño y comportamiento

El login presenta la tarjeta de acceso con una entrada corta de opacidad y desplazamiento vertical; respeta `prefers-reduced-motion`.

El superadministrador usa un encabezado superior propio con marca, acceso a Organizaciones, Planes, Cupones, Pagos, Suscripciones y Ajustes, tema y menú de cuenta; sustituye el sidebar solo para ese perfil. El reporte de Suscripciones filtra pagos aprobados, cupones, pruebas y estados, y permite exportar CSV. El conteo de canjes del catálogo de cupones abre el reporte filtrado por código. Si la organización no tiene acceso por suscripción, el sidebar tenant muestra sus módulos atenuados con candado y los dirige a Suscripción al seleccionarlos; el enlace Suscripción permanece disponible y solo el owner puede solicitar un plan. Acceso heredado, suscripción activa o periodo de gracia mantienen los módulos desbloqueados.

Tailwind CSS 4 se configura en `resources/css/app.css`; los tokens `brand` y `surface` definen colores, y la variante `dark` se activa por clase. Motion añade transiciones breves de entrada/salida entre rutas y en los modales de Kanban y vista previa PDF; respeta la preferencia del sistema de movimiento reducido y no anima las tarjetas arrastrables. El layout persiste la selección de tema en `localStorage` y considera la preferencia del sistema al inicializar. El sidebar expande y contrae su ancho en escritorio, conserva la preferencia en `localStorage` y muestra tooltips con etiquetas cuando está compacto. En móvil abre como drawer, cierra por navegación, overlay o Escape y mantiene el foco dentro. La marca conserva JaegerSystem y muestra `JS` al contraerse. El pie identifica al usuario autenticado con iniciales, nombre, correo y rol; su menú permite cambiar el tema o cerrar sesión. La búsqueda filtra los enlaces disponibles para el rol actual. El módulo Cotizaciones permite buscar y seleccionar clientes de la organización o guardar un destinatario como cliente reutilizable al guardar la cotización; si su correo ya existe, se invita a seleccionar el cliente encontrado. También permite capturar moneda MXN/USD, folio automático/personalizado, descuento porcentual/fijo e IVA; muestra importes calculados por el servidor en una vista web. El listado y el detalle ofrecen edición y eliminación con confirmación; eliminar borra permanentemente la cotización y sus conceptos. El detalle abre una vista previa embebida del PDF con opción para descargarlo; el PDF incluye el logo vigente y un pie `Powered by JaegerSystem`. El owner dispone de ajustes de prefijo, padding y logo vigente. Los agentes ven `Mi Kanban`; todos los roles ven Cotizaciones; owner y member ven panel y Kanban, y el owner además ve Equipo. El Kanban usa columnas `pending`, `in_progress`, `in_review`, `completed` y `cancelled`. Las tarjetas muestran la fecha límite; las actividades abiertas con fecha anterior al día local se resaltan como vencidas, mientras las que vencen hoy reciben una marca ámbar. Completadas y canceladas no se marcan como vencidas.

En el Dashboard, los conteos por estado y la distribución por usuario respetan el periodo seleccionado. El KPI de vencidas muestra el backlog abierto vencido actual, independientemente del rango de fechas.

## Dependencias visuales

- `@inertiajs/react` para integración y navegación.
- `lucide-react` para iconos SVG del sidebar.
- `motion` para animaciones ligeras de página y modal.
- `@hello-pangea/dnd` para drag-and-drop.
- Recharts para gráficos.
- Tailwind CSS y plugin forms para estilos y controles.
- Axios para solicitud PUT JSON de ordenamiento.

## Pendientes de documentar

- Sistema de diseño formal, accesibilidad auditada y pruebas visuales: **Pendiente de documentar**.
- Diseño de UI fuera de las páginas listadas: **Pendiente de documentar**.
