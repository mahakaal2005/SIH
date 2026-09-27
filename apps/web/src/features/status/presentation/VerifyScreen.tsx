import { useTranslation } from 'react-i18next'
import { pick } from '@/shared/i18n'
import { Screen } from '@/shared/components/Screen'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Textarea } from '@/shared/ui/textarea'
import { useVerifyViewModel } from './useVerifyViewModel'

export function VerifyScreen() {
  const { t, i18n } = useTranslation()
  const { text, setText, result, checking, check, scheme, district } = useVerifyViewModel()

  return (
    <Screen title={t('verify.title')} lead={t('verify.lead')}>
      <div className="space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('verify.placeholder')}
          rows={4}
          aria-label={t('verify.placeholder')}
        />
        <Button className="h-11" disabled={!text.trim() || checking} onClick={check}>
          {checking ? t('verify.checking') : t('verify.cta')}
        </Button>

        {result && (
          <Card role="status" data-testid="verify-result">
            <CardContent className="space-y-1 pt-6">
              {result.valid ? (
                <>
                  <p className="font-medium text-pass">{t('verify.result.valid.title')}</p>
                  <p>{result.application.receiptNo}</p>
                  {scheme && <p>{pick(scheme.name, i18n.language)}</p>}
                  {district && <p>{pick(district.name, i18n.language)}</p>}
                  <p>{t('verify.result.valid.stage', { stage: t(`stage.${result.application.stage}`) })}</p>
                </>
              ) : (
                <p className="text-blocked">{t(`verify.result.${result.reason}`)}</p>
              )}
            </CardContent>
          </Card>
        )}

        <p className="text-sm text-muted-foreground">{t('verify.warning')}</p>
      </div>
    </Screen>
  )
}
