import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { generateHorses } from '@/domain/horse'
import { generateSchedule } from '@/domain/schedule'
import type { RoundProgress } from '@/domain/simulation'
import RaceTrack from '../RaceTrack.vue'

function fixture() {
  const horses = generateHorses(() => 0.5)
  const rounds = generateSchedule(horses, () => 0)
  return { horses, round: rounds[0]! }
}

describe('RaceTrack', () => {
  it('shows an empty state before schedule generation', () => {
    const wrapper = mount(RaceTrack, { props: { round: null, horses: [], progress: null } })

    expect(wrapper.text()).toContain('Generate a schedule to line up the horses.')
    expect(wrapper.findAll('[role="progressbar"]')).toHaveLength(0)
  })

  it('previews the selected participants at the start with accessible lane labels', () => {
    const { horses, round } = fixture()
    const wrapper = mount(RaceTrack, { props: { round, horses, progress: null } })
    const lanes = wrapper.findAll('[aria-label="Race lanes"] > li')

    expect(lanes).toHaveLength(10)
    expect(wrapper.text()).toContain('Round 1 · 1200 m')
    expect(lanes[0]?.text()).toContain('Horse 01')
    expect(lanes[9]?.text()).toContain('Horse 10')
    for (const lane of lanes) {
      const bar = lane.get('[role="progressbar"]')
      expect(bar.attributes('aria-valuenow')).toBe('0')
      expect(bar.attributes('aria-valuetext')).toBe('0 of 1200 meters')
      expect(lane.get('.runner-position').attributes('style')).toContain('translateX(0%)')
    }
    expect(lanes[0]?.get('[role="progressbar"]').attributes('aria-label')).toBe(
      'Horse 01 race progress',
    )
    expect(lanes[0]?.get('.runner-position').attributes('style')).toContain(
      'color: rgb(220, 38, 38)',
    )
  })

  it('resolves progress by horse ID and places markers at the correct fraction of distance', () => {
    const { horses, round } = fixture()
    const progress: RoundProgress = {
      runners: [
        { horseId: 'horse-02', distance: 1200, finished: true },
        { horseId: 'horse-01', distance: 600, finished: false },
      ],
      isComplete: false,
      results: [],
    }
    const wrapper = mount(RaceTrack, { props: { round, horses, progress } })
    const lanes = wrapper.findAll('[aria-label="Race lanes"] > li')

    expect(lanes[0]?.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('50')
    expect(lanes[0]?.get('.runner-position').attributes('style')).toContain('translateX(50%)')
    expect(lanes[1]?.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('100')
    expect(lanes[1]?.text()).toContain('Finished')
    expect(lanes[2]?.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('0')
  })

  it('updates positions and resets the lanes when the displayed round changes', async () => {
    const { horses, round } = fixture()
    const wrapper = mount(RaceTrack, { props: { round, horses, progress: null } })
    await wrapper.setProps({
      progress: {
        runners: round.horseIds.map((horseId) => ({ horseId, distance: 1200, finished: true })),
        isComplete: true,
        results: [],
      },
    })
    expect(wrapper.findAll('[aria-valuenow="100"]')).toHaveLength(10)

    await wrapper.setProps({
      round: { number: 2, distance: 1400, horseIds: [...round.horseIds].reverse() },
      progress: null,
    })

    expect(wrapper.text()).toContain('Round 2 · 1400 m')
    expect(wrapper.findAll('[aria-valuenow="0"]')).toHaveLength(10)
    expect(wrapper.get('[aria-label="Race lanes"] > li').text()).toContain('Horse 10')
  })

  it('keeps markers within the course bounds', () => {
    const { horses, round } = fixture()
    const wrapper = mount(RaceTrack, {
      props: {
        round,
        horses,
        progress: {
          runners: [
            { horseId: 'horse-01', distance: -10, finished: false },
            { horseId: 'horse-02', distance: 1300, finished: true },
          ],
          isComplete: false,
          results: [],
        },
      },
    })
    const bars = wrapper.findAll('[role="progressbar"]')
    expect(bars[0]?.attributes('aria-valuenow')).toBe('0')
    expect(bars[1]?.attributes('aria-valuenow')).toBe('100')
  })
})
