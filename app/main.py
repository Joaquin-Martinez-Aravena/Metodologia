from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from dotenv import load_dotenv
from sqlalchemy import text

from app.routers import pagos
from .bd_init import run_sql_files
from .mongodb import init_mongodb, close_mongodb
from .routers import empleados, productos, proveedores, compras, lotes, alertas, consultas, categorias, alertasmongo

# Cargar variables de entorno desde .env (si existe) lo antes posible
load_dotenv()

# Comprobar si las variables se cargan correctamente
print("DATABASE_URL:", os.getenv("DATABASE_URL"))
print("MONGODB_URL:", os.getenv("MONGODB_URL"))


logger = logging.getLogger(__name__)

# Creación de la aplicación FastAPI
app = FastAPI(
    title="FarmaLink API", 
    version="0.2.0",
    description="Sistema de gestión farmacéutica con PostgreSQL y MongoDB"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite TODOS los orígenes temporalmente
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(empleados.router, prefix="/api")
app.include_router(pagos.router, prefix="/api")
app.include_router(productos.router, prefix="/api")
app.include_router(proveedores.router, prefix="/api")
app.include_router(compras.router, prefix="/api")
app.include_router(lotes.router, prefix="/api")
app.include_router(alertas.router, prefix="/api")
app.include_router(consultas.router, prefix="/api")
app.include_router(categorias.router, prefix="/api")
app.include_router(alertasmongo.router, prefix="/api")

@app.on_event("startup")
def startup_event():
    """Función para inicializar las bases de datos al iniciar la aplicación."""
    print("[DB-INIT] Iniciando PostgreSQL...")
    try:
        run_sql_files()
        print("✅ PostgreSQL inicializado")
    except Exception as e:
        # No queremos que un fallo en los scripts SQL detenga la app en Render
        logger.error(f"[DB-INIT] Error inicializando PostgreSQL: {e}")
        print(f"[DB-INIT] Warning: no se pudo inicializar PostgreSQL: {e}")

    # Inicializar MongoDB (síncrono)
    print("[DB-INIT] Iniciando MongoDB...")
    try:
        init_mongodb()
        print("✅ MongoDB inicializado")
    except Exception as e:
        # Continuar si Mongo no está disponible; la app puede seguir funcionando
        logger.warning(f"[DB-INIT] No se pudo inicializar MongoDB: {e}")
        print(f"[DB-INIT] Warning: no se pudo inicializar MongoDB: {e}")

    print("🚀 FarmaLink API lista")

@app.on_event("shutdown")
def shutdown_event():
    """Cierra las conexiones al apagar la aplicación."""
    print("[DB-SHUTDOWN] Cerrando conexiones...")
    try:
        close_mongodb()
    except Exception as e:
        logger.warning(f"[DB-SHUTDOWN] Error cerrando MongoDB: {e}")
    print("👋 FarmaLink API detenida")

@app.get("/")
def ping():
    return {
        "ok": True, 
        "name": "FarmaLink API",
        "version": "0.2.0",
        "databases": {
            "postgresql": "connected",
            "mongodb": "connected"
        }
    }

@app.get("/health")
def health_check():
    """Verifica el estado de las bases de datos"""
    from .bd import SessionLocal, engine
    from .mongodb import get_database
    
    status = {
        "api": "healthy",
        "postgresql": "unknown",
        "mongodb": "unknown"
    }
    
    # Verificar PostgreSQL
    try:
        # Usar una conexión directa desde el engine para evitar errores
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        status["postgresql"] = "healthy"
    except Exception as e:
        status["postgresql"] = f"error: {str(e)}"
    
    # Verificar MongoDB
    try:
        mongo_db = get_database()
        mongo_db.command("ping")
        status["mongodb"] = "healthy"
    except Exception as e:
        status["mongodb"] = f"error: {str(e)}"
    
    return status

