'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type SaveState = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error'

export function useDebouncedSave(
  onSave: () => Promise<any>,
  delayMs: number = 1000
) {
  const [state, setState] = useState<SaveState>('idle')
  const timeoutRef = useRef<NodeJS.Timeout>()
  const abortRef = useRef<AbortController>()

  const triggerSave = useCallback(() => {
    setState('unsaved')

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      setState('saving')
      try {
        await onSave()
        setState('saved')

        // Reset to idle after 2 seconds
        setTimeout(() => {
          setState('idle')
        }, 2000)
      } catch (err) {
        setState('error')
        console.error('Save error:', err)

        // Retry after 3 seconds on error
        setTimeout(() => {
          setState('unsaved')
        }, 3000)
      }
    }, delayMs)
  }, [onSave, delayMs])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { state, triggerSave }
}
