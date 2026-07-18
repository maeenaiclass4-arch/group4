import { useMemo, useState } from 'react'
import { I18nProvider, useI18n } from './i18n'
import { ThemeProvider } from './lib/theme'
import { SessionsProvider, useSessions } from './lib/sessions'
import { getProjectType } from './lib/projectTypes'
import { generateAllPrompts, buildSessionTitle } from './lib/generators'
import { computeScore } from './lib/scoring'
import { MODELS } from './lib/models'
import { generateId } from './lib/utils'
import type { Answers, Lang, ModelId, ProjectTypeId, PromptSession, Template } from './lib/types'
import { Header, type ViewId } from './components/layout/Header'
import { ProjectTypeStep } from './components/wizard/ProjectTypeStep'
import { QuestionStep } from './components/wizard/QuestionStep'
import { ReviewStep } from './components/wizard/ReviewStep'
import { ResultsView } from './components/results/ResultsView'
import { HistoryView } from './components/history/HistoryView'
import { TemplatesView } from './components/templates/TemplatesView'

type ComposerPhase = 'type' | 'questions' | 'review' | 'results'

const ALL_MODEL_IDS: ModelId[] = MODELS.map((m) => m.id)

function AppContent() {
  const { lang, t } = useI18n()
  const { sessions, addSession, toggleFavorite, deleteSession } = useSessions()

  const [view, setView] = useState<ViewId>('composer')
  const [phase, setPhase] = useState<ComposerPhase>('type')
  const [projectTypeId, setProjectTypeId] = useState<ProjectTypeId | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [extraNotes, setExtraNotes] = useState('')
  const [outputLang, setOutputLang] = useState<Lang>(lang)
  const [targetModels, setTargetModels] = useState<ModelId[]>(ALL_MODEL_IDS)
  const [currentSession, setCurrentSession] = useState<PromptSession | null>(null)

  const projectType = useMemo(() => (projectTypeId ? getProjectType(projectTypeId) : undefined), [projectTypeId])

  const resetComposer = () => {
    setPhase('type')
    setProjectTypeId(null)
    setQuestionIndex(0)
    setAnswers({})
    setExtraNotes('')
    setTargetModels(ALL_MODEL_IDS)
    setOutputLang(lang)
    setCurrentSession(null)
  }

  const goToComposer = () => {
    setView('composer')
    resetComposer()
  }

  const selectProjectType = (id: ProjectTypeId) => {
    setProjectTypeId(id)
    setAnswers({})
    setExtraNotes('')
    setQuestionIndex(0)
    setTargetModels(ALL_MODEL_IDS)
    setOutputLang(lang)
    setCurrentSession(null)
    setPhase('questions')
  }

  const useTemplate = (template: Template) => {
    setProjectTypeId(template.projectType)
    setAnswers({ ...template.answers })
    setExtraNotes(template.extraNotes ?? '')
    setQuestionIndex(0)
    setTargetModels(ALL_MODEL_IDS)
    setOutputLang(lang)
    setCurrentSession(null)
    setPhase('review')
    setView('composer')
  }

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const goNextQuestion = () => {
    if (!projectType) return
    if (questionIndex < projectType.questions.length - 1) {
      setQuestionIndex((i) => i + 1)
    } else {
      setPhase('review')
    }
  }

  const goBackQuestion = () => {
    if (questionIndex > 0) {
      setQuestionIndex((i) => i - 1)
    } else {
      setPhase('type')
      setProjectTypeId(null)
    }
  }

  const toggleModel = (id: ModelId) => {
    setTargetModels((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  const handleGenerate = () => {
    if (!projectType) return
    const generated = generateAllPrompts(targetModels, projectType.id, answers, extraNotes, outputLang)
    const score = computeScore(projectType, answers, extraNotes).score
    const session: PromptSession = {
      id: generateId(),
      createdAt: Date.now(),
      projectType: projectType.id,
      answers: { ...answers },
      extraNotes,
      outputLang,
      targetModels,
      generated,
      qualityScore: score,
      favorite: false,
      title: buildSessionTitle(projectType.id, answers, lang),
    }
    addSession(session)
    setCurrentSession(session)
    setPhase('results')
  }

  const viewSession = (session: PromptSession) => {
    setCurrentSession(session)
    setProjectTypeId(session.projectType)
    setAnswers(session.answers)
    setExtraNotes(session.extraNotes)
    setOutputLang(session.outputLang)
    setTargetModels(session.targetModels)
    setPhase('results')
    setView('composer')
  }

  const editCurrentSession = () => {
    setPhase('review')
  }

  const favorites = sessions.filter((s) => s.favorite)
  const isCurrentFavorite = currentSession ? sessions.find((s) => s.id === currentSession.id)?.favorite ?? false : false

  return (
    <div className="flex min-h-full flex-col">
      <Header view={view} onNavigate={(v) => (v === 'composer' ? goToComposer() : setView(v))} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {view === 'composer' && (
          <>
            {phase === 'type' && <ProjectTypeStep onSelect={selectProjectType} />}
            {phase === 'questions' && projectType && (
              <QuestionStep
                projectType={projectType}
                question={projectType.questions[questionIndex]}
                index={questionIndex}
                total={projectType.questions.length}
                value={answers[projectType.questions[questionIndex].id] ?? ''}
                onChange={(v) => handleAnswerChange(projectType.questions[questionIndex].id, v)}
                onNext={goNextQuestion}
                onBack={goBackQuestion}
              />
            )}
            {phase === 'review' && projectType && (
              <ReviewStep
                projectType={projectType}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                extraNotes={extraNotes}
                onExtraNotesChange={setExtraNotes}
                outputLang={outputLang}
                onOutputLangChange={setOutputLang}
                targetModels={targetModels}
                onToggleModel={toggleModel}
                onChangeType={goToComposer}
                onGenerate={handleGenerate}
              />
            )}
            {phase === 'results' && currentSession && (
              <ResultsView
                session={currentSession}
                isFavorite={isCurrentFavorite}
                onToggleFavorite={() => toggleFavorite(currentSession.id)}
                onEdit={editCurrentSession}
                onNew={goToComposer}
              />
            )}
          </>
        )}

        {view === 'history' && (
          <HistoryView
            sessions={sessions}
            emptyMessage={t.history_empty}
            onView={viewSession}
            onToggleFavorite={toggleFavorite}
            onDelete={deleteSession}
          />
        )}

        {view === 'favorites' && (
          <HistoryView
            sessions={favorites}
            emptyMessage={t.favorites_empty}
            onView={viewSession}
            onToggleFavorite={toggleFavorite}
            onDelete={deleteSession}
          />
        )}

        {view === 'templates' && <TemplatesView onUseTemplate={useTemplate} />}
      </main>

      <footer className="border-t border-(--border) px-6 py-6 text-center text-xs text-(--text-muted)">
        {t.footer_note}
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <SessionsProvider>
          <AppContent />
        </SessionsProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
