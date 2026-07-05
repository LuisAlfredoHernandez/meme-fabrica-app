export const normalizeText = (text: string) =>
    text
        .normalize("NFD")                 // separa letra y acento
        .replace(/[\u0300-\u036f]/g, "")  // elimina acentos
        .toLowerCase();                   // opcional: ignora mayúsculas

export const formatLocalDate = (
    dateStr: string | Date | undefined | null,
    locale = "es-DO",
    options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" }
): string => {
    if (!dateStr) return "";
    
    let dateObj: Date;
    
    if (dateStr instanceof Date) {
        dateObj = dateStr;
    } else if (dateStr.includes("T")) {
        dateObj = new Date(dateStr);
    } else {
        const parts = dateStr.split("-");
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Enero es 0
            const day = parseInt(parts[2], 10);
            dateObj = new Date(year, month, day);
        } else {
            dateObj = new Date(dateStr);
        }
    }
    
    return dateObj.toLocaleDateString(locale, options);
};
