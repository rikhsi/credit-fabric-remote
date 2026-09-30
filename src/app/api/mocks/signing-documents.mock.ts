import { MockApplicationId } from './applications.mock';
import { SigningDocumentsResult } from '@api/models/los/signing-document';

const MOCK_PINFL = '52001016860016';

/** Documents waiting for the client signature (mutated by the mock API after signing). */
export const MOCK_SIGNING_DOCUMENTS: SigningDocumentsResult = {
  code: '0',
  message: 'OK',
  requestId: 'mock-signing-documents',
  organization: {
    inn: '302638303',
    pinfl: MOCK_PINFL,
  },
  applications: [
    {
      applicationId: String(MockApplicationId.OnDesign),
      applicationNumber: String(MockApplicationId.OnDesign),
      documents: [
        // Same ids as `docsUnsigned` in applications.mock so the application detail opens the same documents.
        {
          documentId: '101',
          documentName: 'Протокол решения № 101',
          documentType: 'LOAN_DECISION',
          signers: [{ pinfl: MOCK_PINFL, role: 'DIRECTOR' }],
          signingTypes: ['ONLINE'],
        },
        {
          documentId: '102',
          documentName: 'Кредитный договор № 102',
          documentType: 'LOAN_AGREEMENT',
          signers: [
            { pinfl: MOCK_PINFL, role: 'DIRECTOR' },
            { pinfl: '30101850550011', role: 'ACCOUNTANT' },
          ],
          signingTypes: ['ONLINE', 'OFFLINE'],
        },
      ],
    },
    {
      applicationId: String(MockApplicationId.OnDecisionOne),
      applicationNumber: String(MockApplicationId.OnDecisionOne),
      documents: [
        {
          documentId: '301',
          documentName: 'Протокол решения № 301',
          documentType: 'LOAN_DECISION',
          signers: [{ pinfl: MOCK_PINFL, role: 'DIRECTOR' }],
          signingTypes: ['ONLINE'],
        },
      ],
    },
  ],
};

/** Minimal single-page PDF (generated) used as `contentBase64` for every mock document. */
export const MOCK_SIGNING_DOCUMENT_CONTENT_BASE64 =
  'JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvQ29udGVudHMgNCAwIFIgL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgNSAwIFIgPj4gPj4gPj4KZW5kb2JqCjQgMCBvYmoKPDwgL0xlbmd0aCAyNDQgPj4Kc3RyZWFtCkJUIC9GMSAyMCBUZiA3MiA3MjAgVGQgKEhhbWtvcmJhbmsgLSBNb2NrIHNpZ25pbmcgZG9jdW1lbnQpIFRqIEVUCkJUIC9GMSAxMiBUZiA3MiA2OTAgVGQgKEFwcGxpY2F0aW9uOiA4NDU3OTIpIFRqIEVUCkJUIC9GMSAxMiBUZiA3MiA2NzIgVGQgKERvY3VtZW50OiBMT0FOX0FHUkVFTUVOVCkgVGogRVQKQlQgL0YxIDEyIFRmIDcyIDY0MCBUZCAoVGhpcyBQREYgaXMgZ2VuZXJhdGVkIGZvciBVSSBtb2NrcyBvbmx5LikgVGogRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8IC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYSA+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQxIDAwMDAwIG4gCjAwMDAwMDA1MzYgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA2IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgo2MDYKJSVFT0YK';
