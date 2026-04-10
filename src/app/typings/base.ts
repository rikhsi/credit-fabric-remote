import { HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';

export type FunctionType<T = string | number | boolean | null> = (value?: T) => void;

export type HttpOption = {
  headers?: HttpHeaders | Record<string, string | string[]>;
  context?: HttpContext;
  observe?: 'body';
  params?: HttpParams | Record<string, string | number | boolean | ReadonlyArray<string | number | boolean>>;
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
  transferCache?:
    | {
        includeHeaders?: string[];
      }
    | boolean;
};

export interface BaseFileItem {
  fileContent: string;
  fileId: string;
  fileName: string;
}

export type Scale = 'none' | 'thousand' | 'million' | 'billion';
