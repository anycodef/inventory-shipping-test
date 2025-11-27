# 🏗️ Arquitectura de CI/CD

Documentación completa de la arquitectura CI/CD implementada en el proyecto.

---

## 📊 Visión General

```
┌─────────────────────────────────────────────────────────────────────┐
│                      FLUJO CI/CD COMPLETO                           │
└─────────────────────────────────────────────────────────────────────┘

Developer         Local           GitHub            GCP              Production
  │                │               │                 │                 │
  ├─ git push      │               │                 │                 │
  ├─────────────────┼──→ feature/* │                 │                 │
  │                 │               │                 │                 │
  │                 │               ├─ CI Workflow   │                 │
  │                 │               │ • npm test     │                 │
  │                 │               │ • npm lint     │                 │
  │                 │               │ • docker build │                 │
  │                 │               │                 │                 │
  │                 │               ✅ PR Ready      │                 │
  │                 │               │                 │                 │
  │    Review + Merge │            │                 │                 │
  ├─────────────────┼──→ develop   │                 │                 │
  │                 │               │                 │                 │
  │                 │               ├─ CD Staging    │                 │
  │                 │               │ • docker build │                 │
  │                 │               │ • docker push  │                 │
  │                 │               │ • gcloud deploy│                 │
  │                 │               │ • health check │                 │
  │                 │               │                 │                 │
  │                 │               │    ✅ Staging  │                 │
  │                 │               │                 ├─→ Cloud Run    │
  │                 │               │                 │   (staging)    │
  │                 │               │                 │                 │
  │    Test + Merge  │              │                 │                 │
  ├─────────────────┼──→ main      │                 │                 │
  │                 │               │                 │                 │
  │                 │               ├─ CD Production │                 │
  │                 │               │ • docker build │                 │
  │                 │               │ • docker push  │                 │
  │                 │               │ • gcloud deploy│                 │
  │                 │               │ • health check │                 │
  │                 │               │                 │                 │
  │                 │               │    ✅ Prod     │                 │
  │                 │               │                 ├─→ Cloud Run    │
  │                 │               │                 │   (production) │
  │                 │               │                 │                 │
  │                 │               │                 │  ✅ LIVE       │
  │                 │               │                 │                 │
```

---

## 🌳 Estrategia de Ramas

### Ramas Principales

| Rama | Propósito | Deploy | Audience |
|------|-----------|--------|----------|
| **main** | Código en producción | ✅ Cloud Run Production | Usuarios finales |
| **develop** | Código en staging/pruebas | ✅ Cloud Run Staging | QA, Testing |
| **feature/*** | Desarrollo de features | ❌ Solo CI (sin deploy) | Desarrolladores |

### Flujo de Ramas

```
feature/feature-name (del desarrollador)
    │
    ├─ Cambios y commits
    │
    ├─ CI ejecuta automáticamente
    │  ├─ npm test
    │  ├─ npm lint
    │  └─ docker build
    │
    ├─ Pull Request a develop
    │
    ├─ Code Review
    │
    └─ Merge a develop ✅
       │
       ├─ CD Staging ejecuta
       │  ├─ docker build
       │  ├─ docker push
       │  ├─ gcloud deploy
       │  └─ health check
       │
       ├─ Testing manual en Staging
       │
       └─ Merge develop → main ✅
          │
          └─ CD Production ejecuta
             ├─ docker build
             ├─ docker push
             ├─ gcloud deploy
             ├─ migraciones Prisma
             └─ health check
             │
             └─ ✅ EN VIVO
```

---

## 🔄 Workflows de GitHub Actions

### 1. **CI Workflow** (`.github/workflows/ci.yml`)

**Cuándo se ejecuta:**
- Push a cualquier rama `feature/**`
- Push a rama `develop`
- Pull Request a `main` o `develop`

**Qué hace:**
```yaml
matrix:
  - Detecta qué servicios cambiaron
  - Para cada servicio modificado:
    ├─ npm ci (instalar dependencias)
    ├─ npm run lint (validar código)
    ├─ npm test (ejecutar tests)
    └─ docker build (validar Dockerfile)
```

**Resultado:**
- ✅ Si todo pasa → PR está listo
- ❌ Si falla algo → Bloquea PR

**Tiempo promedio:** 5-10 minutos

---

### 2. **CD Staging Workflow** (`.github/workflows/cd-staging.yml`)

**Cuándo se ejecuta:**
- Merge a rama `develop`

**Qué hace:**
```yaml
Para cada servicio modificado:
├─ Detectar cambios
├─ Autenticar en GCP
├─ docker build
├─ docker push a Artifact Registry
├─ gcloud run deploy --image
├─ Configurar Cloud SQL
├─ Ejecutar Prisma migrations
├─ Health check (curl /health)
└─ Notificar resultado
```

**Resultado:**
- ✅ Servicio desplegado en Cloud Run STAGING
- 🔗 URL: `https://<service>-service-staging.run.app`

**Tiempo promedio:** 8-12 minutos

---

### 3. **CD Production Workflow** (`.github/workflows/cd-production.yml`)

**Cuándo se ejecuta:**
- Merge a rama `main`

**Qué hace:**
```yaml
Para cada servicio modificado:
├─ Pre-production checks (CI rápido)
├─ Autenticar en GCP
├─ docker build (con tag de commit)
├─ docker push a Artifact Registry
├─ gcloud run deploy --image
├─ Configurar Cloud SQL
├─ Ejecutar Prisma migrations
├─ Health check (curl /health)
├─ Notificar resultado
└─ Resumen de deploy
```

**Resultado:**
- ✅ Servicio desplegado en Cloud Run PRODUCCIÓN
- 🔗 URL: `https://<service>-service.run.app`

**Tiempo promedio:** 10-15 minutos

---

## 🔍 Detección de Cambios

El sistema **automáticamente** detecta qué servicios fueron modificados:

### Cómo funciona

```bash
# Si cambios en services/shipping/
git diff main...HEAD | grep "^services/shipping/" 

# → Resultado: solo compila y despliega shipping
# → Los otros servicios NO se tocan (ahorra tiempo y costos)
```

### Ejemplo

```
Cambios detectados:
├─ services/shipping/src/controllers/cotizacion.controller.js
├─ services/shipping/package.json
└─ services/shipping/Dockerfile

Servicios a deployar: ["shipping"]

Resultado:
✅ inventory    - SIN CAMBIOS (no se toca)
✅ reservation  - SIN CAMBIOS (no se toca)
🔄 shipping     - CAMBIOS DETECTADOS (se despliega)
✅ store        - SIN CAMBIOS (no se toca)
```

---

## 🐳 Construcción de Imágenes Docker

### Tags de Imágenes

```
us-central1-docker.pkg.dev/
  secure-potion-474303-j7/
    microservices-repo/
      shipping:latest              ← Última versión
      shipping:abc1234             ← Tag por commit SHA
      shipping:staging-1699287600  ← Tag por timestamp
```

### Storage en Artifact Registry

```
Artifact Registry
├─ microservices-repo (repositorio)
│  ├─ inventory
│  │  ├─ latest
│  │  ├─ abc1234
│  │  └─ staging-xxx
│  ├─ reservation
│  ├─ shipping
│  ├─ store
│  └─ warehouse
```

---

## ☁️ Despliegue a Cloud Run

### Configuración de Servicios

```bash
# Cada servicio se despliega con:
gcloud run deploy SERVICE-NAME
  --image=IMAGE_URL              # Imagen Docker
  --platform=managed             # Cloud Run managed
  --region=us-central1           # Región
  --allow-unauthenticated        # Acceso público
  --timeout=300                  # 5 minutos
  --memory=512Mi                 # Memoria
  --cpu=1                        # 1 CPU
  --min-instances=0              # Escalar a cero si no se usa
  --max-instances=10             # Máximo 10 instancias
  --add-cloudsql-instances=...   # Conexión a Cloud SQL
```

### Migraciones Automáticas

Las migraciones se ejecutan en `docker-entrypoint.sh`:

```bash
#!/bin/bash
# Ejecutar migraciones Prisma
npx prisma db push --accept-data-loss

# Luego iniciar el servicio
node src/index.js
```

**Timing:**
1. Container inicia
2. Se ejecuta `docker-entrypoint.sh`
3. Prisma migra la BD
4. Node.js inicia servidor
5. Health check valida `/health`

---

## 🏥 Health Checks

Después de desplegar, se valida que el servicio esté UP:

```bash
# Se ejecuta 15 veces con 5 segundos de espera entre intentos
for i in {1..15}; do
  curl -f https://SERVICE-URL/health && break || sleep 5
done
```

### Endpoints requeridos

Cada servicio **debe tener** un endpoint `/health`:

```javascript
// services/shipping/src/index.js
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'shipping',
    timestamp: new Date().toISOString()
  });
});
```

---

## 📈 Monitoreo y Logs

### Ver logs de un servicio

```bash
# Última 50 líneas
gcloud run services logs read SHIPPING-SERVICE-NAME \
  --region us-central1 \
  --limit 50

# Seguir logs en tiempo real
gcloud run services logs read SHIPPING-SERVICE-NAME \
  --region us-central1 \
  --follow
```

### Métricas en Cloud Console

```
https://console.cloud.google.com/run?project=secure-potion-474303-j7
├─ Requests/second
├─ Latency
├─ Errors
├─ CPU Usage
├─ Memory Usage
└─ Uptime
```

---

## 🚨 Manejo de Errores

### Si CI falla

```
❌ PR bloqueado
└─ Developer debe:
   ├─ Revisar qué falló (linting, tests, etc)
   ├─ Arreglarlo localmente
   ├─ git commit + git push
   └─ CI se ejecuta automáticamente de nuevo
```

### Si CD a Staging falla

```
❌ Deploy bloqueado
└─ Team debe:
   ├─ Revisar logs: gcloud run services logs tail ...
   ├─ Arreglarlo en develop
   ├─ Hacer merge a main
   ├─ CD Production se intenta de nuevo
```

### Si CD a Producción falla

```
⚠️ ALERTA CRÍTICA
└─ Rollback manual:
   ├─ Cloud Console → Cloud Run → Service
   ├─ Seleccionar revisión anterior
   ├─ "Route all traffic to this revision"
   ├─ Investigar qué pasó
   └─ Arreglar y redeploy
```

---

## 🔒 Seguridad

### Secretos en GitHub Actions

Los siguientes secrets son usados **solo por GitHub Actions**:

```yaml
GCP_SA_KEY              # Service Account JSON
GCP_PROJECT_ID          # Proyecto GCP
DOCKER_REGISTRY         # Artifact Registry
```

**Protecciones:**
- Enmascarados en logs
- Solo accesibles en workflows
- Nunca se muestran en output
- Se pueden rotar en cualquier momento

---

## 📊 Estadísticas de Despliegue

| Métrica | Valor |
|---------|-------|
| Tiempo CI | 5-10 min |
| Tiempo CD Staging | 8-12 min |
| Tiempo CD Production | 10-15 min |
| Despliegue completo | ~30 min |
| Costo por deploy | ~$0.10 |
| Servicios paralelos | 4 activos |

---

## 🎯 Próximos Pasos

1. ✅ Configurar Secrets en GitHub
2. ✅ Hacer push a `feature/test-ci-cd`
3. ✅ Verificar CI en Actions
4. ✅ Merge a `develop`
5. ✅ Verificar CD Staging
6. ✅ Merge a `main`
7. ✅ Verificar CD Production
8. ✅ Revisar en Cloud Console

**Entonces tu CI/CD estará 100% funcional.** ✨

---

## 📚 Referencias

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Artifact Registry Documentation](https://cloud.google.com/artifact-registry/docs)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Prisma Deployment](https://www.prisma.io/docs/orm/prisma-deploy)
