import { LineaOrden } from "@/features/ordenes/schemas/ordenes.schemas";

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

// ─── Enumeraciones ───────────────────────────────────────────

export type EtapaProduccion =
  | "corte"
  | "confeccion"
  | "estampado"
  | "acabado";

export type NivelAlerta = "info" | "advertencia" | "critica";


export type TipoTela =
  | "micro"
  | "mono"
  | "licra"
  | "algodon"
  | "poliester"
  | "otra";

export type TipoProducto =
  | "licra"
  | "jogger"
  | "vestido"
  | "t_shirt"
  | "short"
  | "blusa"
  | "otro";

// ─── Entidades Base ──────────────────────────────────────────
export const MAQUINAS_LIST = ["merrow", "cover", "plana", "corte", "plancha_dtf", "otro"] as const;
export type TipoMaquina = typeof MAQUINAS_LIST[number];

export const MAQUINAS_STATUS_LIST = ["activa", "inactiva", "depreciada"] as const;
export type MaquinaStatus = typeof MAQUINAS_STATUS_LIST[number]; // Esto genera el tipo automáticamente

export const USUARIO_ROL = ["admin", "subjefe", "operario"] as const;
export type RolUsuario = typeof USUARIO_ROL[number];

export const USUARIO_STATUS = ["activo", "pendiente", "inactivo", "terminado"] as const;
export type Status = typeof USUARIO_STATUS[number]

export interface Usuario {
  id?: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: RolUsuario;
  estado: Status;
  password?: string;
  ultimaConexion?: string;
}

export interface Operario extends Usuario {
  habilidades: HabilidadMaquinaria[];
  maquinaActual?: TipoMaquina;
  ordenActual?: string;
  /** Etapas en las que tiene experiencia */
  // etapasEspecializacion: HabilidadEtapa[];
}

export interface HabilidadMaquinaria {
  maquina: TipoMaquina;
  nivelEficiencia: number; // porcentaje 0-100
}

export interface Maquina {
  id: string;
  codigo: string; // ej: "MERROW-01"
  tipo: TipoMaquina;
  nombre: string;
  descripcion?: string;
  modelo?: string;
  serie?: string;
  capacidadPorHora: number; // piezas/hora estimadas
  operarioAsignado?: string; // Empleado.id
  estado: MaquinaStatus;
  ultimoMantenimiento?: string; // ISO 8601
  horasUso: number; // total acumulado
  ubicacion?: string; // ej: "Zona A - Fila 2"
}

export interface Insumo {
  id: string;
  nombre: string;
  codigo?: string;
  tipo: "tela" | "accesorio";
  subtipo?: TipoTela | "zipper" | "goma" | "boton" | "hilo" | "otro";
  unidad: "metros" | "unidades" | "rollos" | "kg";
  stock: number;
  minimo: number;
  proveedor?: string;
  vinculadoA?: string[];
}

// ─── Orden de Producción ─────────────────────────────────────
export const TipoOP_LIST = ["MTO", "MTS"] as const;
export type TipoOP = typeof TipoOP_LIST[number];
export const PRIORIDAD_LIST = ["baja", "normal", "alta", "urgente"] as const;
export type Prioridad = typeof PRIORIDAD_LIST[number];
export const TEMPORADA_LIST = ["verano", "invierno", "primavera", "otoño"] as const
export type Temporada = typeof TEMPORADA_LIST[number];
export const ESTADO_ORDEN_LIST = ["pendiente", "en_proceso", "pausada", "completada"] as const
export type EstadoOrden = typeof ESTADO_ORDEN_LIST[number];


export interface Orden {
  id: string;
  numero: string; // ej: "ORD-2026-0042"
  cliente: string;
  tipo: TipoOP;
  lineas: LineaOrden[];
  estado: EstadoOrden;
  temporada: Temporada;
  prioridad: Prioridad
  fechaCreacion: string; // ISO 8601
  fechaEntregaEstimada: string; // ISO 8601
  /** Fecha calculada por el modelo de IA */
  fechaEntregaPredicha?: string; // ISO 8601
  fechaEntregaReal?: string; // ISO 8601
  creadaPor: string; // Empleado.id
  notas?: string;
  cola: number
}

// ─── Registro de Producción ──────────────────────────────────

export interface RegistroProduccion {
  id: string;
  ordenId: string;
  empleadoId: string;
  maquinaId: string;
  etapa: EtapaProduccion;
  fecha: string; // ISO 8601 (solo fecha YYYY-MM-DD)
  horaInicio: string; // HH:mm
  horaFin?: string; // HH:mm
  piezasProducidas: number;
  piezasDefectuosas: number;
  tiempoParadaMinutos: number; // tiempo no productivo
  motivoParada?: string;
  /** Eficiencia calculada: piezasProducidas / (capacidad * horas) */
  eficienciaCalculada?: number; // 0-100
  observaciones?: string;
  sincronizado: boolean; // para offline-first
}

// ─── Predicción e IA ─────────────────────────────────────────

export interface AlertaCuelloBottella {
  maquinaId: string;
  tipo: TipoMaquina;
  nivel: NivelAlerta;
  mensaje: string;
  saturationPct: number; // 0-100
  impactoEstimadoHoras: number;
  timestamp: string; // ISO 8601
}

export interface RecomendacionPersonal {
  id: string;
  tipo: "movimiento" | "descanso" | "capacitacion" | "reasignacion";
  empleadoId: string;
  maquinaOrigenId?: string;
  maquinaDestinoId?: string;
  etapaOrigen?: EtapaProduccion;
  etapaDestino?: EtapaProduccion;
  justificacion: string;
  gananciaTiempoEstimadaHoras: number;
  prioridad: "baja" | "media" | "alta";
  aceptada?: boolean;
  timestamp: string; // ISO 8601
}

export interface PrediccionIA {
  id: string;
  ordenId: string;
  modelVersion: string; // ej: "v1.2.3"
  fechaGeneracion: string; // ISO 8601
  // Estimación de tiempo de finalización
  fechaFinalizacionEstimada: string; // ISO 8601
  confianza: number; // 0-1
  diasRestantesEstimados: number;
  // Eficiencia general de la orden
  eficienciaActual: number; // 0-100
  tendenciaEficiencia: "mejorando" | "estable" | "empeorando";
  // Cuellos de botella detectados
  cuellosBotella: AlertaCuelloBottella[];
  // Recomendaciones de personal
  recomendaciones: RecomendacionPersonal[];
  // Comparativa vs meta
  metaProduccionDiaria: number; // piezas/día esperadas
  produccionRealHoy: number;
  // Factores de riesgo identificados
  factoresRiesgo: string[];
  // Proyección diaria para gráfica
  proyeccionDiaria: Array<{
    fecha: string;
    metaAcumulada: number;
    realAcumulada: number;
    prediccionAcumulada: number;
  }>;
}

// ─── Dashboard / Métricas ────────────────────────────────────

export interface MetricasDashboard {
  ordenesActivas: number;
  piezasHoy: number;
  metaHoy: number;
  eficienciaGlobal: number;
  operariosActivos: number;
  maquinasEnUso: number;
  alertasCriticas: number;
  tendencia7Dias: Array<{
    fecha: string;
    produccion: number;
    meta: number;
    eficiencia: number;
  }>;
}

// ─── Respuestas de API ───────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  mensaje?: string;
  timestamp: string;
}

export interface ApiError {
  codigo: string;
  mensaje: string;
  detalles?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
}