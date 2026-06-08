export function generateUUID(): string {
  return crypto.randomUUID();
}

export function getAuthFlowId() :string {
    return sessionStorage.getItem('auth_flow_id') || '';
}
export function setAuthFlowId(uuid:string) {
    sessionStorage.setItem('auth_flow_id',uuid);
}

export function removeAuthFlowId() {
    sessionStorage.removeItem('auth_flow_id')
}

export function getUserId() :string {
    if(isUserDataAfterUserCheckExist()) {
        let user = JSON.parse(sessionStorage.getItem('userDataAfterUserCheck')!)
        return user.hashedUserId;
    }
    return '';
}

export function isUserDataAfterUserCheckExist() :boolean {
    let user = sessionStorage.getItem('userDataAfterUserCheck');
    return !!user;
}

export function removeUserDataAfterUserCheck() {
    sessionStorage.removeItem('userDataAfterUserCheck')
}


export function getHashedBusinessId() :string {
    return JSON.parse(localStorage.getItem('businessInfo') || '{}')?.['hashedBusinessId'] || '';
}