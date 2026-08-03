import { CalculadoraTiempos } from "./prediccion/CalculadoraTiempos";
import { ProyeccionProduccion } from "./prediccion/ProyeccionProduccion";
import { AlertasRetraso } from "./prediccion/AlertasRetraso";
import { SimuladorMts } from "./prediccion/SimuladorMts";

interface TabPrediccionProps {
    proyecciones: any[];
    activeDelays: { riesgo: string; msg: string }[];
}

export function TabPrediccion({ proyecciones, activeDelays }: TabPrediccionProps) {
    return (
        <div className="space-y-5">
            {/* RF12: Calculadora de Tiempos de Entrega */}
            <CalculadoraTiempos />

            {/* RF13: Gráfica proyección */}
            <ProyeccionProduccion proyecciones={proyecciones} />

            {/* RF14: Detección temprana de retrasos */}
            <AlertasRetraso activeDelays={activeDelays} />

            {/* RF16: Simulación impacto MTS */}
            <SimuladorMts />
        </div>
    );
}
