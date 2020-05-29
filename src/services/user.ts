import request from '@/utils/request';

export async function query(): Promise<any> {
  return request('/api/users');
}

/**
 * 取得当前登录的用户信息和系统信息
 */
export async function queryCurrent(): Promise<any> {
  return request('/api/login/getuserbean.do');
}

export async function queryNotices(): Promise<any> {
  return request('/api/notices');
}
