'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import useSWR, { mutate } from 'swr'

interface CartContextType {
  cartCount: number
  refreshCart: () => void
}

const CartContext = createContext<CartContextType>({ cartCount: 0, refreshCart: () => {} })

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('userToken') : null
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then(r => r.json())
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data, mutate: mutateCart } = useSWR('/api/cart', fetcher, { refreshInterval: 0 })

  const cartCount = data?.items?.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) ?? 0

  const refreshCart = useCallback(() => {
    mutateCart()
  }, [mutateCart])

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
