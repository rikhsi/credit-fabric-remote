export interface PaymentGetImportsAllReq {
    page:        number;
    size:        number;
    fromDocDate: string | null;
    toDocDate:   string | null;
    status:      string | null;
    statuses: string[];
    search:      string | null;
    sortBy:PaymentGetImportsAllSortBy | null;
    sortDirection:'ASC'|'DESC' | null
}
export type PaymentGetImportsAllSortBy = 'AUTHOR_FULL_NAME'| 'DOWNLOAD_TIME'| 'ALL_DATA' |'SUCCESS_DATA'| 'ERROR_DATA'|'AMOUNT'

export interface PaymentGetImportsAllRes {
    totalElements:    number;
    totalPages:       number;
    pageable:         PaymentGetImportsAllPageable;
    numberOfElements: number;
    size:             number;
    content:          PaymentGetImportsAllContent[];
    number:           number;
    sort:             Sort;
    first:            boolean;
    last:             boolean;
    empty:            boolean;
}

export interface PaymentGetImportsAllContent {
     id:                   number;
    fileId:               string;
    fileName:             string;
    fileHashName:string;
    docDate:              number;
    downloadTime:         string;
    allData:              string;
    successData:          string;
    errorData:            string;
    status:               PaymentGetImportsAllContentStatus;
    errorMessage:         null;
    transactionGroupUuid: string;
    author:               PaymentGetImportsAllContentAuthor;
    amount:               PaymentGetImportsAllContentAmount;
}

export interface PaymentGetImportsAllContentStatus {
    code: string;
    title: string;
    logo: string;
}


export interface PaymentGetImportsAllContentAmount {
    amount:   number;
    scale:    number;
    currency: string;
    logo:     PaymentGetImportsAllContentLogo;
}

export interface PaymentGetImportsAllContentLogo {
    contentType: string;
    path:        string;
    name:        string;
    ext:         string;
}

export interface PaymentGetImportsAllContentAuthor {
    authorUuid:      string;
    authorUsername:  string;
    authorFirstName: string;
    authorLastName:  string;
}


export interface PaymentGetImportsAllPageable {
    paged:      boolean;
    unpaged:    boolean;
    pageNumber: number;
    pageSize:   number;
    offset:     number;
    sort:       Sort;
}

export interface Sort {
    unsorted: boolean;
    sorted:   boolean;
    empty:    boolean;
}



export interface GetPaymentImportFileErrorRes {
    attachmentId: string;
    downloadUrl:  string;
    previewUrl:   string;
}


export interface GetPaymentImportFileDataRes {
     totalPages:       number;
    totalElements:    number;
    pageable:         GetPaymentImportFileDataResPageable;
    numberOfElements: number;
    size:             number;
    content:          GetPaymentImportFileDataResContent[];
    number:           number;
    sort:             Sort;
    first:            boolean;
    last:             boolean;
    empty:            boolean;
}

export interface GetPaymentImportFileDataResPageable {
    paged:      boolean;
    unpaged:    boolean;
    pageNumber: number;
    pageSize:   number;
    offset:     number;
    sort:       Sort;
}


export interface GetPaymentImportFileDataResContent {
     id:              string;
    transactionId:   string;
    docNum:          string;
    senderAmount:    ErAmount;
    senderName:      string;
    senderAccount:   string;
    senderTax:       string;
    receiverAmount:  ErAmount;
    receiverName:    string;
    receiverAccount: string;
    receiverTax:     string;
    receiverMfo:     string;
    purpose:         Purpose;
    docDate:         number;
    documentDate:    string;
    type:            string;
    description:     string;
    errorMessage:    string;
    errorRowMessage: ErrorRowMessage;
    fileType:        string;
    transactionParentUuid:string
    status:GetPaymentImportFileDataResContentStatus
}
export interface GetPaymentImportFileDataResContentStatus {
    code: string;
    title: string;
    logo: string;
}
export interface GetPaymentImportFileDataReq {
    page: number,
    size: number,
    fileId: number,
    isError?: boolean,
    search: string,
    statuses: string[],
    fromAmount: number | null,
    toAmount: number | null,
    isSignable?:boolean
}
export interface ErrorRowMessage {
    additionalProp1: string;
    additionalProp2: string;
    additionalProp3: string;
}

export interface Purpose {
    code: string;
    name: string;
}

export interface ErAmount {
    amount:   number;
    scale:    number;
    currency: string;
    logo:     Logo;
}

export interface Logo {
    contentType: string;
    path:        string;
    name:        string;
    ext:         string;
}


export interface UploadState{
  isUploading: boolean;
  fileName: string;
  progress: number;
}