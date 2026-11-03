import Swal from 'sweetalert2'

export const AppAlert = Swal.mixin({
  width: 440,
  padding: '1.75rem',
  heightAuto: false,
  buttonsStyling: false,
  confirmButtonText: 'OK',
  customClass: {
    popup: 'app-alert-popup',
    title: 'app-alert-title',
    htmlContainer: 'app-alert-description',
    confirmButton: 'app-alert-confirm',
    cancelButton: 'app-alert-cancel',
    actions: 'app-alert-actions',
  },
})
