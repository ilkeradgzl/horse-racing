import { afterEach, describe, it, expect, vi } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { useRacingStore } from '@/stores/racing'
import App from '../App.vue'

enableAutoUnmount(afterEach)

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('shows the roster and an empty schedule on first load', () => {
    const wrapper = mount(App, { global: { plugins: [createPinia()] } })

    expect(wrapper.get('main h1').text()).toBe('Horse Racing')
    expect(wrapper.findAll('tbody tr')).toHaveLength(20)
    expect(wrapper.get('[aria-label="Schedule status"]').text()).toBe('No schedule generated')
    expect(wrapper.find('[aria-label="Scheduled rounds"]').exists()).toBe(false)
  })

  it('renders and replaces the generated schedule while preserving the horse list', async () => {
    const pinia = createPinia()
    const wrapper = mount(App, { global: { plugins: [pinia] } })
    const store = useRacingStore(pinia)
    const roster = wrapper.get('table').text()
    vi.spyOn(Math, 'random').mockReturnValue(0)

    await wrapper.get('button').trigger('click')

    expect(wrapper.get('[aria-label="Schedule status"]').text()).toBe(
      '6 rounds · 10 horses per round',
    )
    const rounds = wrapper.findAll('[aria-label="Scheduled rounds"] > li')
    expect(rounds).toHaveLength(6)
    expect(rounds.map((round) => round.get('h3').text())).toEqual([
      'Round 1',
      'Round 2',
      'Round 3',
      'Round 4',
      'Round 5',
      'Round 6',
    ])
    for (const [index, round] of rounds.entries()) {
      expect(round.text()).toContain(`${1200 + index * 200} m`)
      const names = round.findAll('ol > li').map((participant) => participant.text())
      expect(names).toEqual(
        store.rounds[index]?.horseIds.map(
          (id) => store.horses.find((horse) => horse.id === id)?.name,
        ),
      )
      expect(names).toHaveLength(10)
    }
    const firstParticipants = rounds[0]?.text()

    vi.mocked(Math.random).mockReturnValue(1 - Number.EPSILON)
    await wrapper.get('button').trigger('click')

    expect(wrapper.findAll('[aria-label="Scheduled rounds"] > li')).toHaveLength(6)
    expect(wrapper.get('[aria-label="Scheduled rounds"] > li').text()).not.toBe(firstParticipants)
    expect(wrapper.get('table').text()).toBe(roster)
  })

  it('connects controls, preserves progress when paused, and displays completed results', async () => {
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn(() => 1),
    )
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    const pinia = createPinia()
    const wrapper = mount(App, { global: { plugins: [pinia] } })
    const store = useRacingStore(pinia)
    const button = (name: string) => wrapper.findAll('button').find((item) => item.text() === name)!

    expect(button('Start').attributes('disabled')).toBeDefined()
    await button('Generate schedule').trigger('click')
    expect(button('Start').attributes('disabled')).toBeUndefined()
    await button('Start').trigger('click')
    expect(wrapper.get('[aria-label="Race status"]').text()).toContain('Round 1 of 6 is running')
    expect(button('Generate schedule').attributes('disabled')).toBeDefined()
    store.advanceRace(10)
    await button('Pause').trigger('click')
    const elapsed = store.elapsedSeconds
    expect(store.status).toBe('paused')
    expect(wrapper.get('[aria-label="Race status"]').text()).toContain('paused')
    expect(button('Generate schedule').attributes('disabled')).toBeDefined()
    await button('Resume').trigger('click')
    expect(store.elapsedSeconds).toBe(elapsed)
    store.advanceRace(
      Math.max(...store.activeRound!.runners.map((runner) => runner.finishTime)) - elapsed,
    )
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('[aria-label="Completed rounds"] > li')).toHaveLength(1)
    expect(wrapper.get('table caption').text()).toBe('Available horses')
    const resultRows = wrapper.findAll('[aria-label="Completed rounds"] tbody tr')
    expect(resultRows).toHaveLength(10)
    expect(resultRows[0]?.text()).toContain(
      store.completedRounds[0]!.results[0]!.finishTime.toFixed(2),
    )
    expect(resultRows[0]?.text()).toContain(
      store.horses.find((horse) => horse.id === store.completedRounds[0]!.results[0]!.horseId)!
        .name,
    )
    store.advanceRace(10000)
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('[aria-label="Completed rounds"] > li')).toHaveLength(6)
    expect(wrapper.get('[aria-label="Race status"]').text()).toBe('All 6 rounds completed.')
    expect(button('Start').attributes('disabled')).toBeDefined()
    await button('Generate schedule').trigger('click')
    expect(wrapper.find('[aria-label="Completed rounds"]').exists()).toBe(false)
    expect(button('Start').attributes('disabled')).toBeUndefined()
  })
})
