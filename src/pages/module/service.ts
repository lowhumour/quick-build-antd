import request, { syncRequest } from '@/utils/request';
import { applyIf } from '@/utils/utils';
import { ModuleState } from './data';
import { getAttachmentData } from './attachment/utils';
import { FetchObjectResponse } from './data';



// 'GET /api/get_module_info?moduleid=personnel'
export async function queryModuleInfo(params: any) {
  const formdata = new FormData();
  Object.keys(params).forEach((key: string) => {
    formdata.append(key, params[key]);
  })
  return request(`/api/platform/module/getmoduleinfo.do`, {
    method: 'POST',
    body: formdata,
  })
}


// 'GET /api/get_module_info?moduleid=personnel'
export function querySyncModuleInfo(moduleName: string): object {
  return syncRequest(`/api/platform/module/getmoduleinfo.do`, {
    type: 'POST',
    params: { moduleName },
  })
}



/**
 * 读取模块的记录
 * @param data 
 */
export async function queryUserLoginLog(data: {
  limit: number, page: number, start: number, moduleName: string,
}) {
  return request('/api/platform/dataobject/fetchdata.do', {
    method: 'post',
    requestType: 'form',
    data,
  });
}

export async function fetchObjectDataWithState(moduleState: ModuleState) {
  return new Promise(function (resolve, reject) {
    const { moduleName, gridParams, filters, sorts } = moduleState;
    const payload: any = { moduleName };
    payload.page = gridParams.curpage;
    payload.limit = gridParams.limit;
    payload.start = gridParams.start;
    // 加入columnfilter
    const { columnfilter } = filters;
    if (columnfilter && columnfilter.length > 0)
      payload.filter = JSON.stringify(columnfilter);
    const { navigate, viewscheme } = filters;
    if (navigate)
      payload.navigates = JSON.stringify(navigate);
    if (viewscheme.viewschemeid)
      payload.viewschemeid = viewscheme.viewschemeid;
    if (sorts.length) {
      payload.sort = JSON.stringify(sorts);
    }
    fetchObjectData(payload).then((response: FetchObjectResponse) => {
      let __recno__ = response.start + 1;
      if (!response.data) response.data = [];
      if (response.data.length > 0) {
        response.data.forEach((record: any) => {
          record['__recno__'] = __recno__++;
          if (record.attachmenttooltip) {
            // attachment 数据从字符串改成数组
            record.attachmenttooltip = getAttachmentData(record.attachmenttooltip);
          }
        })
      }
      resolve(response);
    });
  })
}


export async function fetchObjectData(params: any) {
  const formdata = new FormData();
  params.start = (params.page - 1) * params.limit;
  Object.keys(params).forEach((key: string) => {
    formdata.append(key, params[key]);
  })
  return request(`/api/platform/dataobject/fetchdata.do?_dc=` + new Date().getTime(), {
    method: 'POST',
    body: formdata,
  })
}

/**
 * 取得模块的一条记录
 * @param params 
 * objectname:
 * id:
 */
export async function fetchObjectRecord(params: any) {
  return new Promise(function (resolve, reject) {
    const formdata = new FormData();
    Object.keys(params).forEach((key: string) => {
      formdata.append(key, params[key]);
    })
    request(`/api/platform/dataobject/fetchinfo.do?_dc=` + new Date().getTime(), {
      method: 'POST',
      body: formdata,
    }).then(response => {
      if (response.data.attachmenttooltip) {
        // attachment 数据从字符串改成数组
        response.data.attachmenttooltip = getAttachmentData(response.data.attachmenttooltip);
      }
      resolve(response);
    })
  })
}

// 新增一条记录
export async function saveOrUpdateRecord(params: any) {
  return new Promise(function (resolve, reject) {
    request('/api/platform/dataobject/saveorupdate.do', {
      params: {
        objectname: params.moduleName,
        opertype: params.opertype === 'insert' ? 'new' : params.opertype,
      },
      data: params.data,
      method: 'POST',
    }).then(response => {
      if (response.data.attachmenttooltip) {
        // attachment 数据从字符串改成数组
        response.data.attachmenttooltip = getAttachmentData(response.data.attachmenttooltip);
      }
      resolve(response);
    })
  })
}
// 删除模块的一条记录
export async function deleteModuleRecord(params: any) {
  return request('/api/platform/dataobject/remove.do', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    params: {
      objectname: params.moduleName,
    },
    data: {
      recordId: params.recordId
    },
  });
}

// 删除模块的多条记录
// params : {
//   moduleName : grid.moduleInfo.fDataobject.objectname,
//   ids : grid.getSelectionIds().join(","),
//   titles : grid.getSelectionTitleTpl().join("~~")
// },
export async function deleteModuleRecords(params: any) {
  return request('/api/platform/dataobject/removerecords.do', {
    params
  })
}

/**
 * 获取模块作为combodata的数据
 * @param params 
 * moduleName: moduleName
 */
export function fetchObjectComboData(params: any) {
  return syncRequest(`/api/platform/dataobject/fetchcombodata.do`, {
    params: params,
  })
}


/**
 * 下载grid表单的excel或pdf文件
 * @param params 
 *          moduleName: moduleName,
            columns: JSON.stringify(getCurrentExportGridColumnDefine(moduleName)),
            page: 1,
            start: 0,
            limit: 1000000,
            conditions: JSON.stringify([]),
            onlyselected: false,
            colorless: false,
            usemonetary: false,
            monetaryUnit: 10000,
            monetaryText: '万',
            sumless: false,
            unitalone: false,
            pagesize: 'pageautofit',
            autofitwidth: true,
            scale: 100,
 */
export async function downloadGridExcel(params: any) {
  var children: Node[] = [];
  for (var i in params) {
    let node = window.document.createElement("input");
    node.type = 'hidden';
    node.name = i;
    node.value = typeof params[i] === 'string' ? params[i].replace(new RegExp('"', 'gm'), "'") : params[i];
    children.push(node)
  }
  var form = window.document.createElement("form");
  form.method = 'post';
  form.action = '/api/platform/dataobjectexport/exporttoexcel.do';
  children.forEach(child => form.appendChild(child));
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);

}



/**
 * 读取一个导航方案中的数据
 */
export async function fetchNavigateTreeData(params: any) {
  applyIf(params, {
    reverseOrder: 0,
    parentFilter: null,
  });
  return request('/api/platform/navigatetree/fetchnavigatedata.do', {
    params,
  });
}



// 'GET /api/get_module_info?moduleid=personnel'
export async function fetchChildModuleData(params: any) {
  const formdata = new FormData();
  Object.keys(params).forEach((key: string) => {
    formdata.append(key, params[key]);
  })
  return request(`/api/platform/dataobject/fetchchilddata.do`, {
    method: 'POST',
    body: formdata,
  })
}
