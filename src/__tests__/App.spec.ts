import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders the application shell', () => {
    const wrapper = mount(App)
    expect(wrapper.get('main h1').text()).toBe('Horse Racing')
  })
})
