import { renderHook } from '@wagmi/test/react'
import { expect, test, vi } from 'vitest'

import { useConfig } from './useConfig.js'

test('mounts', () => {
  const { result } = renderHook(() => useConfig())
  expect(result.current).toBeDefined()
})

test('behavior: throws when not inside Provider', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})

  try {
    renderHook(() => useConfig(), {
      wrapper: undefined,
    })
  } catch (error) {
    expect(error).toMatchInlineSnapshot(
      `
      [WagmiProviderNotFoundError: \`useConfig\` must be used within \`WagmiProvider\`.

      Docs: https://wagmi.sh/react/api/WagmiProvider.html
      Version: wagmi@x.y.z]
    `,
    )
  }
})
