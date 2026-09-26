import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useReducer } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { applicantProfileSchema } from '@ys/shared'
import { errorKey } from '@/core/data/errors'
import { useRepositories } from '@/core/di/RepositoryProvider'
import { routes } from '@/core/router/routes'
import { useSession } from '@/core/session/SessionProvider'
import { loadProfile, saveProfile } from '../domain/profile.usecase'
import { PROFILE_STEPS, profileDefaults, type ProfileFormValues } from '../domain/profileForm'

export interface State {
  status: 'loading' | 'error' | 'idle' | 'success'
  step: number
  assisted: boolean
  saving: boolean
  errorKey?: string
  saveErrorKey?: string
}

export type Event =
  | { type: 'Loaded' }
  | { type: 'LoadFailed'; errorKey: string }
  | { type: 'Next' }
  | { type: 'Back' }
  | { type: 'AssistedToggled' }
  | { type: 'SaveStarted' }
  | { type: 'SaveFailed'; errorKey: string }
  | { type: 'Saved' }

export const initialState: State = { status: 'loading', step: 0, assisted: false, saving: false }
const LAST = PROFILE_STEPS.length - 1

export function reduce(state: State, event: Event): State {
  switch (event.type) {
    case 'Loaded':
      return { ...state, status: 'idle' }
    case 'LoadFailed':
      return { ...state, status: 'error', errorKey: event.errorKey }
    case 'Next':
      return { ...state, step: Math.min(state.step + 1, LAST) }
    case 'Back':
      return { ...state, step: Math.max(state.step - 1, 0) }
    case 'AssistedToggled':
      return { ...state, assisted: !state.assisted }
    case 'SaveStarted': {
      const { saveErrorKey: _, ...rest } = state
      return { ...rest, saving: true }
    }
    case 'SaveFailed':
      return { ...state, saving: false, saveErrorKey: event.errorKey }
    case 'Saved':
      return { ...state, saving: false, status: 'success' }
  }
}

export function useProfileViewModel() {
  const [state, dispatch] = useReducer(reduce, initialState)
  const { profile: repo } = useRepositories()
  const { user } = useSession()
  const userId = user!.id
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const saved = useQuery({ queryKey: ['profile', userId], queryFn: () => loadProfile(repo, userId) })
  const form = useForm<ProfileFormValues>({
    // Form fields start empty (undefined) before the schema's required types apply.
    resolver: zodResolver(applicantProfileSchema) as Resolver<ProfileFormValues>,
    defaultValues: profileDefaults(),
    mode: 'onTouched',
  })

  useEffect(() => {
    if (saved.isSuccess) {
      form.reset(profileDefaults(saved.data))
      dispatch({ type: 'Loaded' })
    } else if (saved.isError) dispatch({ type: 'LoadFailed', errorKey: errorKey(saved.error) })
  }, [saved.isSuccess, saved.isError, saved.data, saved.error, form])

  async function next() {
    if (await form.trigger([...PROFILE_STEPS[state.step]!.fields])) dispatch({ type: 'Next' })
  }

  const submit = form.handleSubmit(async (values) => {
    dispatch({ type: 'SaveStarted' })
    try {
      const p = await saveProfile(repo, userId, values)
      queryClient.setQueryData(['profile', userId], p)
      await queryClient.invalidateQueries({ queryKey: ['recommendations'] })
      dispatch({ type: 'Saved' })
      navigate(routes.schemes)
    } catch (e) {
      dispatch({ type: 'SaveFailed', errorKey: errorKey(e) })
    }
  })

  return {
    state,
    form,
    next,
    back: () => dispatch({ type: 'Back' }),
    toggleAssisted: () => dispatch({ type: 'AssistedToggled' }),
    retryLoad: () => saved.refetch(),
    submit,
  }
}
