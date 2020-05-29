import request from '@/utils/request';

export interface LoginParamsType {
  usercode: string; // 用户名
  password: string; // 登录密码
  identifingcode: string; // 验证码
  invalidate?: boolean; // 是否强制登录
  mobile: string; // 手机号
  captcha: string; // 短信验证码
  type?: string; // 登录方式:account,mobile
}

/**
 *
 * 去后台验证用户名和密码是否正确
 *
 * @param params 登录参数
 */
export async function fakeAccountLogin(params: LoginParamsType) {
  const formdata = new FormData();
  for (const key in params) {
    formdata.append(key, params[key]);
  }
  return request('/api/login/validate.do', {
    method: 'POST',
    body: formdata,
  });
}

/**
 * 用户登出
 */
export async function fakeAccountLogout() {
  return request('/api/login/logout.do', {
    method: 'POST',
  });
}

/**
 *
 * 获取手机验证码
 *
 * @param mobile 手机号码
 */
export async function getFakeCaptcha(mobile: string) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}
