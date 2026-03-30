export interface BaseModal {
  title: string;
  description: string;
}

export interface ModalButtonBase {
  title: string;
  danger: boolean;
  disabled?: boolean;
}

export interface ConfirmModal extends BaseModal {
  cancel: ModalButtonBase;
  submit: ModalButtonBase;
}
