import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-config';
import {
  ClaimDetail,
  ClaimSummary,
  DecideClaimRequest,
  RequestInformationRequest,
  RespondToInformationRequest,
  SubmitClaimRequest
} from '../models/claim.model';

@Injectable({ providedIn: 'root' })
export class ClaimsApiService {
  constructor(private readonly http: HttpClient) {}

  submitClaim(request: SubmitClaimRequest): Observable<ClaimDetail> {
    return this.http.post<ClaimDetail>(`${API_BASE_URL}/claims`, request);
  }

  getMyClaims(): Observable<ClaimSummary[]> {
    return this.http.get<ClaimSummary[]>(`${API_BASE_URL}/claims/mine`);
  }

  getUnassignedClaims(): Observable<ClaimSummary[]> {
    return this.http.get<ClaimSummary[]>(`${API_BASE_URL}/claims/unassigned`);
  }

  getOfficerWorkload(): Observable<ClaimSummary[]> {
    return this.http.get<ClaimSummary[]>(`${API_BASE_URL}/officers/me/claims`);
  }

  getClaimById(id: string): Observable<ClaimDetail> {
    return this.http.get<ClaimDetail>(`${API_BASE_URL}/claims/${id}`);
  }

  assignClaim(id: string): Observable<ClaimDetail> {
    return this.http.post<ClaimDetail>(`${API_BASE_URL}/claims/${id}/assign`, {});
  }

  requestInformation(id: string, request: RequestInformationRequest): Observable<ClaimDetail> {
    return this.http.post<ClaimDetail>(`${API_BASE_URL}/claims/${id}/information-requests`, request);
  }

  respondToInformationRequest(
    claimId: string,
    requestId: string,
    request: RespondToInformationRequest
  ): Observable<ClaimDetail> {
    return this.http.post<ClaimDetail>(
      `${API_BASE_URL}/claims/${claimId}/information-requests/${requestId}/respond`,
      request
    );
  }

  decide(id: string, request: DecideClaimRequest): Observable<ClaimDetail> {
    return this.http.post<ClaimDetail>(`${API_BASE_URL}/claims/${id}/decision`, request);
  }
}
