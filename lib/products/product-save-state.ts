export type ProductSaveState =
  | 'ready'
  | 'dirty'
  | 'saving'
  | 'saved'
  | 'failed'

export interface ProductSaveSnapshot {
  state: ProductSaveState
  dirty: boolean
  lastSavedAt: number | null
  error: string | null
}

export interface ProductSaveController {
  markDirty(): ProductSaveSnapshot
  startSaving(): ProductSaveSnapshot
  markSaved(): ProductSaveSnapshot
  markFailed(message: string): ProductSaveSnapshot
  reset(): ProductSaveSnapshot
}

export function createProductSaveController(
  initialState: ProductSaveState = 'ready',
): ProductSaveController {
  let snapshot: ProductSaveSnapshot = {
    state: initialState,
    dirty: initialState === 'dirty',
    lastSavedAt: null,
    error: null,
  }

  function update(
    next: ProductSaveSnapshot,
  ): ProductSaveSnapshot {
    snapshot = next
    return snapshot
  }

  return {
    markDirty() {
      return update({
        ...snapshot,
        state: 'dirty',
        dirty: true,
        error: null,
      })
    },

    startSaving() {
      return update({
        ...snapshot,
        state: 'saving',
        error: null,
      })
    },

    markSaved() {
      return update({
        ...snapshot,
        state: 'saved',
        dirty: false,
        lastSavedAt: Date.now(),
        error: null,
      })
    },

    markFailed(message) {
      return update({
        ...snapshot,
        state: 'failed',
        dirty: true,
        error: message,
      })
    },

    reset() {
      return update({
        state: 'ready',
        dirty: false,
        lastSavedAt: null,
        error: null,
      })
    },
  }
}
