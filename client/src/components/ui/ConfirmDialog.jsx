import Modal from './Modal.jsx';
import Button from './Button.jsx';
export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', description = 'This action cannot be undone.', confirmLabel = 'Confirm', cancelLabel = 'Cancel', loading = false, danger = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<><Button variant="ghost" onClick={onClose}>{cancelLabel}</Button><Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>{confirmLabel}</Button></>}>
      <p className="tj-confirm-copy">{description}</p>
    </Modal>
  );
}
