# Script de despliegue a Google Cloud Run
# Ejecutar desde la raíz del proyecto

$PROJECT_ID = "secure-potion-474303-j7"
$REGION = "us-central1"
$REPO = "microservices-repo"
$DB_PASSWORD = "123456789"
$INSTANCE = "inventory-postgres"

# Array de servicios con sus puertos originales (para referencia)
$services = @(
    @{Name="inventory"; Port=4001},
    @{Name="reservation"; Port=4002},
    @{Name="shipping"; Port=4003},
    # @{Name="warehouse"; Port=4004},
    @{Name="store"; Port=4005}
)

Write-Host "🚀 Iniciando despliegue a Google Cloud Run..." -ForegroundColor Cyan
Write-Host "📦 Proyecto: $PROJECT_ID" -ForegroundColor Yellow
Write-Host "🌎 Región: $REGION" -ForegroundColor Yellow
Write-Host ""

foreach ($service in $services) {
    $serviceName = $service.Name
    $servicePort = $service.Port
    
    Write-Host "======================================" -ForegroundColor Green
    Write-Host "📦 Desplegando: $serviceName" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
    
    # Navegar al directorio del servicio
    Push-Location "services/$serviceName"
    
    try {
        # 1. Construir la imagen Docker
        Write-Host "🔨 Construyendo imagen Docker..." -ForegroundColor Cyan
        $imageName = "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/${serviceName}:latest"
        docker build -t $imageName .
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Error al construir la imagen de $serviceName" -ForegroundColor Red
            Pop-Location
            continue
        }
        
        # 2. Subir la imagen a Artifact Registry
        Write-Host "⬆️  Subiendo imagen a Artifact Registry..." -ForegroundColor Cyan
        docker push $imageName
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Error al subir la imagen de $serviceName" -ForegroundColor Red
            Pop-Location
            continue
        }
        
        # 3. Desplegar en Cloud Run
        Write-Host "☁️  Desplegando en Cloud Run..." -ForegroundColor Cyan
        # Formato correcto para Cloud SQL con Unix Socket
        $databaseUrl = "postgresql://postgres:${DB_PASSWORD}@localhost/${serviceName}?host=/cloudsql/${PROJECT_ID}:${REGION}:${INSTANCE}"
        
        gcloud run deploy "${serviceName}-service" `
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
            Write-Host "✅ $serviceName desplegado exitosamente!" -ForegroundColor Green
            
            # Obtener la URL del servicio
            $serviceUrl = gcloud run services describe "${serviceName}-service" `
                --platform=managed `
                --region=$REGION `
                --format="value(status.url)"
            
            Write-Host "🔗 URL: $serviceUrl" -ForegroundColor Yellow
        } else {
            Write-Host "❌ Error al desplegar $serviceName" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
    } finally {
        # Volver al directorio raíz
        Pop-Location
    }
    
    Write-Host ""
}

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🎉 Proceso de despliegue completado!" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Para ver todos los servicios desplegados:" -ForegroundColor Yellow
Write-Host "   gcloud run services list --platform=managed --region=$REGION" -ForegroundColor White
Write-Host ""
Write-Host "📊 Para ver logs de un servicio:" -ForegroundColor Yellow
Write-Host "   gcloud run services logs tail <service-name> --region=$REGION" -ForegroundColor White
