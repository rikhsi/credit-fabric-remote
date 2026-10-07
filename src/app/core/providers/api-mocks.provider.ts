import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { MockOnlineApiService } from '../../api/mocks/mock-online-api.service';
import { MockSignedDocumentApiService } from '../../api/mocks/mock-signed-document-api.service';
import { MockBridgeService } from '../../api/mocks/mock-bridge.service';
import { MockProductApiService } from '../../api/mocks/mock-product-api.service';
import { MockHBranchApiService } from '../../api/mocks/mock-h-branch-api.service';
import { MockHCityApiService } from '../../api/mocks/mock-h-city-api.service';
import { MockHVillageApiService } from '../../api/mocks/mock-h-village-api.service';
import { MockHCompanyApiService } from '../../api/mocks/mock-h-company-api.service';
import { MockHAddressApiService } from '../../api/mocks/mock-h-address-api.service';
import { MockHFamilyRelationshipApiService } from '../../api/mocks/mock-h-family-relationship-api.service';
import { BridgeService } from '@core/services/bridge.service';
import {
  HAddressApiService,
  HBranchApiService,
  HCityApiService,
  HCompanyApiService,
  HFamilyRelationshipApiService,
  HVillageService,
} from '@api/controllers/handbooks';
import { OnlineApiService, ProductApiService, SignedDocumentApiService } from '@api/controllers/los';
import { environment } from 'src/environments/development';

/** Swap real HTTP API services for in-memory mocks when `environment.mock` is on. */
export function provideApiMocks(): EnvironmentProviders {
  if (!environment.mock) {
    return makeEnvironmentProviders([]);
  }

  return makeEnvironmentProviders([
    { provide: OnlineApiService, useClass: MockOnlineApiService },
    { provide: SignedDocumentApiService, useClass: MockSignedDocumentApiService },
    { provide: BridgeService, useClass: MockBridgeService },
    { provide: ProductApiService, useClass: MockProductApiService },
    { provide: HBranchApiService, useClass: MockHBranchApiService },
    { provide: HCityApiService, useClass: MockHCityApiService },
    { provide: HVillageService, useClass: MockHVillageApiService },
    { provide: HCompanyApiService, useClass: MockHCompanyApiService },
    { provide: HAddressApiService, useClass: MockHAddressApiService },
    { provide: HFamilyRelationshipApiService, useClass: MockHFamilyRelationshipApiService },
  ]);
}
