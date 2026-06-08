import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (request, next) => {
  
  return next(request).pipe(
    catchError((error) => {


      let errorMessage = 'Произошла ошибка. Повторите попытку позже.';

      if (error.status === 502) {
        errorMessage = 'Сервер временно недоступен (502). Повторите попытку позже.';
      } else if (error.status === 500) {
        errorMessage = 'Внутренняя ошибка сервера (500). Повторите попытку позже.';
      } else if (error.status === 400) {
        if (error && error.error && error.error.result && error.error.result.message) {
          errorMessage = error.error.result.message;
        }
      }
      error.userMessage = errorMessage;
      (error as any).requestMethod = request.method; 
      return throwError(() => error);
    })
  );
};
