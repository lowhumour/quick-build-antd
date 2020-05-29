import { Effect } from 'dva';
import { Reducer } from 'redux';

import { query as querySystemInfo } from '@/services/systeminfo';

export interface SystemInfo {
  company: {
    companyid?: string; // 公司ID
    companyname?: string; // 公司名称
    servicedepartment?: string; // 服务单位名称
    servicehomepage?: string; // 服务主页
    servicemen?: string; // 服务人员
    serviceqq?: string; // 服务人员QQ号
    servicetelnumber?: string; // 服务人员电话号码
    serviceemail?: string; // 服务人员邮件
  };
  loginsettinginfo: {
    allowsavepassword?: boolean; // 允许保存密码
    alwaysneedidentifingcode?: boolean; // 始终需要验证码
    needidentifingcode?: boolean; // 需要验证码
    needreplaceinitialpassword?: boolean; // 需要更改初始密码
  };
  systeminfo: {
    systemname: string; // 系统名称
    systemshortname?: string; // 系统简称，要放在主页的右边的图标后面，最多9个汉字
    systemversion?: string; // 系统版本号
    systemaddition?: string; // 系统附件信息
    copyrightinfo?: string; // 版权信息
    copyrightowner?: string; // 版权所有
    forgetpassword?: string; // 忘记密码后操作的描述文字
    disableActiviti?: boolean; // 是否禁用审批流
    disablePopupWindow?: boolean; // 是否禁用弹出式提醒
    disableThemeSelect?: boolean; // 是否禁用主题更换
  }
}

export interface SystemInfoState {
  systemInfo?: SystemInfo;
}

export interface SystemInfoModelType {
  namespace: 'systemInfo';
  state: SystemInfoState;
  effects: {
    fetch: Effect;
  };
  reducers: {
    saveSystemInfo: Reducer<SystemInfoState>;
  };
}

const SystemInfoModel: SystemInfoModelType = {
  namespace: 'systemInfo',

  state: {
    systemInfo: {
      company: {},
      loginsettinginfo: {},
      systeminfo: {
        systemname: '',
      },
    },
  },

  effects: {
    *fetch({ payload }, action) {
      const { call, put } = action;
      const response = yield call(querySystemInfo);
      const { systeminfo } = response;
      let { systemname } = systeminfo;
      let pos = systemname.indexOf('(');
      if (pos === -1) pos = systemname.indexOf('（')
      if (pos !== -1) systemname = systemname.substring(0, pos >= 9 ? 9 : pos)
      // 显示在主页图标后面的系统名称，最大只能9个汉字
      systeminfo.systemshortname = systemname;
      payload.dispatch({
        type: 'settings/changeSetting',
        payload: {
          title: systeminfo.systemshortname,
        },
      })
      yield put({
        type: 'saveSystemInfo',
        payload: response,
      });
    },
  },

  reducers: {
    saveSystemInfo(state, action) {
      if (action.payload.loginsettinginfo.allowsavepassword === false) localStorage.removeItem('login-allow-save-pwd')
      return {
        systemInfo: action.payload || {},
      };
    },
  },
};

export default SystemInfoModel;
