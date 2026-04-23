export const normalizeText = (text: string) =>
    text
        .normalize("NFD")                 // separa letra y acento
        .replace(/[\u0300-\u036f]/g, "")  // elimina acentos
        .toLowerCase();                   // opcional: ignora mayúsculas
