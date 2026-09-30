import { Routes } from '@angular/router';
import { SigningDocumentsService } from './services';
import { LoanLayout } from '@layouts/views';
import { RouteParam } from '@app/constants/route-param';

export const routes: Routes = [
  {
    path: '',
    // Shared between list and detail so the detail can reuse the loaded document meta.
    providers: [SigningDocumentsService],
    children: [
      {
        path: '',
        component: LoanLayout,
        data: { title: 'documents.title' },
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/documents-list/documents-list').then((c) => c.DocumentsList),
          },
        ],
      },
      {
        // Full-screen PDF viewer (outside LoanLayout, same as the previous /document page).
        path: `:${RouteParam.AppId}/:${RouteParam.DocId}`,
        loadComponent: () => import('./pages/document-detail/document-detail').then((c) => c.DocumentDetail),
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
