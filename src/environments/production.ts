/** На стенде: тот же origin, что и фронт (intcorp / prod gateway) */
export const environment = {
  coreUrl: '/sme-kk/api/v1/core-sme/',
  losUrl: '/sme-kk/api/v1/los-sme/',
  handbookUrl: '/sme-kk/handbooks/api/v1/los-sme/',
  apiKey: 'eyJvcmciOiIxIiwiaWQiOiIzMWUyY2U2ZmI0YzQ0OGE3ODg0NzE5ZmU4ZWQ1MjI4NSIsImgiOiJzaGEyNTYifQ==',
  ablePlatform: 'los-sme',
  projectTag: 'kk-sme',
  deviceType: 'vebview',
  user: {
    pinfl: '',
    phone: '',
    email: '',
    name: '',
    theme: '',
    lon: 0,
    lat: 0,
    language: '',
  },
  skipAuth: true,
};
