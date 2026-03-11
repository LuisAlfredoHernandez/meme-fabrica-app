import { produccionService } from '@/services/produccionService';
import { GraficaProduccion } from '@/features/dashboard/GraficaProduccion';
import { TarjetaAlertaIA } from '@/features/dashboard/AlertaIA';

export default async function DashboardPage() {
    // Ejecutamos las llamadas en paralelo para mayor velocidad
    const [resumen, historico, alertas] = await Promise.all([
        produccionService.getResumen(),
        produccionService.getHistoricoSemanal(),
        produccionService.getAlertasIA()
    ]);

    return (
        <main className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Meme Fábrica Control</h1>
                    <p className="text-gray-500">Estado de producción en tiempo real</p>
                </div>
            </div>

            {/* Alertas Predictivas al inicio para llamar la atención */}
            {alertas.map(alerta => (
                <TarjetaAlertaIA key={alerta.id} alerta={alerta} />
            ))}

            {/* KPIs Rápidos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <p className="text-sm text-gray-500 uppercase font-bold">Órdenes Activas</p>
                    <p className="text-4xl font-bold">{resumen.totalOrdenes}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <p className="text-sm text-gray-500 uppercase font-bold">Unidades Hoy</p>
                    <p className="text-4xl font-bold text-blue-600">{resumen.unidadesHoy}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <p className="text-sm text-gray-500 uppercase font-bold">Eficiencia Global</p>
                    <p className="text-4xl font-bold text-green-600">{resumen.eficiencia}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GraficaProduccion datos={historico} />
                {/* Aquí podrías poner una tabla de pedidos recientes */}
            </div>
        </main>
    );
}