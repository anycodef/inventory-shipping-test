# 📚 Documentación del Proyecto

Bienvenido a la documentación completa del proyecto Inventory-Shipping.

---

## 🚀 Guías de Despliegue

### 🎯 Para Empezar

Si es tu primera vez desplegando, sigue este orden:

1. **[📘 Guía Completa de Despliegue](./GUIA_DESPLIEGUE.md)** ← **EMPIEZA AQUÍ**
   - Instalación de Docker y Google Cloud SDK
   - Configuración paso a paso
   - Cómo desplegar servicios
   - Verificación y troubleshooting
   - **Tiempo de lectura:** 30-45 minutos

2. **[⚡ Cheat Sheet](./CHEAT_SHEET_DESPLIEGUE.md)**
   - Comandos rápidos de despliegue
   - Checklist resumido
   - Para referencia rápida después de aprender
   - **Tiempo de lectura:** 5 minutos

3. **[📊 Flujo Visual](./FLUJO_DESPLIEGUE_VISUAL.md)**
   - Diagramas del proceso de despliegue
   - Arquitectura del sistema
   - Timeline y estados
   - **Tiempo de lectura:** 15 minutos

4. **[❓ Preguntas Frecuentes (FAQ)](./FAQ_DESPLIEGUE.md)**
   - Respuestas a dudas comunes
   - Soluciones a problemas frecuentes
   - Tips y mejores prácticas
   - **Tiempo de lectura:** 20 minutos (para consultar)

---

## 📂 Estructura de Documentación

```
docs/
├── README.md                      ← Estás aquí
├── GUIA_DESPLIEGUE.md            ← Guía completa (INICIO)
├── CHEAT_SHEET_DESPLIEGUE.md     ← Referencia rápida
├── FLUJO_DESPLIEGUE_VISUAL.md    ← Diagramas
└── FAQ_DESPLIEGUE.md             ← Preguntas frecuentes
```

---

## 🎓 Rutas de Aprendizaje

### Para Nuevos Desarrolladores

```
📘 Guía Completa (GUIA_DESPLIEGUE.md)
    │
    ├─► Instalar herramientas (30 min)
    ├─► Configurar credenciales (15 min)
    ├─► Primer despliegue (10 min)
    └─► Verificar funcionamiento (5 min)
        │
        ▼
⚡ Cheat Sheet (referencia rápida)
```

### Para Desarrolladores Experimentados

```
⚡ Cheat Sheet → Despliegue rápido
    │
    ├─► Si hay dudas → 📘 Guía Completa
    └─► Si hay problemas → ❓ FAQ
```

### Para Entender la Arquitectura

```
📊 Flujo Visual → Diagramas del sistema
    │
    └─► 📘 Guía Completa → Detalles técnicos
```

---

## 🔍 Búsqueda Rápida

### Quiero...

**...hacer mi primer despliegue**
→ [Guía Completa - Sección 4](./GUIA_DESPLIEGUE.md#4-cómo-desplegar)

**...saber qué comandos usar**
→ [Cheat Sheet](./CHEAT_SHEET_DESPLIEGUE.md)

**...entender cómo funciona el sistema**
→ [Flujo Visual](./FLUJO_DESPLIEGUE_VISUAL.md)

**...resolver un problema**
→ [FAQ - Sección 6](./FAQ_DESPLIEGUE.md#-problemas-técnicos)

**...instalar las herramientas**
→ [Guía Completa - Sección 2](./GUIA_DESPLIEGUE.md#2-instalación-de-herramientas)

**...ver logs del servicio**
→ [Cheat Sheet - Verificar Despliegue](./CHEAT_SHEET_DESPLIEGUE.md#-verificar-despliegue)

**...revertir un despliegue**
→ [FAQ - Versionado](./FAQ_DESPLIEGUE.md#-versionado-y-rollback)

**...saber cuánto cuesta**
→ [FAQ - Costos](./FAQ_DESPLIEGUE.md#-costos)

---

## 📋 Checklist Rápido (Para Veteranos)

```
□ Docker Desktop corriendo
□ git pull origin master
□ .\deploy-single-service.ps1 -ServiceName [servicio]
□ Verificar /health endpoint
□ Revisar logs
□ Avisar al equipo
```

---

## 🆘 Soporte

### ¿Necesitas Ayuda?

1. **Revisa la documentación:**
   - [Guía Completa](./GUIA_DESPLIEGUE.md) para tutoriales
   - [FAQ](./FAQ_DESPLIEGUE.md) para problemas comunes

2. **Pregunta al equipo:**
   - Canal de Slack: #despliegues
   - Scrum Master: [Nombre]

3. **Recursos externos:**
   - [Docker Docs](https://docs.docker.com/)
   - [Cloud Run Docs](https://cloud.google.com/run/docs)

---

## 🎯 Próximos Pasos

### Ya leíste la documentación y desplegaste con éxito?

Ahora puedes:
- ✅ Ayudar a otros compañeros del equipo
- ✅ Contribuir mejorando esta documentación
- ✅ Explorar optimizaciones de despliegue
- ✅ Aprender sobre CI/CD (próximo sprint)

---

## 📊 Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| Microservicios | 4 activos + 1 en desarrollo |
| Región GCP | us-central1 |
| Tiempo deploy (1 servicio) | 5-8 minutos |
| Tiempo deploy (todos) | 20-35 minutos |
| Base de datos | Cloud SQL PostgreSQL |
| Documentación | 5 guías completas |

---

## 🔄 Actualizaciones

Esta documentación se mantiene actualizada con cada sprint.

**Última actualización:** 4 de noviembre de 2025  
**Versión:** 1.0  
**Mantenedores:** Equipo Scrum

---

## 📝 Contribuir a la Documentación

¿Encontraste algo que mejorar?

1. Crea un issue en GitHub
2. Propón cambios en un PR
3. Habla con el Scrum Master

**Gracias por mantener la documentación actualizada!** 🙌

---

## 🚀 Enlaces Rápidos

| Recurso | Link |
|---------|------|
| Consola GCP | https://console.cloud.google.com/run?project=secure-potion-474303-j7 |
| Repositorio | https://github.com/202W0807-Taller-Web/inventory-shipping |
| Cloud SQL | https://console.cloud.google.com/sql/instances |
| Artifact Registry | https://console.cloud.google.com/artifacts |

---

**¡Feliz despliegue! 🎉🎉**
