# 🔧 Configurar 4 DATABASE_URLs en GitHub Secrets

## 📋 Resumen

Ya que tienes **1 instancia Cloud SQL con 4 bases de datos**, necesitas agregar **4 secrets** en GitHub:

```
DATABASE_URL_INVENTORY    → postgresql://user:pwd@IP:5432/inventory_db
DATABASE_URL_RESERVATION  → postgresql://user:pwd@IP:5432/reservation_db
DATABASE_URL_SHIPPING     → postgresql://user:pwd@IP:5432/shipping_db
DATABASE_URL_STORE        → postgresql://user:pwd@IP:5432/store_db
```

---

## 🚀 Paso a Paso

### Paso 1: Ve a GitHub

```
Tu Repo → Settings → Secrets and variables → Actions
```

### Paso 2: Agregar 4 Secrets

Para cada base de datos:

#### Secret 1️⃣: DATABASE_URL_INVENTORY

```
Name: DATABASE_URL_INVENTORY
Value: postgresql://postgres:PASSWORD@IP:5432/inventory_db
```

Click **"Add secret"** ✅

#### Secret 2️⃣: DATABASE_URL_RESERVATION

```
Name: DATABASE_URL_RESERVATION
Value: postgresql://postgres:PASSWORD@IP:5432/reservation_db
```

Click **"Add secret"** ✅

#### Secret 3️⃣: DATABASE_URL_SHIPPING

```
Name: DATABASE_URL_SHIPPING
Value: postgresql://postgres:PASSWORD@IP:5432/shipping_db
```

Click **"Add secret"** ✅

#### Secret 4️⃣: DATABASE_URL_STORE

```
Name: DATABASE_URL_STORE
Value: postgresql://postgres:PASSWORD@IP:5432/store_db
```

Click **"Add secret"** ✅

---

## ✅ Verificación

Después de agregar todos, deberías ver:

```
GitHub → Settings → Secrets and variables → Actions

✅ DATABASE_URL_INVENTORY
✅ DATABASE_URL_RESERVATION
✅ DATABASE_URL_SHIPPING
✅ DATABASE_URL_STORE
✅ GCP_SA_KEY (ya existe)
✅ GCP_PROJECT_ID (ya existe)
✅ DOCKER_REGISTRY (ya existe)
```

---

## 🔍 Cómo Obtener los Valores

### Google Cloud Console

```
1. Ve a: Google Cloud Console → SQL
2. Haz click en: inventory-postgres (tu instancia)
3. Ve a: Connections
4. Copia la IP pública (o privada si usas VPC)
5. Crea el string para cada BD:

postgresql://postgres:TU_PASSWORD@IP:5432/NOMBRE_BD
```

### Ejemplo Real

```
postgresql://postgres:abc123xyz@34.73.151.205:5432/inventory_db
postgresql://postgres:abc123xyz@34.73.151.205:5432/reservation_db
postgresql://postgres:abc123xyz@34.73.151.205:5432/shipping_db
postgresql://postgres:abc123xyz@34.73.151.205:5432/store_db
```

### Validar Localmente

```bash
# Para cada uno:
psql "postgresql://postgres:PASSWORD@IP:5432/inventory_db"

# Si conecta, estás bien ✅
# Escribe: \q para salir
```

---

## 🔄 Cómo Funcionan en los Workflows

### En cd-staging.yml y cd-production.yml

Ahora el workflow tiene esto:

```bash
case "${{ matrix.service }}" in
  inventory)
    DB_URL="${{ secrets.DATABASE_URL_INVENTORY }}"
    ;;
  reservation)
    DB_URL="${{ secrets.DATABASE_URL_RESERVATION }}"
    ;;
  shipping)
    DB_URL="${{ secrets.DATABASE_URL_SHIPPING }}"
    ;;
  store)
    DB_URL="${{ secrets.DATABASE_URL_STORE }}"
    ;;
esac
```

**Resultado**: Cada servicio recibe su propio DATABASE_URL ✅

```
inventory-service      ← recibe DATABASE_URL_INVENTORY
reservation-service    ← recibe DATABASE_URL_RESERVATION
shipping-service       ← recibe DATABASE_URL_SHIPPING
store-service          ← recibe DATABASE_URL_STORE
```

---

## 📝 Checklist

- [ ] He copiado la IP de mi instancia Cloud SQL
- [ ] Sé mi contraseña de postgres
- [ ] He creado el string para inventory_db
- [ ] He creado el string para reservation_db
- [ ] He creado el string para shipping_db
- [ ] He creado el string para store_db
- [ ] Agregué DATABASE_URL_INVENTORY a GitHub Secrets
- [ ] Agregué DATABASE_URL_RESERVATION a GitHub Secrets
- [ ] Agregué DATABASE_URL_SHIPPING a GitHub Secrets
- [ ] Agregué DATABASE_URL_STORE a GitHub Secrets
- [ ] Verifiqué que aparecen en Settings → Secrets

---

## 🧪 Test Final

Una vez hayas agregado todos los secrets:

1. Push a main (o espera a que CD ejecute)
2. Ve a: GitHub → Actions → CD Production
3. Espera que termine
4. Prueba los endpoints:

```bash
# Inventory
curl https://inventory-service.run.app/api/stock-productos

# Reservation
curl https://reservation-service.run.app/api/reservas

# Shipping
curl https://shipping-service.run.app/api/carrier

# Store
curl https://store-service.run.app/api/locales
```

Deberían responder con datos (no error DATABASE_URL). ✅

---

## ❓ Troubleshooting

### Error: "Secrets not found"

```
Significa que un secret no está configurado.
Verifica que los nombres sean EXACTAMENTE:
- DATABASE_URL_INVENTORY
- DATABASE_URL_RESERVATION
- DATABASE_URL_SHIPPING
- DATABASE_URL_STORE
```

### Error: "Invalid connection string"

```
Verifica que el formato sea:
postgresql://usuario:password@IP:5432/database_name

Sin comillas, sin espacios extra.
```

### Error: "Connection refused"

```
Posibles causas:
1. IP incorrecta (usa IP pública, no privada)
2. Puerto incorrecto (siempre 5432 para PostgreSQL)
3. Nombre de BD incorrecto
4. Credenciales incorrectas

Prueba localmente primero:
psql "postgresql://postgres:pwd@IP:5432/db"
```

---

**Última actualización**: 7 de noviembre de 2025  
**Estado**: 🔧 Workflows actualizados, awaiting secrets
