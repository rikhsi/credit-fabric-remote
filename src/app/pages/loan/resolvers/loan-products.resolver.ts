import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { ProductItem } from '@api/models/los/product';
import { LoanProductsService } from '../services/loan-products.service';

export const loanProductsResolver: ResolveFn<ProductItem[]> = () => inject(LoanProductsService).load$();
