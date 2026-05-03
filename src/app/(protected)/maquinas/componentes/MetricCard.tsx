interface MetricCardProps {
    title: string;
    value: number | string;
    color?: string;
}

export function MetricCard({ title, value, color = "#475569" }: MetricCardProps) {
    return (
        <div
            className="p-6 rounded-2xl border transition-all hover:translate-y-[-2px]"
            style={{
                background: "#13161e", // C.surface
                borderColor: "#1e2130", // C.border
            }}
        >
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#475569" }}>
                {title}
            </p>
            <div className="flex items-end gap-2">
                <span className="text-3xl font-black text-white">
                    {value}
                </span>
                {/* Un pequeño indicador visual de color */}
                <div
                    className="w-1 h-6 rounded-full mb-1"
                    style={{ background: color }}
                />
            </div>
        </div>
    );
}