import { watch } from 'vue'
import { useRacingStore } from '@/stores/racing'

const ROUND_PLAYBACK_SECONDS = 8

export function useRaceClock() {
  const racing = useRacingStore()

  function advancePlayback(realSeconds: number) {
    let remaining = realSeconds
    while (remaining > 0 && racing.status === 'running' && racing.activeRound) {
      const duration = Math.max(...racing.activeRound.runners.map((runner) => runner.finishTime))
      const simulationPerSecond = duration / ROUND_PLAYBACK_SECONDS
      const simulationRemaining = duration - racing.elapsedSeconds
      const realRemaining = simulationRemaining / simulationPerSecond

      if (remaining < realRemaining) {
        racing.advanceRace(remaining * simulationPerSecond)
        return
      }

      // Finish exactly at the boundary, then recalculate the next round's playback scale.
      racing.advanceRace(simulationRemaining)
      remaining -= realRemaining
    }
  }

  watch(
    () => racing.status === 'running',
    (running, _, onCleanup) => {
      if (!running) return

      let previousTimestamp: number | undefined
      let frameId: number

      function tick(timestamp: number) {
        if (previousTimestamp !== undefined) {
          advancePlayback(Math.max(0, timestamp - previousTimestamp) / 1000)
        }
        previousTimestamp = timestamp
        if (racing.status === 'running') frameId = requestAnimationFrame(tick)
      }

      frameId = requestAnimationFrame(tick)
      onCleanup(() => cancelAnimationFrame(frameId))
    },
    { immediate: true, flush: 'sync' },
  )
}
