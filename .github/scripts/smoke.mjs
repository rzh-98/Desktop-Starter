// Launches the packaged app, waits for the renderer to mount, and saves a screenshot.
// Usage: node .github/scripts/smoke.mjs <output.png>
import { spawn } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const output = process.argv[2] ?? 'screenshot.png'
const port = 9333
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const releaseDir = join('release', pkg.version)

function findExecutable() {
  const dirs = readdirSync(releaseDir)
  if (process.platform === 'win32') {
    return join(releaseDir, 'win-unpacked', `${pkg.productName}.exe`)
  }
  if (process.platform === 'darwin') {
    const macDir = dirs.find((dir) => dir.startsWith('mac'))
    return join(releaseDir, macDir, `${pkg.productName}.app`, 'Contents', 'MacOS', pkg.productName)
  }
  return join(releaseDir, 'linux-unpacked', pkg.name)
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function findPage() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
      const page = targets.find((target) => target.type === 'page')
      if (page) return page
    } catch {}
    await sleep(500)
  }
  throw new Error('No renderer page found within 30s')
}

function connect(url) {
  const socket = new WebSocket(url)
  let nextId = 0
  const pending = new Map()
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    const handler = pending.get(message.id)
    if (!handler) return
    pending.delete(message.id)
    message.error
      ? handler.reject(new Error(message.error.message))
      : handler.resolve(message.result)
  })
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++nextId
      pending.set(id, { resolve, reject })
      socket.send(JSON.stringify({ id, method, params }))
    })
  return new Promise((resolve, reject) => {
    socket.addEventListener('open', () => resolve({ send, close: () => socket.close() }))
    socket.addEventListener('error', () => reject(new Error('CDP connection failed')))
  })
}

const executable = findExecutable()
if (!existsSync(executable)) throw new Error(`Packaged app not found: ${executable}`)
console.log(`Launching ${executable}`)

const args = [`--remote-debugging-port=${port}`]
if (process.platform === 'linux') args.push('--no-sandbox')
const app = spawn(executable, args, { stdio: 'inherit' })

try {
  const page = await findPage()
  const cdp = await connect(page.webSocketDebuggerUrl)
  let state
  for (let attempt = 0; attempt < 40; attempt++) {
    const { result } = await cdp.send('Runtime.evaluate', {
      expression:
        'JSON.stringify({ title: document.title, mounted: (document.getElementById("root")?.childElementCount ?? 0) > 0 })',
      returnByValue: true
    })
    state = JSON.parse(result.value)
    if (state.mounted) break
    await sleep(500)
  }
  console.log(`Renderer state: ${JSON.stringify(state)}`)
  if (!state?.mounted) throw new Error('Renderer did not mount')
  await sleep(1000)
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(output, Buffer.from(data, 'base64'))
  console.log(`Saved ${output}`)
  cdp.close()
} finally {
  app.kill()
}
process.exit(0)
