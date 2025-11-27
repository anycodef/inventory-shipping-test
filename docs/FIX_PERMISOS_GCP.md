# 🔐 FIX: Permisos Insuficientes en Service Account

## ❌ Problema

```
ERROR: github-actions@***.iam.gserviceaccount.com does not have permission
Permission 'iam.serviceaccounts.actAs' denied on service account
```

El Service Account **github-actions** no tiene suficientes permisos en GCP.

---

## ✅ Solución: Agregar Roles Necesarios

### Opción 1: Desde Google Cloud Console (GUI)

1. **Ir a IAM & Admin:**
   ```
   https://console.cloud.google.com/iam-admin/iam
   ```

2. **Buscar el Service Account:**
   - Busca: `github-actions@`
   - O busca por email completo

3. **Hacer clic en el Service Account**

4. **Agregar los siguientes roles:**
   - ✅ **Cloud Run Admin** (`roles/run.admin`)
   - ✅ **Service Account User** (`roles/iam.serviceAccountUser`)
   - ✅ **Artifact Registry Writer** (`roles/artifactregistry.writer`)
   - ✅ **Cloud SQL Admin** (`roles/cloudsql.admin`)

### Opción 2: Desde Terminal (gcloud)

```bash
# Reemplazar PROJECT_ID con tu proyecto
PROJECT_ID="secure-potion-474303-j7"
SA_EMAIL="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

# Agregar Cloud Run Admin
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

# Agregar Service Account User (CRÍTICO para actAs)
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

# Agregar Artifact Registry Writer
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/artifactregistry.writer"

# Agregar Cloud SQL Admin
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/cloudsql.admin"

# Verificar roles asignados
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:${SA_EMAIL}"
```

---

## 🔑 Roles Requeridos Explicados

| Rol | Permiso | Razón |
|-----|---------|-------|
| **Cloud Run Admin** | Deploy a Cloud Run | Necesario para deployar servicios |
| **Service Account User** | `iam.serviceaccounts.actAs` | **CRÍTICO**: Permite usar service accounts |
| **Artifact Registry Writer** | Push de imágenes Docker | Necesario para guardar imágenes |
| **Cloud SQL Admin** | Acceso a Cloud SQL | Necesario para migraciones Prisma |

---

## 🎯 Paso a Paso: Google Cloud Console

```
1. Ir a: https://console.cloud.google.com/iam-admin/iam
   ↓
2. Click en "GRANT ACCESS"
   ↓
3. En "New principals": pegar
   github-actions@secure-potion-474303-j7.iam.gserviceaccount.com
   ↓
4. En "Select a role": elegir
   • Cloud Run Admin
   • Service Account User
   • Artifact Registry Writer
   • Cloud SQL Admin
   ↓
5. Click "SAVE"
   ↓
6. Esperar 30 segundos
   ↓
7. Volver a intentar el deploy en GitHub Actions
```

---

## ⚠️ CRÍTICO: Service Account User

El error menciona específicamente:
```
Permission 'iam.serviceaccounts.actAs' denied
```

Este permiso está en el rol **`roles/iam.serviceAccountUser`**

**SIN este rol**, GitHub Actions NO puede usar el Service Account para deployar.

---

## 🧪 Verificar que Funcionó

Una vez agregados los roles:

1. **Ir a GitHub Actions:**
   ```
   https://github.com/202W0807-Taller-Web/inventory-shipping/actions
   ```

2. **Click en el workflow fallido**

3. **Click en "Re-run failed jobs"**

4. **Esperar a que se ejecute de nuevo**

5. **Si aún falla, revisar logs para nuevo error**

---

## 🔍 Troubleshooting

### Si sigue fallando después de agregar roles:

```bash
# Esperar 1-2 minutos a que se propaguen los cambios
# Luego hacer:
gcloud iam service-accounts describe \
  github-actions@PROJECT_ID.iam.gserviceaccount.com

# Ver todos los roles asignados
gcloud projects get-iam-policy PROJECT_ID \
  --flatten="bindings[].members" \
  --format='table(bindings.role)' \
  --filter="bindings.members:github-actions*"
```

### Si aún no funciona:

1. Verificar que el Service Account es `github-actions`
2. Verificar que es en el proyecto correcto
3. Esperar 2-3 minutos a que se propaguen cambios
4. Intentar "Re-run failed jobs" en GitHub

---

## 📚 Referencias

- [Cloud Run IAM Roles](https://cloud.google.com/run/docs/authenticating/iam)
- [Service Account User Role](https://cloud.google.com/iam/docs/understanding-service-accounts#service_account_permissions)
- [Artifact Registry Permissions](https://cloud.google.com/artifact-registry/docs/access-control)

---

## ✅ Una Vez Arreglado

Los workflows deberían poder:
✅ Build Docker images
✅ Push a Artifact Registry
✅ Deploy a Cloud Run
✅ Ejecutar migraciones Prisma
✅ Health checks

---

**¿Pudiste agregar los roles? Dime cuándo lo hayas hecho y volvemos a intentar.** 🚀
