/**
 * afterPack Hook
 *
 * This hook is called after the app is packaged but before the final
 * installer/distributable is created.
 *
 * Currently used for:
 * - macOS 26+ Liquid Glass icon compilation (Assets.car)
 *
 * @param {import('electron-builder').AfterPackContext} context
 */
async function afterPack(context) {
  // macOS 26+ Liquid Glass icon compilation would go here
  // For now, this is a placeholder as the feature is not fully implemented

  // eslint-disable-next-line no-console
  console.log(`[afterPack] Packaging complete for ${context.electronPlatformName}`);
}

module.exports = afterPack;
