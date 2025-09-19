export function isDev(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true' ||
    process.defaultApp ||
    /[\\/]electron-prebuilt[\\/]/.test(process.execPath) ||
    /[\\/]electron[\\/]/.test(process.execPath)
  )
}