// Contratos de datos para Meme Fábrica
export interface ProduccionSemanal {
  dia: string;
  piezas: number;
}

export interface AlertaIA {
  id: string;
  ordenCodigo: string;
  riesgo: 'alto' | 'medio' | 'bajo';
  mensaje: string;
}

export interface KpiResumen {
  totalOrdenes: number;
  eficiencia: number;
  unidadesHoy: number;
}