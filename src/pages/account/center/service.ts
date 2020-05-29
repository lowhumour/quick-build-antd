import request from '@/utils/request';

/**
 * 取得当前用户的信息
 */
export async function queryCurrent() {
  return request('/api/platform/systemframe/currentuser.do');
}

/**
 * 读取当前用户的所有权限
 * @param params 
 */
export async function queryUserLimits(params: { userid: string }) {
  return request('/api/platform/userrole/getuseralllimit.do', {
    params,
  });
}

/**
 * 给当前用户增加一个自定义标签
 * @param params 
 */
export async function addTag(params: { label: string }) {
  return request('/api/platform/userfavourite/addtag.do', {
    params,
  });
}

/**
 * 删除当前用户的一个自定义标签
 * @param params 
 */
export async function removeTag(params: { label: string }) {
  return request('/api/platform/userfavourite/removetag.do', {
    params,
  });
}

/**
 * 更新当前用户的签名
 * @param params 
 */
export async function updateSignature(params: { text: string }) {
  return request('/api/platform/userfavourite/updatesignature.do', {
    params,
  });
}

/**
 * 读取当前用户的登录记录
 * @param data 
 */
export async function queryUserLoginLog(data: {
  userid: string, limit: number, page: number, start: number, moduleName: string,
}) {
  data.moduleName = 'FUserloginlog';
  return request('/api/platform/dataobject/fetchdata.do', {
    method: 'post',
    requestType: 'form',
    data,
  });
}

/**
 * 模拟的一个读取导航的函数
 */
export async function fetchNavigateData() {
  const params = {
    moduleName: 'FUserloginlog',
    cascading: true,
    isContainNullRecord: false,
    title: '登录年月',
    reverseOrder: 0,
    parentFilter: null,
    navigateschemeid: '402882e563520af1016352408c3c0052',
    node: 'root',
  }
  return request('/api/platform/navigatetree/fetchnavigatedata.do', {
    params,
  });
}


export async function queryFakeList(params: { count: number }) {
  return request('/api/fake_list', {
    params,
  });
}
