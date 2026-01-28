## 问题定位
- 报错来自 Vite 的 JSON 解析器，文件是 [settings.json](file:///Users/hubo/Tools/craft-agents-oss/packages/shared/locales/zh-CN/settings.json#L111-L115)。
- `timezoneDesc` 的字符串里直接包含了英文双引号：`如"明天"或"下周"`（当前文件实际是未转义的 `"`），在 JSON 中会被当作字符串结束符，导致语法错误。

## 修复 JSON 语法
- 修改 `timezoneDesc` 为合法 JSON 字符串，二选一：
  - 方案 A（推荐、可读性更好）：使用中文引号，不需要转义：`用于相对日期，如“明天”或“下周”。`
  - 方案 B：保留英文双引号但转义：`用于相对日期，如\"明天\"或\"下周\"。`

## 确保相关导入已补齐
- 核对 i18n 入口 [i18n/index.ts](file:///Users/hubo/Tools/craft-agents-oss/apps/electron/src/renderer/i18n/index.ts#L1-L50)：
  - `settingsZh` 已通过 `import settingsZh from '@locales/zh-CN/settings.json'` 引入并加入 `resources['zh-CN'].settings`。
  - Vite alias `@locales` 已在 [vite.config.ts](file:///Users/hubo/Tools/craft-agents-oss/apps/electron/vite.config.ts#L33-L43) 指向 `packages/shared/locales`。
- 若你这次新增了“新的命名空间 JSON”（不只是新增 key），需要同步把该 JSON 加入 `i18n/index.ts` 的 imports、`resources` 与 `ns` 列表（当前 `ns` 为 `['common','chat','onboarding','settings']`）。

## 确保所有键名都有对应翻译
- 做一次一致性检查，确保 `en/settings.json` 与 `zh-CN/settings.json` 的 key 结构一致（避免出现只在某一端存在的 key）。
- 同时从 Renderer 侧扫描 `useTranslation('settings') + t('...')` 的使用点（例如 [PreferencesPage.tsx](file:///Users/hubo/Tools/craft-agents-oss/apps/electron/src/renderer/pages/settings/PreferencesPage.tsx#L199-L289)）并确认这些 key 在两种语言里都存在。
- 如果发现缺失：优先补齐 `en` 与 `zh-CN` 两边；仅靠 `fallbackLng: 'en'` 会让中文界面偶尔回退英文或直接显示 key。

## 验证（我会在你确认后执行）
- 在修复后，对 `packages/shared/locales/**.json` 全量做一次 JSON 解析校验，避免类似问题再次出现。
- 运行 Electron renderer 的开发或构建流程（例如 `bun run electron:dev` 或 `bun run electron:build:renderer`）确认 overlay 消失且页面能正常渲染。

## 交付物
- 修复后的 `zh-CN/settings.json`。
- 一个可复用的本地化校验方式（脚本或测试），用于：JSON 语法检查 + en/zh key 差异检查。