from pydantic import BaseModel
from datetime import date

#POST
class PagoRequest(BaseModel):
    nombre: str
    rut: str
    monto_a_pagar: float
    fecha_pago: date

# Get
class Pago(BaseModel):
    nombre: str
    rut: str
    monto_a_pagar: float
    fecha_pago: date  # Usaremos date para la fecha actual