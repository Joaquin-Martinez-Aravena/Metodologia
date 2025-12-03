from pydantic import BaseModel
from datetime import date

# 1. Modelo para la solicitud POST (lo que viene del frontend)
class PagoRequest(BaseModel):
    nombre: str
    rut: str
    monto_a_pagar: float

# 2. Modelo para el pago registrado (lo que se guarda y se devuelve en el GET)
class Pago(BaseModel):
    nombre: str
    rut: str
    monto_a_pagar: float
    fecha_pago: date  # Usaremos date para la fecha actual