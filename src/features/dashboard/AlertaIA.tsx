import { AlertaIA } from '@/types';
import { BrainCircuit, AlertTriangle } from 'lucide-react';

export function TarjetaAlertaIA({ alerta }: { alerta: AlertaIA }) {
    return (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm">
            <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-full">
                    <BrainCircuit className="text-amber-600 w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-amber-900">Predicción de IA: {alerta.ordenCodigo}</h4>
                    <p className="text-amber-800 text-sm">{alerta.mensaje}</p>
                </div>
                <AlertTriangle className="ml-auto text-amber-500 animate-pulse" />
            </div>
        </div>
    );
}