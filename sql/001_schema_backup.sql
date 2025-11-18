-- =========================
-- 1) TABLAS BASE
-- =========================

-- === Categoría ===
CREATE TABLE IF NOT EXISTS categoria (
  id_categoria   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre         VARCHAR(120) UNIQUE NOT NULL
);

-- === Usuario (roles) ===
CREATE TABLE IF NOT EXISTS usuario (
  id_usuario BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre     VARCHAR(120),
  rol        VARCHAR(12) CHECK (rol IN ('ADMIN','EMPLEADO'))
);

-- Endurecer usuario (si ya existía, aplicará los cambios)
ALTER TABLE usuario
  ALTER COLUMN nombre SET NOT NULL;

ALTER TABLE usuario
  ALTER COLUMN rol SET NOT NULL,
  ALTER COLUMN rol SET DEFAULT 'EMPLEADO',
  DROP CONSTRAINT IF EXISTS usuario_rol_check,
  ADD  CONSTRAINT usuario_rol_check CHECK (rol IN ('ADMIN','EMPLEADO'));

-- Índice útil si consultas por nombre
CREATE INDEX IF NOT EXISTS idx_usuario_nombre ON usuario(nombre);

-- === Proveedor ===
CREATE TABLE IF NOT EXISTS proveedor (
  id_proveedor   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  razon_social   VARCHAR(200) NOT NULL,
  contacto       VARCHAR(120),
  telefono       VARCHAR(40),
  email          VARCHAR(160)
);

-- === Producto ===
CREATE TABLE IF NOT EXISTS producto (
  id_producto    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cod_producto   VARCHAR(50) UNIQUE,
  nombre         VARCHAR(200) NOT NULL,
  id_categoria   BIGINT NOT NULL REFERENCES categoria(id_categoria),
  umbral_stock   INT NOT NULL DEFAULT 0,
  estado         VARCHAR(10) NOT NULL DEFAULT 'ACT'  -- ACT / INA
);

-- Reglas de FK explícitas y estado controlado
ALTER TABLE producto
  DROP CONSTRAINT IF EXISTS producto_id_categoria_fkey,
  ADD  CONSTRAINT producto_id_categoria_fkey
  FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
  ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE producto
  DROP CONSTRAINT IF EXISTS uq_producto_cod,
  ADD CONSTRAINT uq_producto_cod UNIQUE (cod_producto);


ALTER TABLE producto
  DROP CONSTRAINT IF EXISTS ck_producto_estado,
  ADD  CONSTRAINT ck_producto_estado CHECK (estado IN ('ACT','INA'));

-- === Compra (cabecera) ===
CREATE TABLE IF NOT EXISTS compra (
  id_compra        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_proveedor     BIGINT NOT NULL REFERENCES proveedor(id_proveedor),
  fecha_compra     DATE NOT NULL,
  total            DECIMAL(12,2) NOT NULL CHECK (total >= 0),
  usuario_registra VARCHAR(120)   -- se depreca a favor de id_usuario_registra
);

-- Asegurar FK de proveedor con reglas seguras
ALTER TABLE compra
  DROP CONSTRAINT IF EXISTS compra_id_proveedor_fkey,
  ADD  CONSTRAINT compra_id_proveedor_fkey
  FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor)
  ON UPDATE CASCADE ON DELETE RESTRICT;

-- Columna nueva para FK a usuario.id_usuario (si no existe)
ALTER TABLE compra
  ADD COLUMN IF NOT EXISTS id_usuario_registra BIGINT;

-- Ajustar FK de usuario (si existía la anterior por nombre, se elimina)
ALTER TABLE compra
  DROP CONSTRAINT IF EXISTS compra_usuario_fk;

ALTER TABLE compra
  ADD CONSTRAINT compra_usuario_fk
  FOREIGN KEY (id_usuario_registra) REFERENCES usuario(id_usuario)
  ON UPDATE CASCADE ON DELETE SET NULL;

-- === Detalle de Compra ===
CREATE TABLE IF NOT EXISTS detalle_compra (
  id_detalle     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_compra      BIGINT NOT NULL REFERENCES compra(id_compra),
  id_producto    BIGINT NOT NULL REFERENCES producto(id_producto),
  cantidad       INT NOT NULL CHECK (cantidad > 0),
  costo_unitario DECIMAL(12,2) NOT NULL CHECK (costo_unitario >= 0)
);

-- Reglas de FK de detalle (CASCADE en compra, RESTRICT en producto)
ALTER TABLE detalle_compra
  DROP CONSTRAINT IF EXISTS detalle_compra_id_compra_fkey,
  ADD  CONSTRAINT detalle_compra_id_compra_fkey
  FOREIGN KEY (id_compra) REFERENCES compra(id_compra)
  ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE detalle_compra
  DROP CONSTRAINT IF EXISTS detalle_compra_id_producto_fkey,
  ADD  CONSTRAINT detalle_compra_id_producto_fkey
  FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
  ON UPDATE CASCADE ON DELETE RESTRICT;

-- === Lote ===
CREATE TABLE IF NOT EXISTS lote (
  id_lote      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_producto  BIGINT NOT NULL REFERENCES producto(id_producto),
  id_compra    BIGINT NOT NULL REFERENCES compra(id_compra),
  fecha_venc   DATE NOT NULL,
  stock_lote   INT  NOT NULL CHECK (stock_lote >= 0)
);

ALTER TABLE lote
  DROP CONSTRAINT IF EXISTS lote_id_producto_fkey,
  ADD  CONSTRAINT lote_id_producto_fkey
  FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
  ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE lote
  DROP CONSTRAINT IF EXISTS lote_id_compra_fkey,
  ADD  CONSTRAINT lote_id_compra_fkey
  FOREIGN KEY (id_compra) REFERENCES compra(id_compra)
  ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE lote
  DROP CONSTRAINT IF EXISTS uq_lote,
  ADD CONSTRAINT uq_lote UNIQUE (id_producto, id_compra, fecha_venc);

-- === Ajuste de Lote (trazabilidad) ===
CREATE TABLE IF NOT EXISTS ajuste_lote (
  id_ajuste   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_lote     BIGINT NOT NULL REFERENCES lote(id_lote) ON DELETE CASCADE,
  delta       INT    NOT NULL,                 -- +entra / -sale
  motivo      VARCHAR(200) NOT NULL,
  usuario     VARCHAR(120),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- 2) ÍNDICES
-- =========================

-- Producto
CREATE INDEX IF NOT EXISTS idx_producto_nombre    ON producto(nombre);
CREATE INDEX IF NOT EXISTS idx_prod_categoria     ON producto(id_categoria);

-- Compra
CREATE INDEX IF NOT EXISTS idx_compra_proveedor   ON compra(id_proveedor);

-- Detalle
CREATE INDEX IF NOT EXISTS idx_detalle_compra_compra ON detalle_compra(id_compra);
CREATE INDEX IF NOT EXISTS idx_detalle_producto_fk   ON detalle_compra(id_producto);

-- Lote
CREATE INDEX IF NOT EXISTS idx_lote_fecha_venc    ON lote(fecha_venc);
CREATE INDEX IF NOT EXISTS idx_lote_producto_venc ON lote(id_producto, fecha_venc);

-- Limpieza de posibles duplicados anteriores
DROP INDEX IF EXISTS idx_prod_nombre;
DROP INDEX IF EXISTS idx_detalle_compra_fk;

-- =========================
-- 3) VISTAS PARA DASHBOARD
-- =========================

-- Stock total por producto + estado (OK/BAJO)
CREATE OR REPLACE VIEW v_stock_producto AS
SELECT p.id_producto,
       p.cod_producto,
       p.nombre,
       COALESCE(SUM(l.stock_lote),0) AS stock_total,
       p.umbral_stock,
       CASE
         WHEN COALESCE(SUM(l.stock_lote),0) < p.umbral_stock THEN 'BAJO'
         ELSE 'OK'
       END AS estado
FROM producto p
LEFT JOIN lote l ON l.id_producto = p.id_producto
GROUP BY p.id_producto, p.cod_producto, p.nombre, p.umbral_stock;

-- Lotes por vencer (30 días)
CREATE OR REPLACE VIEW v_lotes_por_vencer AS
SELECT l.*,
       p.cod_producto,
       p.nombre AS producto
FROM lote l
JOIN producto p ON p.id_producto = l.id_producto
WHERE l.fecha_venc BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days';

-- Lotes vencidos
CREATE OR REPLACE VIEW v_lotes_vencidos AS
SELECT l.*,
       p.cod_producto,
       p.nombre AS producto
FROM lote l
JOIN producto p ON p.id_producto = l.id_producto
WHERE l.fecha_venc < CURRENT_DATE;

ALTER TABLE ajuste_lote
  DROP COLUMN usuario,
  ADD COLUMN id_usuario BIGINT REFERENCES usuario(id_usuario)
    ON UPDATE CASCADE ON DELETE SET NULL;
