// BASE_URL: the app may be served from a subfolder
const ENGINE_URL = `${import.meta.env.BASE_URL}stockfish/stockfish-19-lite-single.js`
// generous: the first search also waits for the wasm download and compile
const TIMEOUT_MS = 15000
const FULL_STRENGTH = 20

export interface Evaluation {
  /** Centipawns for the side to move. Unused when `mate` is set. */
  cp: number
  /** Moves until mate: positive if the side to move mates, negative if it gets mated. */
  mate: number | null
  /** Best move in UCI form. */
  best: string
}

/** Stockfish in a web worker. One search at a time; calls are queued. */
export class Engine {
  private worker = new Worker(ENGINE_URL)
  private queue: Promise<unknown> = Promise.resolve()

  constructor() {
    this.worker.postMessage('uci')
  }

  /** Best move in UCI form, e.g. "e7e5" or "a2a1q". Lower skill plays weaker on purpose. */
  async bestMove(fen: string, skill: number, depth: number): Promise<string> {
    return (await this.search(fen, skill, depth)).best
  }

  /** Full-strength evaluation of a position that still has legal moves. */
  analyse(fen: string, depth: number): Promise<Evaluation> {
    return this.search(fen, FULL_STRENGTH, depth)
  }

  private search(fen: string, skill: number, depth: number): Promise<Evaluation> {
    const run = () =>
      new Promise<Evaluation>((resolve, reject) => {
        let cp = 0
        let mate: number | null = null
        const cleanup = () => {
          clearTimeout(timer)
          this.worker.removeEventListener('message', onMessage)
          this.worker.removeEventListener('error', onError)
        }
        const onMessage = (ev: MessageEvent) => {
          const line = String(ev.data)
          const score = /^info .*\bscore (cp|mate) (-?\d+)/.exec(line)
          if (score) {
            cp = score[1] === 'cp' ? Number(score[2]) : 0
            mate = score[1] === 'mate' ? Number(score[2]) : null
          }
          if (!line.startsWith('bestmove')) return
          cleanup()
          resolve({ cp, mate, best: line.split(' ')[1] })
        }
        const onError = () => {
          cleanup()
          reject(new Error('engine failed to load'))
        }
        const timer = setTimeout(() => {
          cleanup()
          reject(new Error('engine timed out'))
        }, TIMEOUT_MS)
        this.worker.addEventListener('message', onMessage)
        this.worker.addEventListener('error', onError)
        this.worker.postMessage(`setoption name Skill Level value ${skill}`)
        this.worker.postMessage(`position fen ${fen}`)
        this.worker.postMessage(`go depth ${depth}`)
      })
    const result = this.queue.then(run, run)
    this.queue = result.catch(() => {})
    return result
  }

  dispose() {
    this.worker.terminate()
  }
}
