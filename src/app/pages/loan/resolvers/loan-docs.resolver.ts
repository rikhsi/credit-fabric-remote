import { ResolveFn } from '@angular/router';

export const loanDocsResolver: ResolveFn<string[]> = ({ params: { loanId } }) => {
  switch (loanId) {
    default: {
      return ['Паспорт'];
    }
  }
};
