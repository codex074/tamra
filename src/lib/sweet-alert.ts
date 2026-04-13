import Swal, { type SweetAlertIcon } from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const baseOptions = {
  background: '#FFFFFF',
  color: '#1C2B33',
  confirmButtonColor: '#0064E0',
  cancelButtonColor: '#5D6C7B',
  reverseButtons: true,
  focusCancel: true,
};

export async function confirmAction(options: {
  title: string;
  text: string;
  confirmButtonText: string;
  cancelButtonText?: string;
  icon?: SweetAlertIcon;
}): Promise<boolean> {
  const result = await Swal.fire({
    ...baseOptions,
    icon: options.icon ?? 'question',
    title: options.title,
    text: options.text,
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText,
    cancelButtonText: options.cancelButtonText ?? 'ยกเลิก',
  });

  return result.isConfirmed;
}

export async function showSuccessAlert(title: string, text: string): Promise<void> {
  await Swal.fire({
    ...baseOptions,
    icon: 'success',
    title,
    text,
    confirmButtonText: 'ตกลง',
  });
}

export async function showErrorAlert(title: string, text: string): Promise<void> {
  await Swal.fire({
    ...baseOptions,
    icon: 'error',
    title,
    text,
    confirmButtonText: 'ปิด',
  });
}
