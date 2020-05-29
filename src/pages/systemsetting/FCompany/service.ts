
import request from '@/utils/request';

export async function getCompanyInfo(params: any) {
    return request('/api/platform/dataobject/fetchdata.do', {
        method: 'POST',
        requestType: 'form',
        data: {
            limit: 20, page: 1, start: 0, moduleName: 'FCompany',
        }
    });
}

