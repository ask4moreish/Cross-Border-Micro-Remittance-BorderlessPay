import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  publicKey: string
  email?: string
  name?: string
  isKycVerified: boolean
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  walletConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  initializeAuth: () => void
  updateUser: (userData: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      walletConnected: false,

      connectWallet: async () => {
        set({ isLoading: true })
        try {
          // Check if Freighter is available
          if (!window.freighters) {
            throw new Error('Freighter wallet not found. Please install Freighter extension.')
          }

          // Get public key from Freighter
          const publicKey = await window.freighters.getPublicKey()
          
          if (!publicKey) {
            throw new Error('Failed to get public key from wallet')
          }

          const user: User = {
            id: publicKey,
            publicKey,
            isKycVerified: false,
          }

          set({
            user,
            isAuthenticated: true,
            walletConnected: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      disconnectWallet: () => {
        set({
          user: null,
          isAuthenticated: false,
          walletConnected: false,
        })
      },

      initializeAuth: async () => {
        const { user } = get()
        if (user) {
          try {
            // Verify wallet is still connected
            if (window.freighters) {
              const publicKey = await window.freighters.getPublicKey()
              if (publicKey === user.publicKey) {
                set({ walletConnected: true, isAuthenticated: true })
              } else {
                get().disconnectWallet()
              }
            }
          } catch (error) {
            get().disconnectWallet()
          }
        }
      },

      updateUser: (userData: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, ...userData },
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        walletConnected: state.walletConnected,
      }),
    }
  )
)

// Type declarations for Freighter API
declare global {
  interface Window {
    freighters?: {
      getPublicKey: () => Promise<string>
      signTransaction: (xdr: string, network?: string) => Promise<string>
      isSigned: (xdr: string) => Promise<boolean>
      getNetwork: () => Promise<string>
    }
  }
}
