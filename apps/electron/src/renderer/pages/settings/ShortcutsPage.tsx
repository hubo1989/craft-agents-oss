/**
 * ShortcutsPage
 *
 * Displays keyboard shortcuts reference.
 */

import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { PanelHeader } from '@/components/app-shell/PanelHeader'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SettingsSection, SettingsCard, SettingsRow } from '@/components/settings'
import type { DetailsPageMeta } from '@/lib/navigation-registry'
import { isMac } from '@/lib/platform'

export const meta: DetailsPageMeta = {
  navigator: 'settings',
  slug: 'shortcuts',
}

interface ShortcutItem {
  keys: string[]
  description: string
}

interface ShortcutSection {
  title: string
  shortcuts: ShortcutItem[]
}

function getSections(t: (key: string) => string): ShortcutSection[] {
  const cmdKey = isMac ? '⌘' : 'Ctrl'
  return [
    {
      title: t('shortcuts.global'),
      shortcuts: [
        { keys: [cmdKey, '1'], description: t('shortcuts.focusSidebar') },
        { keys: [cmdKey, '2'], description: t('shortcuts.focusSessionList') },
        { keys: [cmdKey, '3'], description: t('shortcuts.focusChatInput') },
        { keys: [cmdKey, 'N'], description: t('shortcuts.newChat') },
        { keys: [cmdKey, 'B'], description: t('shortcuts.toggleSidebar') },
        { keys: [cmdKey, ','], description: t('shortcuts.openSettings') },
      ],
    },
    {
      title: t('shortcuts.navigation'),
      shortcuts: [
        { keys: ['Tab'], description: t('shortcuts.moveToNextZone') },
        { keys: ['Shift', 'Tab'], description: t('shortcuts.cyclePermissionMode') },
        { keys: ['←', '→'], description: t('shortcuts.moveBetweenZones') },
        { keys: ['↑', '↓'], description: t('shortcuts.navigateItems') },
        { keys: ['Home'], description: t('shortcuts.goToFirstItem') },
        { keys: ['End'], description: t('shortcuts.goToLastItem') },
        { keys: ['Esc'], description: t('shortcuts.closeDialog') },
      ],
    },
    {
      title: t('shortcuts.sessionList'),
      shortcuts: [
        { keys: ['Enter'], description: t('shortcuts.focusChatInput') },
        { keys: ['Delete'], description: t('shortcuts.deleteSession') },
      ],
    },
    {
      title: t('shortcuts.chat'),
      shortcuts: [
        { keys: ['Enter'], description: t('shortcuts.sendMessage') },
        { keys: ['Shift', 'Enter'], description: t('shortcuts.newLine') },
        { keys: [cmdKey, 'Enter'], description: t('shortcuts.sendMessage') },
      ],
    },
  ]
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-medium bg-muted border border-border rounded shadow-sm">
      {children}
    </kbd>
  )
}

export default function ShortcutsPage() {
  const { t } = useTranslation('settings')
  const cmdKey = isMac ? '⌘' : 'Ctrl'
  const sections = getSections(t)
  
  return (
    <div className="h-full flex flex-col">
      <PanelHeader title={t('shortcuts.title')} />
      <div className="flex-1 min-h-0 mask-fade-y">
        <ScrollArea className="h-full">
          <div className="px-5 py-7 max-w-3xl mx-auto space-y-8">
            {sections.map((section) => (
              <SettingsSection key={section.title} title={section.title}>
                <SettingsCard>
                  {section.shortcuts.map((shortcut, index) => (
                    <SettingsRow key={index} label={shortcut.description}>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <Kbd key={keyIndex}>{key}</Kbd>
                        ))}
                      </div>
                    </SettingsRow>
                  ))}
                </SettingsCard>
              </SettingsSection>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
