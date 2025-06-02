-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jun 02, 2025 at 07:35 AM
-- Server version: 8.0.42
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ecommerce_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `carrito`
--

CREATE TABLE `carrito` (
  `id` int NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `producto_id` int DEFAULT NULL,
  `cantidad` int DEFAULT '1',
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categorias`
--

CREATE TABLE `categorias` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `activa` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`, `descripcion`, `activa`, `created_at`) VALUES
(1, 'Abrigos', 'Abrigos de paño, para el invierno', 1, '2025-06-02 07:26:43'),
(2, 'Chompas', 'Chompas de lana', 1, '2025-06-02 07:26:43'),
(3, 'Pantalones', 'pantalones sastreros', 1, '2025-06-02 07:26:43'),
(4, 'Zapatos', 'Zapatos formales', 1, '2025-06-02 07:26:43');

-- --------------------------------------------------------

--
-- Table structure for table `ordenes`
--

CREATE TABLE `ordenes` (
  `id` int NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `total` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','pagado','enviado','entregado','cancelado') DEFAULT 'pendiente',
  `direccion_envio` text,
  `metodo_pago` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orden_detalles`
--

CREATE TABLE `orden_detalles` (
  `id` int NOT NULL,
  `orden_id` int DEFAULT NULL,
  `producto_id` int DEFAULT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pagos`
--

CREATE TABLE `pagos` (
  `id` int NOT NULL,
  `orden_id` int DEFAULT NULL,
  `monto` decimal(10,2) NOT NULL,
  `metodo_pago` varchar(50) NOT NULL,
  `estado` enum('pendiente','completado','fallido','reembolsado') DEFAULT 'pendiente',
  `referencia_externa` varchar(100) DEFAULT NULL,
  `detalles_pago` json DEFAULT NULL,
  `fecha_pago` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `productos`
--

CREATE TABLE `productos` (
  `id` int NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text,
  `precio` decimal(10,2) NOT NULL,
  `stock` int DEFAULT '0',
  `categoria_id` int DEFAULT NULL,
  `imagen_principal` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `descripcion`, `precio`, `stock`, `categoria_id`, `imagen_principal`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Abrigo G\' major By Parkland - Plomo Oscuro XL', 'Abrigo de alta calidad con cuello desmontable. Talla XL, color plomo oscuro con forro liso negro. Código: ABR-M-XL-COR-17-25-001. Marca: G\' major By Parkland. Características: Cuello sacable, sin chaleco interior.', 299.90, 15, 1, 'uploads/productos/abrigo_gmajor_plomo_xl.jpg', 1, '2025-06-02 07:34:13', '2025-06-02 07:34:13'),
(2, 'Camisa Formal Blanca Slim Fit - Talla L', 'Camisa formal de corte slim fit. Talla L, color blanco clásico. Código: CAM-F-L-BLA-18-25-002. Marca: Elegance Pro. Características: Cuello italiano, puños ajustables, 100% algodón egipcio.', 89.90, 25, 2, 'uploads/productos/camisa_formal_blanca_l.jpg', 1, '2025-06-02 07:34:13', '2025-06-02 07:34:13'),
(3, 'Jean Azul Clásico Corte Recto - Talla 32', 'Jean de mezclilla azul clásico de corte recto. Talla 32, color azul índigo. Código: JEA-C-32-AZU-19-25-003. Marca: Urban Style. Características: 5 bolsillos, lavado stone wash, 98% algodón 2% elastano.', 129.90, 20, 3, 'uploads/productos/jean_azul_clasico_32.jpg', 1, '2025-06-02 07:34:13', '2025-06-02 07:34:13'),
(4, 'Polo Deportivo Dry-Fit Negro - Talla M', 'Polo deportivo con tecnología dry-fit. Talla M, color negro sólido. Código: POL-D-M-NEG-20-25-004. Marca: Athletic Pro. Características: Tela transpirable, cuello redondo, manga corta, logo bordado.', 45.90, 30, 4, 'uploads/productos/polo_deportivo_negro_m.jpg', 1, '2025-06-02 07:34:13', '2025-06-02 07:34:13'),
(5, 'Casaca de Cuero Marrón Vintage - Talla L', 'Casaca de cuero genuino estilo vintage. Talla L, color marrón café. Código: CAS-C-L-MAR-21-25-005. Marca: Leather Heritage. Características: Cuero genuino, forro de seda, 4 bolsillos, cierre central, cuello tipo motociclista.', 499.90, 8, 1, 'uploads/productos/casaca_cuero_marron_l.jpg', 1, '2025-06-02 07:34:13', '2025-06-02 07:34:13');

-- --------------------------------------------------------

--
-- Table structure for table `producto_imagenes`
--

CREATE TABLE `producto_imagenes` (
  `id` int NOT NULL,
  `producto_id` int DEFAULT NULL,
  `url_imagen` varchar(255) NOT NULL,
  `es_principal` tinyint(1) DEFAULT '0',
  `orden` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` text,
  `permisos` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `nombre`, `descripcion`, `permisos`, `created_at`) VALUES
(4, 'master', 'Master - Control total del sistema', '{\"ordenes\": [\"ver\", \"editar\", \"eliminar\"], \"reportes\": [\"ver\"], \"usuarios\": [\"crear\", \"editar\", \"eliminar\"], \"productos\": [\"crear\", \"editar\", \"eliminar\"], \"configuracion\": [\"editar\"]}', '2025-06-02 07:30:24'),
(5, 'admin', 'Administrador del sistema', '{\"ordenes\": [\"ver\", \"editar\"], \"reportes\": [\"ver\"], \"usuarios\": [\"crear\", \"editar\"], \"productos\": [\"crear\", \"editar\", \"eliminar\"]}', '2025-06-02 07:30:24'),
(6, 'entregador', 'Entregador de pedidos', '{\"rutas\": [\"ver\"], \"ordenes\": [\"ver\", \"actualizar_estado\"], \"entregas\": [\"confirmar\"]}', '2025-06-02 07:30:24'),
(7, 'cliente', 'Cliente regular', '{\"perfil\": [\"ver\", \"editar\"], \"carrito\": [\"gestionar\"], \"ordenes\": [\"ver\"]}', '2025-06-02 07:30:24');

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` text,
  `rol_id` int DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `telefono`, `direccion`, `rol_id`, `activo`, `created_at`, `updated_at`) VALUES
(5, 'Rolando', 'master@tiendaropa.com', '10033657', '70038370', 'Av. Principal 123, La paz', 4, 1, '2025-06-02 07:33:46', '2025-06-02 07:33:46'),
(6, 'Gabriel', 'admin@tiendaropa.com', '2222', '987654322', 'Jr. Comercio 456, El alto', 5, 1, '2025-06-02 07:33:46', '2025-06-02 07:33:46'),
(7, 'Yerko', 'entregador@tiendaropa.com', '3333', '987654323', 'Av. Delivery 789, Callao', 6, 1, '2025-06-02 07:33:46', '2025-06-02 07:33:46'),
(8, 'Carlos', 'cliente@gmail.com', '4444', '987654324', 'Calle Los Rosales 321, San Isidro', 7, 1, '2025-06-02 07:33:46', '2025-06-02 07:33:46');

-- --------------------------------------------------------

--
-- Stand-in structure for view `vista_ordenes_completa`
-- (See below for the actual view)
--
CREATE TABLE `vista_ordenes_completa` (
`created_at` timestamp
,`estado` enum('pendiente','pagado','enviado','entregado','cancelado')
,`id` int
,`total` decimal(10,2)
,`total_items` bigint
,`usuario_email` varchar(100)
,`usuario_id` int
,`usuario_nombre` varchar(100)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vista_productos_completa`
-- (See below for the actual view)
--
CREATE TABLE `vista_productos_completa` (
`activo` tinyint(1)
,`categoria` varchar(100)
,`created_at` timestamp
,`descripcion` text
,`id` int
,`imagen_principal` varchar(255)
,`nombre` varchar(200)
,`precio` decimal(10,2)
,`stock` int
);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `carrito`
--
ALTER TABLE `carrito`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_product` (`usuario_id`,`producto_id`),
  ADD KEY `fk_carrito_producto` (`producto_id`),
  ADD KEY `idx_carrito_usuario` (`usuario_id`);

--
-- Indexes for table `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ordenes`
--
ALTER TABLE `ordenes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ordenes_usuario` (`usuario_id`),
  ADD KEY `idx_ordenes_estado` (`estado`);

--
-- Indexes for table `orden_detalles`
--
ALTER TABLE `orden_detalles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_orden_detalles_orden` (`orden_id`),
  ADD KEY `fk_orden_detalles_producto` (`producto_id`);

--
-- Indexes for table `pagos`
--
ALTER TABLE `pagos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pagos_orden` (`orden_id`);

--
-- Indexes for table `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_productos_categoria` (`categoria_id`),
  ADD KEY `idx_productos_activo` (`activo`);

--
-- Indexes for table `producto_imagenes`
--
ALTER TABLE `producto_imagenes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_producto_imagenes_producto` (`producto_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_usuarios_rol` (`rol_id`),
  ADD KEY `idx_usuarios_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `carrito`
--
ALTER TABLE `carrito`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `ordenes`
--
ALTER TABLE `ordenes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orden_detalles`
--
ALTER TABLE `orden_detalles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pagos`
--
ALTER TABLE `pagos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `producto_imagenes`
--
ALTER TABLE `producto_imagenes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

-- --------------------------------------------------------

--
-- Structure for view `vista_ordenes_completa`
--
DROP TABLE IF EXISTS `vista_ordenes_completa`;

CREATE ALGORITHM=UNDEFINED DEFINER=`admin`@`%` SQL SECURITY DEFINER VIEW `vista_ordenes_completa`  AS SELECT `o`.`id` AS `id`, `o`.`usuario_id` AS `usuario_id`, `u`.`nombre` AS `usuario_nombre`, `u`.`email` AS `usuario_email`, `o`.`total` AS `total`, `o`.`estado` AS `estado`, `o`.`created_at` AS `created_at`, count(`od`.`id`) AS `total_items` FROM ((`ordenes` `o` join `usuarios` `u` on((`o`.`usuario_id` = `u`.`id`))) left join `orden_detalles` `od` on((`o`.`id` = `od`.`orden_id`))) GROUP BY `o`.`id`, `o`.`usuario_id`, `u`.`nombre`, `u`.`email`, `o`.`total`, `o`.`estado`, `o`.`created_at` ;

-- --------------------------------------------------------

--
-- Structure for view `vista_productos_completa`
--
DROP TABLE IF EXISTS `vista_productos_completa`;

CREATE ALGORITHM=UNDEFINED DEFINER=`admin`@`%` SQL SECURITY DEFINER VIEW `vista_productos_completa`  AS SELECT `p`.`id` AS `id`, `p`.`nombre` AS `nombre`, `p`.`descripcion` AS `descripcion`, `p`.`precio` AS `precio`, `p`.`stock` AS `stock`, `p`.`imagen_principal` AS `imagen_principal`, `c`.`nombre` AS `categoria`, `p`.`activo` AS `activo`, `p`.`created_at` AS `created_at` FROM (`productos` `p` left join `categorias` `c` on((`p`.`categoria_id` = `c`.`id`))) WHERE (`p`.`activo` = true) ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `carrito`
--
ALTER TABLE `carrito`
  ADD CONSTRAINT `fk_carrito_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_carrito_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ordenes`
--
ALTER TABLE `ordenes`
  ADD CONSTRAINT `fk_ordenes_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Constraints for table `orden_detalles`
--
ALTER TABLE `orden_detalles`
  ADD CONSTRAINT `fk_orden_detalles_orden` FOREIGN KEY (`orden_id`) REFERENCES `ordenes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_orden_detalles_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);

--
-- Constraints for table `pagos`
--
ALTER TABLE `pagos`
  ADD CONSTRAINT `fk_pagos_orden` FOREIGN KEY (`orden_id`) REFERENCES `ordenes` (`id`);

--
-- Constraints for table `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `fk_productos_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`);

--
-- Constraints for table `producto_imagenes`
--
ALTER TABLE `producto_imagenes`
  ADD CONSTRAINT `fk_producto_imagenes_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
