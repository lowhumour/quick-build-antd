
import request, { syncRequest } from '@/utils/request';

export async function queryDicrionaryDefine(params: any) {
    const formdata = new FormData();
    for (const key in params) {
        formdata.append(key, params[key]);
    }
    return request(`/api/dictionary/getdictionary.do`, {
        method: 'POST',
        body: formdata,
    })
}

export async function queryDictionaryData(params: any) {
    params._dc = new Date().getTime();
    return request(`/api/dictionary/getDictionaryComboData.do`, {
        params
    })
}


export function querySyncDicrionaryDefine(params: any) : any {
    return syncRequest(`/api/dictionary/getdictionary.do`, {
        params,
    })
}

export function querySyncDictionaryData(params: any): any {
    return syncRequest(`/api/dictionary/getDictionaryComboData.do`, {
        params
    })
}
