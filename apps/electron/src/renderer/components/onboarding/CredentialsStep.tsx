/**
 * CredentialsStep - Onboarding step wrapper for API key or OAuth flow
 *
 * Thin wrapper that composes ApiKeyInput or OAuthConnect controls
 * with StepFormLayout for the onboarding wizard context.
 */

import { ExternalLink } from "lucide-react"
import { useTranslation } from 'react-i18next'
import type { ApiSetupMethod } from "./APISetupStep"
import { StepFormLayout, BackButton, ContinueButton } from "./primitives"
import {
  ApiKeyInput,
  type ApiKeyStatus,
  type ApiKeySubmitData,
  OAuthConnect,
  type OAuthStatus,
} from "../apisetup"

export type CredentialStatus = ApiKeyStatus | OAuthStatus

interface CredentialsStepProps {
  apiSetupMethod: ApiSetupMethod
  status: CredentialStatus
  errorMessage?: string
  onSubmit: (data: ApiKeySubmitData) => void
  onStartOAuth?: () => void
  onBack: () => void
  // Two-step OAuth flow
  isWaitingForCode?: boolean
  onSubmitAuthCode?: (code: string) => void
  onCancelOAuth?: () => void
}

export function CredentialsStep({
  apiSetupMethod,
  status,
  errorMessage,
  onSubmit,
  onStartOAuth,
  onBack,
  isWaitingForCode,
  onSubmitAuthCode,
  onCancelOAuth,
}: CredentialsStepProps) {
  const isOAuth = apiSetupMethod === 'claude_oauth'

  const { t } = useTranslation('onboarding')

  // --- OAuth flow ---
  if (isOAuth) {
    return (
      <StepFormLayout
        title={t('credentials.claudeAccountTitle')}
        description={t('credentials.claudeAccountDescription')}
        actions={
          <>
            <BackButton onClick={onBack} disabled={status === 'validating'}>{t('common.back')}</BackButton>
            <ContinueButton
              onClick={onStartOAuth}
              className="gap-2"
              loading={status === 'validating'}
              loadingText={t('common.connecting')}
            >
              <ExternalLink className="size-4" />
              {t('credentials.signInWithClaude')}
            </ContinueButton>
          </>
        }
      >
        <OAuthConnect
          status={status as OAuthStatus}
          errorMessage={errorMessage}
          isWaitingForCode={isWaitingForCode}
          onStartOAuth={onStartOAuth!}
          onSubmitAuthCode={onSubmitAuthCode}
          onCancelOAuth={onCancelOAuth}
        />
      </StepFormLayout>
    )
  }

  // --- API Key flow ---
  return (
    <StepFormLayout
      title={t('credentials.apiConfigTitle')}
      description={t('credentials.apiConfigDescription')}
      actions={
        <>
          <BackButton onClick={onBack} disabled={status === 'validating'}>{t('common.back')}</BackButton>
          <ContinueButton
            type="submit"
            form="api-key-form"
            disabled={false}
            loading={status === 'validating'}
            loadingText={t('common.validating')}
          />
        </>
      }
    >
      <ApiKeyInput
        status={status as ApiKeyStatus}
        errorMessage={errorMessage}
        onSubmit={onSubmit}
      />
    </StepFormLayout>
  )
}
