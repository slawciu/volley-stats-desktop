/**
 * This script is used to rename the binary with the platform specific postfix.
 * When `tauri build` is run, it looks for the binary name appended with the platform specific postfix.
 */

const execa = require('execa')
const fs = require('fs')

let extension = ''
if (process.platform === 'win32') {
  extension = '.exe'
}

async function main() {
  const rustInfo = (await execa('rustc', ['-vV'])).stdout
  const targetTriple = /host: (\S+)/g.exec(rustInfo)[1]
  if (!targetTriple) {
    console.error('Failed to determine platform target triple')
  }
  fs.renameSync(
    `./src-tauri/binaries/volley_score_api${extension}`,
    `./src-tauri/binaries/volley_score_api-${targetTriple}${extension}`
  )
}

main().catch((e) => {
  throw e
})
