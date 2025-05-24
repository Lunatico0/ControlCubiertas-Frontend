import Swal from 'sweetalert2';

export const showToast = (type = 'success', message = 'Operación realizada') => {
  const isDark = document.documentElement.classList.contains('dark');

  const config = {
    toast: true,
    position: 'top-end',
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    background: isDark ? '#1f2937' : '#f0fdf4',
    color: isDark ? '#d1fae5' : '#065f46',
  };

  if (type === 'error') {
    config.background = isDark ? '#7f1d1d' : '#fef2f2';
    config.color = isDark ? '#fee2e2' : '#991b1b';
  }

  Swal.fire(config);
};
