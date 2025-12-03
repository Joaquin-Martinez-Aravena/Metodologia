from fastapi import APIRouter, HTTPException
from datetime import date
from typing import List

# Importamos los modelos definidos
from app.schemas.pago import PagoRequest, Pago

router = APIRouter(
    prefix="/pagos",
    tags=["Pagos"]
)

# 💾 Simulación de Base de Datos: Una lista en memoria
pagos_realizados: List[Pago] = []

# --- ENDPOINT POST: CREAR UN PAGO ---
@router.post("/realizar", response_model=Pago)
async def realizar_pago(data: PagoRequest):
    """
    Registra un pago realizado a un trabajador.
    El frontend debe enviar el RUT, Nombre y Monto a pagar.
    """
    
    # 1. Crear el objeto Pago, añadiendo la fecha actual
    nuevo_pago = Pago(
        nombre=data.nombre,
        rut=data.rut,
        monto_a_pagar=data.monto_a_pagar,
        fecha_pago=date.today()  # <- Se añade la fecha actual
    )

    # 2. Simular el guardado en la "Base de Datos"
    pagos_realizados.append(nuevo_pago)
    
    # 3. Devolver el pago registrado
    return nuevo_pago

# --- ENDPOINT GET: MOSTRAR TODOS LOS PAGOS ---
@router.get("/", response_model=List[Pago])
async def obtener_pagos_realizados():
    """
    Devuelve la lista completa de todos los pagos que se han realizado.
    """
    # Devolver la lista completa de pagos
    return pagos_realizados