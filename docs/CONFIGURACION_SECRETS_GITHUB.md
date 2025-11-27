# 🔐 Configuración de Secrets en GitHub

Este documento explica cómo configurar los secrets necesarios para que los workflows de CI/CD funcionen correctamente.

## 📋 Secrets Requeridos

Los siguientes secrets deben ser configurados en GitHub Actions:

### 1. **GCP_SA_KEY** (Autenticación con Google Cloud)

```
Tipo: String (JSON)
Descripción: Credenciales de Service Account de Google Cloud
```

**Pasos para obtenerlo:**

```bash
# 1. Ir a Google Cloud Console
# https://console.cloud.google.com

# 2. Crear un Service Account:
#    - IAM & Admin → Service Accounts
#    - Create Service Account
#    - Nombre: github-actions
#    - Descripción: "CI/CD automation from GitHub"

# 3. Otorgar permisos:
#    - Cloud Run Admin (roles/run.admin)
#    - Artifact Registry Writer (roles/artifactregistry.writer)
#    - Cloud SQL Admin (roles/cloudsql.admin)

# 4. Crear una clave JSON:
#    - Seleccionar el SA → Keys → Add Key → Create new key
#    - Seleccionar JSON
#    - Descargar el archivo

# 5. Copiar el contenido del JSON y pegarlo en el secret
```

### 2. **GCP_PROJECT_ID** (Proyecto de GCP)

```
Tipo: String
Descripción: ID del proyecto GCP
Valor: secure-potion-474303-j7
```

### 3. **DOCKER_REGISTRY** (Registro de imágenes)

```
Tipo: String
Descripción: URL del Artifact Registry
Valor: us-central1-docker.pkg.dev
```

---

## 🔧 Cómo Configurar los Secrets en GitHub

### Opción 1: Interfaz Web

```
1. Ir a tu repositorio en GitHub
   https://github.com/202W0807-Taller-Web/inventory-shipping

2. Settings → Secrets and variables → Actions

3. Click en "New repository secret"

4. Agregar cada secret:
   - Name: GCP_SA_KEY
   - Value: (pegar el contenido del JSON)
   
   - Name: GCP_PROJECT_ID
   - Value: secure-potion-474303-j7
   
   - Name: DOCKER_REGISTRY
   - Value: us-central1-docker.pkg.dev
```

### Opción 2: GitHub CLI (Terminal)

```bash
# Instalar GitHub CLI si no lo tienes
# https://cli.github.com/

# Autenticarse
gh auth login

# Navegar al proyecto
cd inventory-shipping

# Agregar secrets
gh secret set GCP_SA_KEY < ./path/to/sa-key.json
gh secret set GCP_PROJECT_ID -b"secure-potion-474303-j7"
gh secret set DOCKER_REGISTRY -b"us-central1-docker.pkg.dev"

# Verificar que se crearon correctamente
gh secret list
```

---

## 📝 Ejemplo del Secret GCP_SA_KEY

El contenido del archivo JSON debería verse así:

```json
{
  "type": "service_account",
  "project_id": "secure-potion-474303-j7",
  "private_key_id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n",
  "client_email": "github-actions@secure-potion-474303-j7.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
}
```

⚠️ **IMPORTANTE:** 
- Nunca commits este archivo al repositorio
- Mantén la clave segura
- Solo copiar el contenido completo del JSON

---

## ✅ Verificación

Después de configurar los secrets, puedes verificar que estén correctos:

### En GitHub

```
1. Settings → Secrets and variables → Actions
2. Verificar que aparezcan:
   - GCP_SA_KEY (masked)
   - GCP_PROJECT_ID
   - DOCKER_REGISTRY
```

### Ejecutando un Workflow

```
1. Push a una rama feature: git push origin feature/test-ci-cd
2. Ir a Actions en GitHub
3. Ver que el workflow se ejecuta sin errores de autenticación
```

---

## 🚨 Troubleshooting

### Error: "authentication required"

```
Problema: Los secrets no están configurados correctamente
Solución:
1. Verificar que GCP_SA_KEY esté completo (incluir las comillas)
2. Verificar que el Service Account tenga permisos
3. Probar con: gcloud auth activate-service-account --key-file=sa-key.json
```

### Error: "Permission denied"

```
Problema: El Service Account no tiene permisos suficientes
Solución:
1. Ir a IAM & Admin → IAM
2. Seleccionar el SA: github-actions
3. Agregar roles:
   - Cloud Run Admin
   - Artifact Registry Writer
   - Cloud SQL Admin
```

### Error: "Failed to authenticate Docker"

```
Problema: Las credenciales de Artifact Registry no funcionan
Solución:
1. Ejecutar localmente: gcloud auth configure-docker
2. Verificar: docker images
3. Si funciona localmente, revisar que el secret esté correcto
```

---

## 📚 Referencias

- [Google Cloud Documentation](https://cloud.google.com/docs)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Actions Google Cloud Setup](https://github.com/google-github-actions/setup-gcloud)
- [Artifact Registry Authentication](https://cloud.google.com/artifact-registry/docs/docker/authentication)

---

## 🔄 Próximos Pasos

Una vez configurados los secrets:

1. ✅ Push cambios a rama `feature/test-ci-cd`
2. ✅ Verificar que CI workflow se ejecuta
3. ✅ Merge a `develop` para probar CD a Staging
4. ✅ Merge a `main` para probar CD a Producción

**¡Listo! Tu CI/CD está configurado.** 🎉
