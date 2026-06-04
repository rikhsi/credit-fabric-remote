/** Локально: ng serve + proxy.conf.json → https://dev-new.sme-kk.hamkor.local */
export const environment = {
  coreUrl: '/api/v1/core-sme/',
  losUrl: '/api/v1/los-sme/',
  handbookUrl: '/handbooks/api/v1/los-sme/',
  apiKey: 'eyJvcmciOiIxIiwiaWQiOiIzMWUyY2U2ZmI0YzQ0OGE3ODg0NzE5ZmU4ZWQ1MjI4NSIsImgiOiJzaGEyNTYifQ==',
  ablePlatform: 'los-sme',
  projectTag: 'kk-sme',
  deviceType: 'vebview',
  user: {
    pinfl: '40109893780016',
    phone: '990710358',
    email: 'rikhsimboyev1997@gmail.com',
    name: 'Omonbek',
    theme: 'dark',
    lon: 0,
    lat: 0,
    language: 'ru',
  },
  skipAuth: false,
};
