import { useState, useMemo, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ExperienceLevel,
  UserProfile,
  ActivityCategory,
  DifficultyLevel,
  Activity,
  ActivityMood,
  ActivityResponse,
} from '@/types';
import { createSession } from '@/lib/sessions';
import { CATEGORY_ORDER, getAllActivities } from '@/data/activities';
import { getCurrentProfile, saveProfile, getCustomActivities } from '@/lib/storage';
import { QuestionnaireIntroStep } from '@/components/questionnaire/QuestionnaireIntroStep';
import { QuestionnaireCategoryStep } from '@/components/questionnaire/QuestionnaireCategoryStep';
import { QuestionnaireQuestionsStep } from '@/components/questionnaire/QuestionnaireQuestionsStep';
import { useTranslation } from '@/lib/i18n';

export default function QuestionnaireScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [nickname, setNickname] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | undefined>(undefined);
  const [userNotes, setUserNotes] = useState('');

  const [guestNickname, setGuestNickname] = useState('');
  const [guestNotes, setGuestNotes] = useState('');
  const [step, setStep] = useState<'intro' | 'categories' | 'questions'>('intro');
  const [isExpressMode, setIsExpressMode] = useState(params.mode === 'express');
  const [demoMode, setDemoMode] = useState(false);
  const [enabledCategories, setEnabledCategories] = useState<ActivityCategory[]>([...CATEGORY_ORDER]);
  const [customActivities, setCustomActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      const p = await getCurrentProfile();
      if (p) {
        setProfile(p);
        setNickname(p.nickname);
        setPronouns(p.pronouns || '');
        setExperienceLevel(p.experienceLevel);
        setUserNotes(p.notes || '');
      }
      const customs = await getCustomActivities();
      setCustomActivities(customs);
    })();
  }, []);

  const allActivities = useMemo(() => {
    return getAllActivities();
  }, [customActivities]);

  const selectedQuestionsCount = useMemo(() => {
    return allActivities.filter((a) => {
      if (!enabledCategories.includes(a.category)) return false;
      if (difficultyFilter !== 'all' && a.difficultyLevel !== difficultyFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
      }
      return true;
    }).length;
  }, [allActivities, enabledCategories, difficultyFilter, searchQuery]);

  const toggleCategory = (cat: ActivityCategory) => {
    setEnabledCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleCategoriesByMood = (mood: ActivityMood) => {
    const moodActivities = allActivities.filter((a) => a.moods?.includes(mood));
    const moodCategories = Array.from(new Set(moodActivities.map((a) => a.category)));
    const allSelected = moodCategories.every((c) => enabledCategories.includes(c));

    if (allSelected) {
      setEnabledCategories((prev) => prev.filter((c) => !moodCategories.includes(c)));
    } else {
      setEnabledCategories((prev) => Array.from(new Set([...prev, ...moodCategories])));
    }
  };

  const handleFinish = async (responses: ActivityResponse[]) => {
    setLoading(true);
    try {
      const updatedProfile: UserProfile = {
        nickname: nickname.trim() || 'Iniciador',
        pronouns: pronouns.trim() || undefined,
        experienceLevel,
        notes: userNotes.trim() || undefined,
        baseResponses: responses,
      };
      await saveProfile(updatedProfile);

      const session = await createSession(
        updatedProfile.nickname,
        responses,
        guestNickname.trim() ? { nickname: guestNickname.trim(), notes: guestNotes.trim() } : undefined,
        updatedProfile
      );

      router.replace({
        pathname: '/invite',
        params: { token: session.initiatorToken, code: session.inviteCode },
      });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo guardar el cuestionario');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'intro') {
    return (
      <QuestionnaireIntroStep
        nickname={nickname}
        setNickname={setNickname}
        pronouns={pronouns}
        setPronouns={setPronouns}
        experienceLevel={experienceLevel}
        setExperienceLevel={setExperienceLevel}
        userNotes={userNotes}
        setUserNotes={setUserNotes}
        guestNickname={guestNickname}
        setGuestNickname={setGuestNickname}
        guestNotes={guestNotes}
        setGuestNotes={setGuestNotes}
        demoMode={demoMode}
        setDemoMode={setDemoMode}
        onSelectExpressMode={() => {
          setIsExpressMode(true);
          setStep('questions');
        }}
        onSelectFullMode={() => {
          setIsExpressMode(false);
          setStep('categories');
        }}
      />
    );
  }

  if (step === 'categories') {
    return (
      <QuestionnaireCategoryStep
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        enabledCategories={enabledCategories}
        toggleCategory={toggleCategory}
        toggleCategoriesByMood={toggleCategoriesByMood}
        customActivities={customActivities}
        setCustomActivities={setCustomActivities}
        selectedQuestionsCount={selectedQuestionsCount}
        onStartQuestions={() => setStep('questions')}
        onBack={() => setStep('intro')}
      />
    );
  }

  return (
    <QuestionnaireQuestionsStep
      nickname={nickname}
      enabledCategories={enabledCategories}
      customActivities={customActivities}
      difficultyFilter={difficultyFilter}
      searchQuery={searchQuery}
      isExpressMode={isExpressMode}
      demoMode={demoMode}
      onFinish={handleFinish}
      loading={loading}
      onBack={() => setStep(isExpressMode ? 'intro' : 'categories')}
    />
  );
}
