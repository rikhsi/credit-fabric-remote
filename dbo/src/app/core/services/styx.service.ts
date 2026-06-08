import {inject, Injectable} from '@angular/core';
import {environment} from "../../../environments/environment.prod";
import { HttpClient, HttpParams } from "@angular/common/http";
import {ParallelHasher} from "ts-md5";

@Injectable({
  providedIn: 'root'
})
export class StyxService {
  private _socketUrl = environment.ESP_SOCKET
  private _http = inject(HttpClient)
  magicSign(event: any) {
    let signData =  event.data
    let sData: any = null
    if (typeof signData === 'object') {
      sData = signData
    } else if (signData.indexOf('{') === 0) {
      sData = JSON.parse(signData)
    }
    if (sData !== null) {
      if (sData && 'signedMsg' in sData && sData.signedMsg) {
        return { status: true, message: sData.signedMsg }
      } else {
        return { status: false, message: 'Неверный ключ' }
      }
    } else {
      return { status: false, message: signData }
    }
  }
  toBase64(obj: any) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
  }
  magicFn(event: any) {
    let eData = event.data;
    let sData: any = null;

    if (typeof eData === 'object') {
      sData = eData;
    } else if (eData.indexOf('{') === 0) {
      sData = JSON.parse(eData);
    }

    if (sData !== null) {
      if ('certInfos' in sData && Array.isArray(sData.certInfos) && sData.certInfos.length > 0) {
        let infos: any[] = [];
        let thumbprintCurrent = '';
        let fullData = '';


        for (let cert of sData.certInfos) {
          if (!cert) continue;

          let fio = '';
          let company = '';
          let PINFL = '';
          let INN = '';
          let STREET = '';
          let SN = '';
          let L = '';
          let E = '';
          let C = '';

          if (cert.subject) {
            let spl = cert.subject.toString().split(',');
            for (let k = 0; k < spl.length; k++) {
              let spl2 = spl[k].toString().trim();
              let subs = spl2.substr(0, 3);
              let subs2 = spl2.substr(0, 2);
              let subsPinfill = spl2.substr(0, 8);
              let subsINN = spl2.substr(0, 6);
              let subsSTREET = spl2.substr(0, 7);

              if (subs === 'CN=') {
                fio = spl2.replace('CN=', '').replace(/"/g, '').trim();
              }
              if (subs === 'O=') {
                company = spl2.replace('O=', '').replace(/"/g, '').trim();
              }
              if (subsPinfill === 'uzPINFL=') {
                PINFL = spl2.replace('uzPINFL=', '');
              }
              if (subsINN === 'uzINN=') {
                INN = spl2.replace('uzINN=', '');
              }
              if (subsSTREET === 'STREET=') {
                STREET = spl2.replace('STREET=', '');
              }
              if (subs === 'SN=') {
                SN = spl2.replace('SN=', '').replace(/"/g, '').trim();
              }
              if (subs2 === 'L=') {
                L = spl2.replace('L=', '');
              }
              if (subs2 === 'E=') {
                E = spl2.replace('E=', '');
              }
              if (subs2 === 'C=') {
                C = spl2.replace('C=', '');
              }
            }
          }


          if (cert.thumbprint === this.clientThumb) {
            thumbprintCurrent = this.clientThumb;
            this.clientFio = fio;
          }


          fullData =
            'notafter:' + cert.notafter +
            ' notbefore:' + cert.notbefore +
            ' serialNumber:' + cert.serialnumber +
            ' thumbprint:' + cert.thumbprint +
            ' subject:' + cert.subject;

          infos.push({
            fio,
            company,
            PINFL,
            INN,
            STREET,
            SN,
            L,
            E,
            C,
            thumbprint: cert.thumbprint,
            serialnumber: cert.serialnumber,
            tokenSN: cert.tokenSN,
            notbefore: cert.notbefore,
            notafter: cert.notafter
          });
        }

        return {
          status: true,
          message: sData.signedMsg || 'Success',
          infos,
          thumbprintCurrent,
          fullData,
        };
      } else {
        return { status: false, message: 'Ключ не найден', infos: [], thumbprintCurrent: '', fullData: '' }
      }
    } else {
      return { status: false, message: eData, infos: [], thumbprintCurrent: '', fullData: '' }
    }
  }


  getInfo() {
    if (window.navigator.platform !== 'MacIntel') {
      return this.getInfoSocket()
    } else {
      return this.getInfoApi()
    }
  }

  getInfoApi() {
    let url = 'http://127.0.0.1:6210/crypto/getCertInfo'
    return this._http.post(url, null).toPromise().then(event => {
      return this.magicFn({ data: event })
    }).catch((e) => {
      return { status: false, message: 'Ключ не найден', infos: [], thumbprintCurrent: '' }
    });
  }

    getInfoSocket() {
      return new Promise((resolve) => {
        try {
          let wsok = new WebSocket(this._socketUrl);
          wsok.onopen = (data) => {
            let msg = JSON.stringify({ function: 'getCertInfo' });
            wsok.send(msg);
          }
          wsok.onmessage = (event) => {
            let result = this.magicFn(event)
            wsok.close()
            resolve(result)
          }
          wsok.onerror = (event) => {
            resolve({ status: false, message: 'Нет подлючения с Ключом', infos: [], thumbprintCurrent: '' })
          }
        } catch (e) {
          resolve({ status: false, message: 'Ключ не найден', infos: [], thumbprintCurrent: '' })
        }
      })
    }

  getCertificate(obj: { phone: string, inn: string, password: string, pin: string }) {
    const url = 'http://localhost:6210/crypto/getCertificate';

    const params = {
      phone: obj.phone,
      inn: obj.inn,
      password: obj.password || '',
      pin: obj.pin || '',
      token_type: "ePass"
    };

    return this._http.post(url, params);
  }

  getCertificateWS(obj: { phone: string, inn: string, password: string, pin: string }) {
    return new Promise((resolve) => {
      try {
        let wsok = new WebSocket(this._socketUrl);
        wsok.onopen = () => {
          let msg2 = JSON.stringify({
            function: "getCertificate",
            phone: obj.phone,
            inn: obj.inn,
            password: obj.password || '',
            pin: obj.pin || '',
            token_type: "ePass"
          });

          wsok.send(msg2);
        }
        wsok.onmessage = (event) => {
          let result = this.magicSign(event);

          wsok.close();
          resolve(result);
        }
        wsok.onerror = (event) => {
          resolve({ status: false, message: 'Не возможно обновить' })
        }
      } catch (e) {
        resolve({ status: false, message: 'Ключ не найден' })
      }
    })
  }

  getSignSocket(obj: any, thumb: string = '',serial_number?:string,isVirtual?:string) {

    return new Promise((resolve) => {
      try {
        let wsok = new WebSocket(this._socketUrl);
        let bytes = this.base64urlreplace(this.toBase64(obj))
        wsok.onopen = () => {
          let msg2 = isVirtual ==='Virtual' ? JSON.stringify({ "function": "signMSG", "obj": bytes, "cms": false, "detached": false,"cert_thumb":thumb,"cert_sn":serial_number,"silent":true }) :
            JSON.stringify({ "function": "signMSG", "obj": bytes, "cms": false, "detached": false,"cert_thumb":thumb })


          wsok.send(msg2);
        }
        wsok.onmessage = (event) => {
          let result = this.magicSign(event);

          wsok.close();
          resolve(result);
        }
        wsok.onerror = (event) => {
          resolve({ status: false, message: 'Не возможно подписать' })
        }
      } catch (e) {
        resolve({ status: false, message: 'Ключ не найден' })
      }
    })
  }

  getSignApi(obj: any, thumb: string = '', serialNumber: any,isVirtual?:string) {
    let url = 'http://127.0.0.1:6210/crypto/signMSG'
    let bytes = this.base64urlreplace(this.toBase64(obj))
    let serial_number = serialNumber ? serialNumber : localStorage.getItem('serial_number')
    const body = new HttpParams()
      .set('message', bytes)
      .set('thumbprint', thumb)
      .set('serial_number', serial_number);
    return this._http.post<any>(url, body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: '*/*',
      }
    }).toPromise().then(event => {
      return this.magicSign({ data: event })
    }).catch((e) => {
      return { status: false, message: e.message, infos: [], thumbprintCurrent: '' }
    })
  }

  getSign(obj: any, thumb: string = '', serialNumber?: any,isVirtual?:string) {
    if (window.navigator.platform !== 'MacIntel') {
      return this.getSignSocket(obj, thumb,serialNumber,isVirtual);
    } else {
      return this.getSignApi(obj, thumb, serialNumber,isVirtual)
    }
  }

  getSignMd5Socket(file: any, thumb: string = '') {
    let hasher = new ParallelHasher('/assets/js/md5_worker.js');
    return hasher.hash(file).then((bytes: any) => {
      return new Promise((resolve) => {
        try {
          let wsok = new WebSocket(this._socketUrl);
          wsok.onopen = () => {
            let msg2 = JSON.stringify({ "function": "signMSG", "obj": bytes, "cms": false, "detached": false, "cert_thumb": thumb, "cert_sn": "" })
            wsok.send(msg2);
          }
          wsok.onmessage = (event) => {
            let result = this.magicSign(event)
            wsok.close()
            resolve(result)
          }
          wsok.onerror = (event) => {
            resolve({ status: false, message: 'Не возможно подписать' })
          }
        } catch (e) {
          resolve({ status: false, message: 'Ключ не найден' })
        }
      })
    });
  }

  getSignMd5Api(file: any, thumb: string = '', serialNumber?: any) {
    // let url = '/esp/crypto/signMSG'
    let url = 'http://127.0.0.1:6210/crypto/signMSG'
    let hasher = new ParallelHasher('/assets/js/md5_worker.js');
    return hasher.hash(file).then((bytes: any) => {
      let serial_number = serialNumber ? serialNumber : localStorage.getItem('serial_number')
      // let msg2 = { "message": bytes, "cert_thumb": thumb, "serial_number": serial_number }
      // let msg2 = JSON.stringify({ "obj": bytes, "cms": false, "detached": false, "cert_thumb": thumb, "cert_sn": "" })
      // let msg3 = JSON.stringify(msg2)
      const body = new HttpParams()
        .set('message', bytes)
        .set('thumbprint', thumb)
        .set('serial_number', serial_number);
      // let msg4 = {
      //   "obj":"quick brown fox jumps over the lazy dog",
      //   "cms":false,
      //   "detached":false,
      //   "cert_thumb":"A9225E918BCC993B9442CDCA0FFD7349EAF2A7D8"
      // }
      return this._http.post<any>(url, body.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: '*/*',
        }
      }).toPromise().then(event => {
        return this.magicSign({ data: event })
      }).catch((e) => {
        return { status: false, message: e.message, infos: [], thumbprintCurrent: '' }
      })
    })
  }

  getSignMd5(file: any, thumb: string = '', serialNumber?: any) {
    if (window.navigator.platform !== 'MacIntel') {
      return this.getSignMd5Socket(file, thumb)
    } else {
      return this.getSignMd5Api(file, thumb, serialNumber)
    }
  }

  base64urlreplace = function (aStr: any) {
    return aStr.replace(/\+/g, '-').replace(/\//g, '_')
  }

  get clientThumb() {
    let cTh = window.localStorage.getItem('clientThumb')
    return cTh ? cTh : ''
  }

  set clientFio(val: string) {
    window.localStorage.setItem('clientFIO', val)
  }


}
