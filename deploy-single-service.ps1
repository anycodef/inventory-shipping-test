# Script para desplegar un servicio individual a Google Cloud Run
# Uso: .\deploy-single-service.ps1 inventory

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("inventory", "reservation", "shipping", "warehouse", "store")]
    [string]$ServiceName
)

$PROJECT_ID = "secure-potion-474303-j7"
$REGION = "us-central1"
$REPO = "microservices-repo"
$DB_PASSWORD = "123456789"
$INSTANCE = "inventory-postgres"

Write-Host "🚀 Desplegando servicio: $ServiceName" -ForegroundColor Cyan
Write-Host ""

# Navegar al directorio del servicio
Set-Location "services/$ServiceName"

try {
    # 1. Construir la imagen Docker
    Write-Host "🔨 Construyendo imagen Docker..." -ForegroundColor Cyan
    $imageName = "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/${ServiceName}:latest"
    docker build -t $imageName .
    
    if ($LASTEXITCODE -ne 0) {
        throw "Error al construir la imagen"
    }
    
    # 2. Subir la imagen
    Write-Host "⬆️  Subiendo imagen a Artifact Registry..." -ForegroundColor Cyan
    docker push $imageName
    
    if ($LASTEXITCODE -ne 0) {
        throw "Error al subir la imagen"
    }
    
    # 3. Desplegar en Cloud Run
    Write-Host "☁️  Desplegando en Cloud Run..." -ForegroundColor Cyan
    # Formato correcto para Cloud SQL con Unix Socket
    $databaseUrl = "postgresql://postgres:${DB_PASSWORD}@localhost/${ServiceName}?host=/cloudsql/${PROJECT_ID}:${REGION}:${INSTANCE}"
    
    gcloud run deploy "${ServiceName}-service" `
        --image=$imageName `
        --platform=managed `
        --region=$REGION `
        --allow-unauthenticated `
        --timeout=300 `
        --memory=512Mi `
        --cpu=1 `
        --min-instances=0 `
        --max-instances=10 `
        --set-env-vars="NODE_ENV=production,DATABASE_URL=$databaseUrl" `
        --add-cloudsql-instances="${PROJECT_ID}:${REGION}:${INSTANCE}"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ $ServiceName desplegado exitosamente!" -ForegroundColor Green
        
        # Obtener la URL del servicio
        $serviceUrl = gcloud run services describe "${ServiceName}-service" `
            --platform=managed `
            --region=$REGION `
            --format="value(status.url)"
        
        Write-Host "🔗 URL: $serviceUrl" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📊 Ver logs en tiempo real:" -ForegroundColor Cyan
        Write-Host "   gcloud run services logs tail ${ServiceName}-service --region=$REGION" -ForegroundColor White
    } else {
        throw "Error al desplegar en Cloud Run"
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
} finally {
    # Volver al directorio raíz
    Set-Location ../..
}
