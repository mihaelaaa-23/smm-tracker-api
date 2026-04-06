import { useState } from 'react'

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  variant?: 'danger' | 'warning'
}

export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean
    options: ConfirmOptions
    resolve: ((value: boolean) => void) | null
  }>({
    open: false,
    options: { title: '', message: '' },
    resolve: null,
  })

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setState({ open: true, options, resolve })
    })
  }

  const handleConfirm = () => {
    state.resolve?.(true)
    setState(s => ({ ...s, open: false }))
  }

  const handleCancel = () => {
    state.resolve?.(false)
    setState(s => ({ ...s, open: false }))
  }

  return {
    confirm,
    dialogProps: {
      ...state.options,
      open: state.open,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
  }
}