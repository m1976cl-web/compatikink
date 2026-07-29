import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';

interface Course {
  id: string;
  title: string;
  emoji: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  lessonsCount: number;
  description: string;
  lessons: { title: string; content: string; quizQuestion: string; quizOptions: string[]; correctIdx: number }[];
}

const COURSES_DATA: Course[] = [
  {
    id: 'c-shibari',
    title: 'Fundamentos de Shibari & Ataduras Seguras',
    emoji: '🪢',
    level: 'Principiante',
    lessonsCount: 3,
    description: 'Aprende los nudos básicos, selección de cuerdas de yute y анатоmía de seguridad para evitar lesiones nerviosas.',
    lessons: [
      {
        title: 'Lección 1: Anatomía & Zonas de Riesgo',
        content: 'Evita aplicar presión directa sobre el nervio radial (brazo) y el nervio peroneo (piernas). Revisa la circulación cada 5 minutos.',
        quizQuestion: '¿Cada cuánto tiempo debes comprobar la temperatura y coloración de la piel en una atadura?',
        quizOptions: ['Cada 30 minutos', 'Cada 5 minutos', 'Solo al terminar la escena'],
        correctIdx: 1,
      },
    ],
  },
  {
    id: 'c-negotiation',
    title: 'Negociación Eficaz & Palabras Clave (Safewords)',
    emoji: '✍️',
    level: 'Principiante',
    lessonsCount: 3,
    description: 'Domina el sistema Semáforo (Verde, Amarillo, Rojo) y la declaración de límites duros (Hard Limits) antes de jugar.',
    lessons: [
      {
        title: 'Lección 1: El Sistema Semáforo',
        content: 'Verde significa continuar, Amarillo bajar la intensidad o ajustar, Rojo detener la escena inmediatamente.',
        quizQuestion: '¿Qué significa decir "Amarillo" durante una escena?',
        quizOptions: ['Detener todo y encender luces', 'Bajar la intensidad o cambiar de posición', 'Aumentar la velocidad'],
        correctIdx: 1,
      },
    ],
  },
  {
    id: 'c-aftercare',
    title: 'Maestría en Aftercare & Manejo de Afterdrop',
    emoji: '🪷',
    level: 'Intermedio',
    lessonsCount: 3,
    description: 'Protocolos de reconexión emocional, rehidratación y apoyo ante el descenso neuroquímico post-escena.',
    lessons: [
      {
        title: 'Lección 1: ¿Qué es el Afterdrop?',
        content: 'Es la caída abrupta de endorfinas y dopamina horas o días después de una escena intensa. Se combate con descanso, calor y cariño.',
        quizQuestion: '¿Cuál es el mejor primer paso al experimentar Afterdrop?',
        quizOptions: ['Iniciar otra escena inmediatamente', 'Abrigar a la persona, rehidratar y ofrecer afecto sin juicio', 'Ignorar la sensación'],
        correctIdx: 1,
      },
    ],
  },
];

export default function CoursesScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleQuizSubmit = (course: Course, lessonIdx: number) => {
    const lesson = course.lessons[lessonIdx];
    if (selectedOption === lesson.correctIdx) {
      Alert.alert('¡Respuesta Correcta! 🎉', 'Has completado este módulo educativo exitosamente. ¡Logro desbloqueado!');
    } else {
      Alert.alert('Inténtalo de nuevo 💡', 'Revisa el contenido de la lección e intenta responder otra vez.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🎓 Kink Academy & Cursos</Text>
          <Text style={styles.subtitle}>
            Módulos educativos guiados con lecciones prácticas, prevención de riesgos y quizzes de certificación
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {!selectedCourse ? (
            /* Courses List */
            <View style={{ gap: spacing.md }}>
              {COURSES_DATA.map((course) => (
                <View key={course.id} style={styles.courseCard}>
                  <View style={styles.courseHeader}>
                    <Text style={{ fontSize: 36 }}>{course.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.levelBadge}>{course.level.toUpperCase()}</Text>
                      <Text style={styles.courseTitle}>{course.title}</Text>
                    </View>
                  </View>

                  <Text style={styles.courseDesc}>{course.description}</Text>

                  <TouchableOpacity style={styles.startBtn} onPress={() => setSelectedCourse(course)}>
                    <Text style={styles.startBtnText}>Iniciar Curso ({course.lessonsCount} Lecciones) 📖</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            /* Active Course Lesson */
            <View style={styles.courseCard}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedCourse(null)}>
                <Text style={styles.backBtnText}>← Volver a Cursos</Text>
              </TouchableOpacity>

              <Text style={styles.courseTitle}>{selectedCourse.emoji} {selectedCourse.title}</Text>
              <Text style={styles.lessonTitle}>{selectedCourse.lessons[0].title}</Text>
              <Text style={styles.lessonContent}>{selectedCourse.lessons[0].content}</Text>

              {/* Quiz Box */}
              <View style={styles.quizBox}>
                <Text style={styles.quizQuestion}>❓ {selectedCourse.lessons[0].quizQuestion}</Text>
                {selectedCourse.lessons[0].quizOptions.map((opt, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.quizOpt, selectedOption === idx && styles.quizOptSelected]}
                    onPress={() => setSelectedOption(idx)}
                  >
                    <Text style={[styles.quizOptText, selectedOption === idx && styles.quizOptTextSelected]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.startBtn}
                  onPress={() => handleQuizSubmit(selectedCourse, 0)}
                >
                  <Text style={styles.startBtnText}>Comprobar Respuesta ✅</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  containerDesktop: { maxWidth: 740, alignSelf: 'center', width: '100%' },

  header: { paddingTop: spacing.md, paddingBottom: spacing.xs, gap: 4 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backBtnText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '700' },
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.xs },

  scroll: { gap: spacing.md, paddingTop: spacing.xs },

  courseCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    gap: spacing.md,
  },
  courseHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  levelBadge: { color: colors.success, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  courseTitle: { color: colors.text, fontSize: fontSize.md, fontWeight: '900', marginTop: 2 },
  courseDesc: { color: colors.textMuted, fontSize: fontSize.xs, lineHeight: 18 },

  startBtn: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: 14, alignItems: 'center' },
  startBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: '800' },

  lessonTitle: { color: colors.neonPurple, fontSize: fontSize.md, fontWeight: '800' },
  lessonContent: { color: colors.text, fontSize: fontSize.xs, lineHeight: 20, backgroundColor: colors.surfaceLight, padding: spacing.md, borderRadius: 14 },

  quizBox: { backgroundColor: colors.surfaceLight, padding: spacing.md, borderRadius: 14, gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
  quizQuestion: { color: colors.warning, fontSize: fontSize.xs, fontWeight: '800' },
  quizOpt: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  quizOptSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  quizOptText: { color: colors.textMuted, fontSize: fontSize.xs, fontWeight: '700' },
  quizOptTextSelected: { color: '#fff' },
});
