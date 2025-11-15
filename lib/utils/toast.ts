import toast from 'react-hot-toast'

export const showSuccess = (message: string) => {
  return toast.success(message, {
    duration: 4000,
    position: 'top-right'
  })
}

export const showError = (message: string) => {
  return toast.error(message, {
    duration: 5000,
    position: 'top-right'
  })
}

export const showLoading = (message: string) => {
  return toast.loading(message, {
    position: 'top-right'
  })
}

export const showInfo = (message: string) => {
  return toast(message, {
    icon: 'ℹ️',
    duration: 4000,
    position: 'top-right'
  })
}

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId)
}
