# ⚡ Cheat Sheet - Despliegue Rápido

> **Guía de referencia rápida para despliegues**

---

## 🚀 Desplegar UN Servicio

```powershell
# Desde la raíz del proyecto
.\deploy-single-service.ps1 -ServiceName shipping
```

**Opciones válidas:**
- `inventory`
- `reservation`
- `shipping`
- `store`

⏱️ **Tiempo:** 5-8 minutos

---

## 🎯 Desplegar TODOS los Servicios

```powershell
.\deploy-to-cloudrun.ps1
```

⏱️ **Tiempo:** 20-35 minutos

---

## ✅ Verificar Despliegue

### 1. Ver la URL del servicio:
```powershell
gcloud run services describe shipping-service --region=us-central1 --format="value(status.url)"
```

### 2. Ver logs:
```powershell
gcloud run services logs read shipping-service --region=us-central1 --limit=50
```

### 3. Listar todos los servicios:
```powershell
gcloud run services list --region=us-central1
```

### 4. Test de salud:
```
https://[SERVICE-URL]/health
```

---

## 📋 Checklist Rápido

```
□ Docker Desktop corriendo
□ git pull origin master
□ Ejecutar script de deploy
□ Verificar URL y /health
□ Revisar logs
□ Avisar al equipo
```

---

## 🔧 Comandos de Emergencia

### Revertir despliegue:
```powershell
# Ver revisiones
gcloud run revisions list --service=shipping-service --region=us-central1

# Revertir
gcloud run services update-traffic shipping-service --region=us-central1 --to-revisions=[REVISION-NAME]=100
```

### Ver logs en tiempo real:
```powershell
gcloud run services logs tail shipping-service --region=us-central1
```

### Limpiar Docker:
```powershell
docker system prune -a
```

---

## ❌ Errores Comunes

| Error | Solución |
|-------|----------|
| `docker: command not found` | Abrir Docker Desktop |
| `gcloud: command not found` | Reiniciar PowerShell |
| `Permission denied` | Verificar cuenta: `gcloud auth list` |
| `Build failed` | Verificar Dockerfile y dependencias |

---

## 🌐 URLs del Proyecto

**Proyecto GCP:** `secure-potion-474303-j7`  
**Región:** `us-central1`  
**Consola:** https://console.cloud.google.com/run?project=secure-potion-474303-j7

---

## 🆘 Ayuda Rápida

```powershell
# Info del proyecto
gcloud config get-value project

# Cambiar proyecto
gcloud config set project secure-potion-474303-j7

# Login
gcloud auth login

# Ver servicios
gcloud run services list --region=us-central1

# Ver instancia de BD
gcloud sql instances describe inventory-postgres
```

---

**Ver guía completa:** [GUIA_DESPLIEGUE.md](./GUIA_DESPLIEGUE.md)
