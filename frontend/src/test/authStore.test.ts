import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '../stores/authStore'

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store state between tests
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      walletConnected: false,
    })
  })

  it('has correct initial state', () => {
    const { result } = renderHook(() => useAuthStore())
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.walletConnected).toBe(false)
  })

  it('disconnectWallet clears auth state', () => {
    useAuthStore.setState({
      user: { id: '1', publicKey: 'pk', isKycVerified: false },
      isAuthenticated: true,
      walletConnected: true,
    })

    const { result } = renderHook(() => useAuthStore())
    act(() => result.current.disconnectWallet())

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.walletConnected).toBe(false)
  })

  it('updateUser merges user data', () => {
    useAuthStore.setState({
      user: { id: '1', publicKey: 'pk', isKycVerified: false },
      isAuthenticated: true,
      walletConnected: true,
    })

    const { result } = renderHook(() => useAuthStore())
    act(() => result.current.updateUser({ name: 'Alice', isKycVerified: true }))

    expect(result.current.user?.name).toBe('Alice')
    expect(result.current.user?.isKycVerified).toBe(true)
    expect(result.current.user?.publicKey).toBe('pk')
  })

  it('connectWallet throws when Freighter not available', async () => {
    // Ensure window.freighters is undefined
    delete (window as any).freighters

    const { result } = renderHook(() => useAuthStore())
    await expect(act(() => result.current.connectWallet())).rejects.toThrow('Freighter wallet not found')
  })
})
