import { BarChart3 } from "lucide-react";
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { AppColors, TooltipIA } from "../IaShared";

interface ProyeccionProduccionProps {
    proyecciones: any[];
}

export function ProyeccionProduccion({ proyecciones }: ProyeccionProduccionProps) {
    return (
        <div className="rounded-2xl overflow-hidden" style={{ background: AppColors.surface, border: `1px solid ${AppColors.border}` }}>
            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: AppColors.border }}>
                <BarChart3 className="w-5 h-5" style={{ color: AppColors.orange }} />
                <h3 className="font-bold text-white text-sm">Proyección de Producción Diaria</h3>
            </div>
            <div className="p-5">
                {proyecciones.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[260px] text-center border-2 border-dashed rounded-xl" style={{ borderColor: AppColors.border }}>
                        <p className="text-sm font-bold text-slate-300">Esperando datos reales de producción</p>
                        <p className="text-xs text-slate-500 mt-2 max-w-[300px]">
                            La IA requiere que al menos un supervisor valide los reportes de avance de los operarios para poder proyectar la tendencia diaria.
                        </p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={260}>
                        <ComposedChart data={proyecciones} margin={{ top: 5, right: 5, bottom: 0, left: -15 }}>
                            <defs>
                                <linearGradient id="gR2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={AppColors.orange} stopOpacity={0.25} />
                                    <stop offset="95%" stopColor={AppColors.orange} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gP2" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={AppColors.violet} stopOpacity={0.15} />
                                    <stop offset="95%" stopColor={AppColors.violet} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={AppColors.border} vertical={false} />
                            <XAxis dataKey="d" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<TooltipIA />} />
                            <Line type="monotone" dataKey="meta" stroke="#334155" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
                            <Area type="monotone" dataKey="pred" stroke={AppColors.violet} strokeWidth={2} strokeDasharray="4 2" fill="url(#gP2)" dot={false} />
                            <Area type="monotone" dataKey="real" stroke={AppColors.orange} strokeWidth={2.5} fill="url(#gR2)"
                                dot={{ fill: AppColors.orange, r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: AppColors.orange, stroke: "#fff", strokeWidth: 2 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </div>
            <div className="px-5 pb-4 flex gap-4 text-xs" style={{ color: "#475569" }}>
                <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 inline-block" style={{ background: AppColors.orange }} /> Real</span>
                <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed inline-block" style={{ borderColor: "#334155" }} /> Meta Diario</span>
                <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed inline-block" style={{ borderColor: AppColors.violet }} /> Predicción de IA</span>
            </div>
        </div>
    );
}
