import { afterEach, describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { useRacingStore } from '@/stores/racing'
import App from '../App.vue'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('App', () => {
  it('shows the roster and an empty schedule on first load', () => {
    const wrapper = mount(App, { global: { plugins: [createPinia()] } })

    expect(wrapper.get('main h1').text()).toBe('Horse Racing')
    expect(wrapper.findAll('tbody tr')).toHaveLength(20)
    expect(wrapper.get('[role="status"]').text()).toBe('No schedule generated')
    expect(wrapper.find('[aria-label="Scheduled rounds"]').exists()).toBe(false)
  })

  it('renders and replaces the generated schedule while preserving the horse list', async () => {
    const pinia = createPinia()
    const wrapper = mount(App, { global: { plugins: [pinia] } })
    const store = useRacingStore(pinia)
    const roster = wrapper.get('table').text()
    vi.spyOn(Math, 'random').mockReturnValue(0)

    await wrapper.get('button').trigger('click')

    expect(wrapper.get('[role="status"]').text()).toBe('6 rounds · 10 horses per round')
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
})
