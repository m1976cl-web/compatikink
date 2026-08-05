/**
 * homeModules.ts
 * Definición de todos los módulos del dashboard (antes inline en app/index.tsx líneas 315-379).
 * Extraído para reducir el tamaño de index.tsx y permitir reutilización futura.
 */

export type ModuleDef = {
  title: string;
  description: string;
  mark: string;
  category: 'explore' | 'scenes' | 'social' | 'ai' | 'vault';
  route?: string;
  onPress?: () => void;
};

export const ACCENT_COLORS: Record<string, string> = {
  explore: '#c084fc',
  scenes: '#f472b6',
  social: '#38bdf8',
  ai:     '#4ade80',
  vault:  '#fbbf24',
};

export type CategoryTab = { key: string; label: string; icon: string; accent: string };

export const CATEGORY_TABS: CategoryTab[] = [
  { key: 'explore', label: 'Explorar', icon: '🔮', accent: ACCENT_COLORS.explore },
  { key: 'scenes',  label: 'Escenas',  icon: '🎭', accent: ACCENT_COLORS.scenes  },
  { key: 'social',  label: 'Social',   icon: '🌐', accent: ACCENT_COLORS.social  },
  { key: 'ai',      label: 'IA',       icon: '🤖', accent: ACCENT_COLORS.ai      },
  { key: 'vault',   label: 'Bóveda',   icon: '🔒', accent: ACCENT_COLORS.vault   },
];

/** Módulos estáticos que no dependen de callbacks del componente padre. */
export const STATIC_MODULES: Omit<ModuleDef, 'onPress'>[] = [
  // Explorar
  { title: 'Cuestionario base',    description: 'Preferencias privadas y límites',                mark: 'Q',  category: 'explore', route: '/questionnaire'       },
  { title: 'Astrología kink',      description: 'Sinastría cósmica y horóscopo',                  mark: '🔮', category: 'explore', route: '/astrology'           },
  { title: 'Arquetipos BDSM',      description: 'Descubre tu perfil de roles',                    mark: '🎭', category: 'explore', route: '/archetypes'          },
  { title: 'Perfil rápido',        description: '10 preguntas · ~2 minutos',                      mark: '10', category: 'explore', route: '/quick-profile'       },
  { title: 'Compás kink',          description: 'Mapa 2D de afinidades',                          mark: '🧭', category: 'explore', route: '/compass'             },
  { title: 'Pass & Play',          description: 'Mismo dispositivo, cortina de privacidad',       mark: '🎮', category: 'explore', route: '/pass-and-play'       },
  { title: 'Manual',               description: 'Guía de módulos y seguridad',                    mark: '📖', category: 'explore', route: '/manual'              },
  { title: 'Glosario',             description: 'Términos y consentimiento',                      mark: '📚', category: 'explore', route: '/glossary'            },
  { title: 'Guía de seguridad',    description: 'SSC/RACK y protocolos',                          mark: '🛡️', category: 'explore', route: '/safety-guide'        },
  { title: 'Panel Admin',          description: 'Gestión maestro de perfiles',                    mark: '👑', category: 'explore', route: '/admin-dashboard'     },
  { title: 'Auditoría PenTest',    description: 'Diagnóstico de seguridad (Exclusivo Admin)',      mark: '🛡️', category: 'explore', route: '/security-audit'      },

  // Escenas
  { title: 'Escena en Vivo',       description: 'Monitor inmersivo con safeword por voz y Aftercare',    mark: '⚡', category: 'scenes', route: '/live-scene'           },
  { title: 'Ruleta Kink',          description: 'Oráculo de fantasías y retos en pareja',                mark: '🔮', category: 'scenes', route: '/kink-roulette'        },
  { title: 'Guía de Shibari',      description: 'Nudos paso a paso y mapa anatómico de nervios',         mark: '🪢', category: 'scenes', route: '/shibari-guide'        },
  { title: 'Acto Diario Kink',     description: 'Tareas diarias de disciplina D/s y racha',              mark: '🎲', category: 'scenes', route: '/daily-submissive-act' },
  { title: 'Kit de Inicio BDSM',   description: 'Guiones de escena, rutinas D/s y 7 días',               mark: '🚀', category: 'scenes', route: '/quick-start-bundle'   },
  { title: 'Vínculos & Diario',    description: 'Bitácora de parejas, retos, XP y diplomas',             mark: '🔗', category: 'scenes', route: '/partner-journal'      },
  { title: 'Chat E2EE Efímero',    description: 'Mensajería cifrada de pareja y retos',                  mark: '💬', category: 'scenes', route: '/partner-chat'         },
  { title: 'Pegging & Dating',     description: 'Guía psicológica, técnica y dating',                    mark: '🍑', category: 'scenes', route: '/pegging'              },
  { title: 'Rituales D/s',         description: 'Protocolos y hábitos guiados',                          mark: '📜', category: 'scenes', route: '/rituals'              },
  { title: 'Contratos Digitales',  description: 'Acuerdos D/s formales y firmas',                        mark: '✒️', category: 'scenes', route: '/contracts'            },
  { title: 'Fantasy Match',        description: 'Coincidencias double-blind',                            mark: '✨', category: 'scenes', route: '/fantasy-match'        },
  { title: 'Negociación en vivo',  description: 'Acuerdos y firma de escenas',                           mark: '🤝', category: 'scenes', route: '/negotiation'          },
  { title: 'Verdad o reto',        description: 'Cartas dinámicas para citas',                           mark: '🔥', category: 'scenes', route: '/truth-or-dare'        },
  { title: 'Calendario',           description: 'Escenas y aftercare',                                   mark: '📅', category: 'scenes', route: '/calendar'             },
  { title: 'Playlists',            description: 'Ambientes sonoros sensuales',                           mark: '🎵', category: 'scenes', route: '/playlists'            },
  { title: 'Gear Closet',          description: 'Inventario de equipo y juguetes',                       mark: '⚙️', category: 'scenes', route: '/gear-closet'          },

  // Social
  { title: 'Blog & Escritos',      description: 'Diario privado y publicaciones',       mark: '✍️', category: 'social', route: '/writings'          },
  { title: 'Dating kink',          description: 'Conexiones por afinidad',              mark: '💘', category: 'social', route: '/dating'            },
  { title: 'Feed de Comunidad',    description: 'Debate y encuestas anónimas',          mark: '💬', category: 'social', route: '/kink-feed'         },
  { title: 'Comunidades',          description: 'Grupos temáticos y tribus',            mark: '👥', category: 'social', route: '/communities'       },
  { title: 'Eventos & Munches',    description: 'Reuniones y talleres',                 mark: '🍸', category: 'social', route: '/events'            },
  { title: 'Cursos',               description: 'Kink Academy & clases',                mark: '🎓', category: 'social', route: '/courses'           },
  { title: 'Wrapped',              description: 'Resumen anual de exploración',         mark: '🎁', category: 'social', route: '/wrapped'           },
  { title: 'Reto semanal',         description: 'Desafíos con XP y niveles',           mark: '🏆', category: 'social', route: '/weekly-challenge'  },
  { title: 'Matriz Poli',          description: 'Sinastría de 3+ personas',            mark: '💎', category: 'social', route: '/poly-group'        },
  { title: 'Página Azul 💙',       description: 'Promociona tu OnlyFans & Fansly',     mark: '📸', category: 'social', route: '/blue-pages'        },
  { title: 'Tienda',               description: 'Recomendaciones y partners',           mark: '🛍️', category: 'social', route: '/store'             },

  // IA & Hardware
  { title: 'Guiones IA',           description: 'Generador de scripts de escenas',      mark: '🎬', category: 'ai', route: '/ai-script'    },
  { title: 'Music Sync',           description: 'Teledildonics & estimulación BPM',     mark: '⚡', category: 'ai', route: '/music-sync'   },
  { title: 'Roleplay IA',          description: 'Ensayo confidencial de dinámicas',     mark: '🤖', category: 'ai', route: '/ai-roleplay'  },
  { title: 'Escenas IA',           description: 'Rutinas personalizadas por IA',        mark: '🧠', category: 'ai', route: '/scene-ai'     },
  { title: 'Castidad',             description: 'Keyholding y temporizadores',          mark: '🔒', category: 'ai', route: '/chastity'     },
  { title: 'Hardware Sync',        description: 'QIUI / Lovense Bluetooth',             mark: '📡', category: 'ai', route: '/hardware'     },
  { title: 'Economía D/s',         description: 'Moneda de tareas y premios',           mark: '🪙', category: 'ai', route: '/task-economy' },
  { title: 'Analítica',            description: 'Subspace tracker y gráficos',          mark: '📊', category: 'ai', route: '/analytics'    },
  { title: 'Logros',               description: 'Insignias de exploración',             mark: '🥇', category: 'ai', route: '/achievements' },
  { title: 'Premium',              description: 'Compatikink PRO',                      mark: '👑', category: 'ai', route: '/premium'      },
];
