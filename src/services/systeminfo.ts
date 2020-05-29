import request from '@/utils/request';

/**
 * 取得系统信息
 */
export async function query(): Promise<any> {
  return request('/api/login/getsysteminfo.do');
}

/**
 * 取得系统菜单
 */
export async function getSystemMenu(): Promise<any> {
  return request(`/api/platform/systemframe/getmenutree.do`);
}