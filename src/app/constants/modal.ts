import { ModalOptions } from 'ng-zorro-antd/modal';
import { ConfirmModal } from '@typings';
import { ModalConfirmComponent } from '@shared/components';

export const LOGOUT_MODAL_DATA: ModalOptions<ModalConfirmComponent, ConfirmModal, boolean> = {
  nzTitle: null,
  nzWidth: 'auto',
  nzFooter: null,
  nzClosable: false,
  nzCentered: true,
  nzData: {
    title: 'modal.confirm.title',
    description: 'modal.confirm.desc',
    cancel: {
      title: 'action.cancel',
      danger: true,
    },
    submit: {
      title: 'action.submit',
      danger: false,
    },
  },
};
