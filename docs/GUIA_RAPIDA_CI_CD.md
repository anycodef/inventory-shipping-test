# ⚡ Guía Rápida: Usar CI/CD

Para el equipo que solo quiere saber qué hacer.

---

## 🚀 Para Desarrolladores

### 1. Crear una rama de feature

```bash
git checkout -b feature/mi-nueva-feature
```

### 2. Hacer cambios

Modifica el código en `services/shipping/src/` o donde sea necesario.

### 3. Commit y Push

```bash
git add .
git commit -m "feat: descripción de cambios"
git push origin feature/mi-nueva-feature
```

### 4. ✅ CI se ejecuta automáticamente

Vai a GitHub → Actions y ve que todo valida ✅

**Si falla:**
- Leer el error en Actions
- Arreglarlo localmente
- Hacer commit + push
- CI se ejecuta de nuevo

### 5. Crear Pull Request

En GitHub:
1. Click en "Compare & pull request"
2. Descripción del cambio
3. Click en "Create Pull Request"

### 6. Code Review

Espera aprobación del equipo.

### 7. Merge a develop

Click en "Merge pull request" en GitHub.

**CD Staging se ejecuta automáticamente** 🚀

---

## 🧪 Para Testing (QA)

### Ver cambios en Staging

```
URL Staging: https://SERVICIO-service-staging.run.app
```

### Probar el servicio

1. Acceder a la URL de Staging
2. Probar los endpoints
3. Revisar logs si hay problemas

### Si todo está bien

Pedir merge a `main`:
```
Pull Request de develop → main
```

---

## 🚚 Para Producción

### Hacer un cambio ir a producción

```
1. Merge a main en GitHub
2. CD Production se ejecuta automáticamente
3. Servicio actualizado en: https://SERVICIO-service.run.app
```

### Revisar que todo funcione

```
gcloud run services logs read SERVICIO-service \
  --region=us-central1 \
  --limit=20
```

---

## 📋 Comandos Locales (Opcional)

### Tests

```bash
# Correr tests una sola vez
npm test

# Correr tests en modo watch (mejor para desarrollo)
npm run test:watch

# Tests + coverage
npm run test:coverage
```

### Linting

```bash
# Revisar código
npm run lint:check

# Revisar y arreglar automáticamente
npm run lint
```

### Desarrollo

```bash
# Ejecutar con nodemon (reinicia cuando cambias código)
npm run dev

# O manual
npm start
```

---

## 🔑 Configuración de Secrets (Solo una vez)

Alguien del equipo debe:

1. Ir a `docs/CONFIGURACION_SECRETS_GITHUB.md`
2. Seguir pasos para crear `GCP_SA_KEY`
3. Agregar secrets en GitHub

---

## 🆘 Problemas Comunes

### "CI falló"
→ Revisar qué falló en GitHub Actions  
→ Arreglarlo localmente  
→ Hacer commit + push

### "Staging URL no carga"
→ Esperar 2-3 minutos a que termine el deploy  
→ Revisar logs: `gcloud run services logs read ...`

### "Producción no actualiza"
→ Esperar 3-5 minutos  
→ Borrar cache del navegador (Ctrl+Shift+R)  
→ Revisar versión desplegada en Cloud Console

---

## 📚 Más Información

Si necesitas más detalles, revisa:

- `docs/ARQUITECTURA_CI_CD.md` - Cómo funciona todo
- `docs/RESUMEN_CI_CD_IMPLEMENTACION.md` - Qué se implementó
- `docs/GUIA_DESPLIEGUE.md` - Despliegue manual

---

## ✅ Checklist de Cambios

Antes de hacer push:

- [ ] Cambios committeados
- [ ] Mensajes de commit claros
- [ ] Rama correcta (`feature/xxx`)
- [ ] Sin conflictos con `main`

Antes de hacer merge:

- [ ] CI pasó ✅
- [ ] Code review aprobado ✅
- [ ] Tests en local pasan ✅
- [ ] Linting clean ✅

Antes de merge a main:

- [ ] Testeo en Staging OK ✅
- [ ] Producto acuerda cambio ✅
- [ ] Backup hecho (automático) ✅

---

**¡Listo! Ese es todo el flujo.** 🎉
