import { AppColors } from "@/shared/constants";

export function LoadingScreen({ message = "Cargando..." }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px]" style={{ background: "transparent" }}>
            <div className="relative flex flex-col items-center justify-center">
                {/* Efecto de resplandor trasero */}
                <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full w-32 h-32 animate-pulse"></div>
                
                {/* Contenedor del Logo */}
                <div className="relative w-20 h-20 rounded-3xl flex items-center justify-center mb-6 overflow-hidden shadow-2xl shadow-orange-500/20 border border-[#1e2130] bg-[#13161e] animate-pulse">
                    <img 
                        src="/icons/icon-192x192.png" 
                        alt="Meme Fábrica Logo" 
                        className="w-full h-full object-cover"
                    />
                </div>
                
                {/* Texto */}
                <h2 className="text-xl font-black text-white tracking-tight">{message}</h2>
                <div className="flex items-center gap-1 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
            </div>
        </div>
    );
}
