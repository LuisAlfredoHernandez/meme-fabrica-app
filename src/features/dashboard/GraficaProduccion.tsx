'use client'; // Recharts requiere interacción del cliente
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProduccionSemanal } from '@/types';

export function GraficaProduccion({ datos }: { datos: ProduccionSemanal[] }) {
    return (
        <div className="h-[300px] w-full bg-white p-4 rounded-xl shadow-sm border">
            <h3 className="text-gray-600 font-medium mb-4">Unidades Producidas por Día</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datos}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="dia" />
                    <YAxis />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} />
                    <Bar dataKey="piezas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}