export interface ScriptScene {
  title: string;
  tone: 'Estricto & Autoritario' | 'Sensual & Dulce' | 'Poético & Shibari' | 'Educativo & Guiado';
  durationMinutes: number;
  preparationNotes: string;
  dialogueScript: { role: string; line: string }[];
  safetyCheck: string;
}

export function generateAISceneScript(
  category: string,
  tone: 'Estricto & Autoritario' | 'Sensual & Dulce' | 'Poético & Shibari' | 'Educativo & Guiado'
): ScriptScene {
  return {
    title: `Guión de Escena Personalizado: ${category}`,
    tone,
    durationMinutes: 45,
    preparationNotes: 'Asegurar buena iluminación ambiental, música de fondo en baja intensidad y tijeras de emergencia a mano.',
    dialogueScript: [
      { role: 'Dominante', line: 'Mírame a los ojos. Hoy exploraremos este acuerdo paso a paso. Recuerda tus palabras clave en todo momento.' },
      { role: 'Sumiso/a', line: 'Entendido. Confío plenamente en la guía y en las reglas acordadas.' },
      { role: 'Dominante', line: 'Comenzamos con la venda. Respira profundo y concéntrate en el ritmo de tu respiración.' },
      { role: 'Dominante', line: 'Check-in de 15 minutos: ¿Cómo están tus muñecas y tu nivel de confort? (Verde / Amarillo / Rojo)' },
      { role: 'Sumiso/a', line: 'Verde. Me siento en perfecta sintonía y profunda relajación.' },
    ],
    safetyCheck: 'Monitorear la temperatura cutánea y la respiración abdominal durante toda la sesión.',
  };
}
