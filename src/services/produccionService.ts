import { ProduccionSemanal, AlertaIA, KpiResumen } from '@/types';

export const produccionService = {
  // Simulación de llamada a FastAPI/Flask
  getResumen: async (): Promise<KpiResumen> => {
    return { totalOrdenes: 5, eficiencia: 92, unidadesHoy: 145 };
  },

  getHistoricoSemanal: async (): Promise<ProduccionSemanal[]> => {
    return [
      { dia: 'Lun', piezas: 120 },
      { dia: 'Mar', piezas: 150 },
      { dia: 'Mie', piezas: 180 },
      { dia: 'Jue', piezas: 140 },
      { dia: 'Vie', piezas: 160 },
    ];
  },

  getAlertasIA: async (): Promise<AlertaIA[]> => {
    return [{
      id: '1',
      ordenCodigo: 'ORD-2026-01',
      riesgo: 'alto',
      mensaje: 'Posible retraso en etapa de Confección: Cuello de botella en máquinas Merrow.'
    }];
  }
};