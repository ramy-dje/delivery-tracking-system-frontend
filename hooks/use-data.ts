'use client'

import { useState, useEffect } from 'react'

export function useData<T extends { id?: string }>(key: string, initialData: T[] = []) {
  const [data, setData] = useState<T[]>(initialData)
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`dashboard_${key}`)
      if (stored) {
        setData(JSON.parse(stored))
      }
    } catch (error) {
      console.error(`Failed to load ${key}:`, error)
    } finally {
      setIsLoading(false)
    }
  }, [key])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(`dashboard_${key}`, JSON.stringify(data))
      } catch (error) {
        console.error(`Failed to save ${key}:`, error)
      }
    }
  }, [data, key, isLoading])

  const add = (item: T) => {
    const newItem = {
      ...item,
      id: item.id || `${key}_${Date.now()}`,
    }
    setData((prev) => [...prev, newItem])
    return newItem
  }

  const update = (id: string, item: Partial<T>) => {
    setData((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...item, id: p.id } : p))
    )
  }

  const remove = (id: string) => {
    setData((prev) => prev.filter((p) => p.id !== id))
  }

  const getById = (id: string) => {
    return data.find((p) => p.id === id)
  }

  return {
    data,
    isLoading,
    add,
    update,
    remove,
    getById,
  }
}
