export const CATEGORY_LABELS = {
  VIVIENDA: 'Vivienda',
  SUPERMERCADO: 'Supermercado',
  COMIDA: 'Comida',
  DELIVERY: 'Delivery',
  TRANSPORTE: 'Transporte',
  COMBUSTIBLE: 'Combustible',
  EDUCACION: 'Educacion',
  SALUD: 'Salud',
  CREDITOS: 'Creditos',
  SERVICIOS_BASICOS: 'Servicios basicos',
  ENTRETENCION: 'Entretencion',
  SUSCRIPCIONES: 'Suscripciones',
  TRANSFERENCIAS: 'Transferencias',
  AHORRO: 'Ahorro',
  INVERSION: 'Inversion',
  SUELDO: 'Sueldo',
  OTROS: 'Otros',
};

export const CATEGORY_ICONS = {
  VIVIENDA: String.fromCodePoint(0x1F3E0),
  SUPERMERCADO: String.fromCodePoint(0x1F6D2),
  COMIDA: String.fromCodePoint(0x1F37D),
  DELIVERY: String.fromCodePoint(0x1F6F5),
  TRANSPORTE: String.fromCodePoint(0x1F68C),
  COMBUSTIBLE: String.fromCodePoint(0x26FD),
  EDUCACION: String.fromCodePoint(0x1F393),
  SALUD: String.fromCodePoint(0x1FA7A),
  CREDITOS: String.fromCodePoint(0x1F4B3),
  SERVICIOS_BASICOS: String.fromCodePoint(0x1F4A1),
  ENTRETENCION: String.fromCodePoint(0x1F3AC),
  SUSCRIPCIONES: String.fromCodePoint(0x1F4F1),
  TRANSFERENCIAS: String.fromCodePoint(0x1F501),
  AHORRO: String.fromCodePoint(0x1F4B0),
  INVERSION: String.fromCodePoint(0x1F4C8),
  SUELDO: String.fromCodePoint(0x1F4B5),
  OTROS: String.fromCodePoint(0x1F4E6),
};

export const CATEGORY_COLORS = {
  VIVIENDA: '#f97316',
  SUPERMERCADO: '#22c55e',
  COMIDA: '#eab308',
  DELIVERY: '#fb923c',
  TRANSPORTE: '#38bdf8',
  COMBUSTIBLE: '#f43f5e',
  EDUCACION: '#a78bfa',
  SALUD: '#f87171',
  CREDITOS: '#fbbf24',
  SERVICIOS_BASICOS: '#34d399',
  ENTRETENCION: '#e879f9',
  SUSCRIPCIONES: '#818cf8',
  TRANSFERENCIAS: '#94a3b8',
  AHORRO: '#4ade80',
  INVERSION: '#2dd4bf',
  SUELDO: '#4ade80',
  OTROS: '#94a3b8',
};

export function categoryIcon(category) {
  return CATEGORY_ICONS[category] || String.fromCodePoint(0x1F4E6);
}

export function categoryLabel(category) {
  return CATEGORY_LABELS[category] || category;
}

export function categoryColor(category) {
  return CATEGORY_COLORS[category] || '#94a3b8';
}

export const HORIZONTE_INFO = {
  CORTO: { label: 'Corto plazo', color: '#4ade80' },
  MEDIANO: { label: 'Mediano plazo', color: '#facc15' },
  LARGO: { label: 'Largo plazo', color: '#60a5fa' },
  INDEFINIDO: { label: 'Sin definir', color: '#94a3b8' },
};

export function classifyHorizonte(months) {
  if (months === null || months === undefined || !isFinite(months) || months <= 0) return 'INDEFINIDO';
  if (months <= 12) return 'CORTO';
  if (months <= 36) return 'MEDIANO';
  return 'LARGO';
}
