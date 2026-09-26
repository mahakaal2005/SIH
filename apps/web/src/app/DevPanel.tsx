import { useQueryClient } from '@tanstack/react-query'
import { SlidersHorizontal } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { districts } from '@ys/shared/seed'
import type { RepoName } from '@/core/data/mock/transport'
import { useDevTools } from '@/core/di/RepositoryProvider'
import { useSessionStore } from '@/core/session/SessionProvider'
import { pick } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/ui/sheet'
import { Switch } from '@/shared/ui/switch'
import { toast } from 'sonner'

const REPOS: RepoName[] = ['recommendation', 'partner', 'document', 'application', 'catalog', 'profile', 'auth', 'notification']
const DEMO = districts.filter((d) => d.isDemoDistrict)

export function DevPanel() {
  const dev = useDevTools()
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const session = useSessionStore()
  const failing = useSyncExternalStore(
    (l) => dev?.transport.subscribe(l) ?? (() => {}),
    () => dev?.transport.failing().join(',') ?? '',
  )
  if (!dev) return null

  async function reset() {
    await dev!.resetData()
    session.setUser(null)
    queryClient.clear()
    toast.success(t('dev.resetDone'))
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('dev.open')} className="size-11 text-muted-foreground">
          <SlidersHorizontal aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('dev.title')}</SheetTitle>
          <SheetDescription>{t('dev.hint')}</SheetDescription>
        </SheetHeader>
        <div className="space-y-6 px-4 pb-6">
          <section>
            <h2 className="mb-2 font-sans text-base font-bold">{t('dev.accounts')}</h2>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>{t('dev.citizenAccount')}</li>
              {DEMO.map((d, i) => (
                <li key={d.id}>
                  {t('dev.officerAccount', { district: pick(d.name, i18n.language), phone: `90000000${String(i + 1).padStart(2, '0')}` })}
                </li>
              ))}
              <li>{t('dev.hqAccount', { phone: '9000000099' })}</li>
            </ul>
          </section>
          <section>
            <h2 className="mb-2 font-sans text-base font-bold">{t('dev.failTitle')}</h2>
            <ul className="space-y-2">
              {REPOS.map((r) => (
                <li key={r} className="flex items-center justify-between gap-3">
                  <Label htmlFor={`fail-${r}`}>{t(`dev.repo.${r}`)}</Label>
                  <Switch
                    id={`fail-${r}`}
                    checked={failing.split(',').includes(r)}
                    onCheckedChange={(v) => dev.transport.setFailing(r, v)}
                  />
                </li>
              ))}
            </ul>
          </section>
          <Button variant="destructive" className="h-11 w-full" onClick={reset}>
            {t('dev.reset')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
