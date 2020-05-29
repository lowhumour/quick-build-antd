import { Reducer } from 'redux';
import { Effect } from 'dva';
import { CurrentUser, ListItemDataType, TagType } from '../pages/account/center/data';
import { download } from '@/utils/utils';

import {
  queryCurrent, 
  queryFakeList, 
  queryUserLimits,
  addTag,
  removeTag,
  updateSignature,
  queryUserLoginLog,
  fetchNavigateData,
} from '../pages/account/center/service';

/**
 * 用户权限的树形表的值和状态
 */
export interface userLimitsState {
  data: Array<any>;
  visibleColumn: Array<string>;
  expandedRowKeys: Array<string>;
}

/**
 * 用户登录日志的结果和状态
 */
export interface userLoginLogState {
  data: Array<any>;
  pagination: any;
  parentFilter?: any;
  navigateFilter?: Array<any>;
  navigateData?: any;
}

export interface ModalState {
  currentUser: Partial<CurrentUser>;
  list: ListItemDataType[];
  userLimits: userLimitsState;
  userLoginLog: userLoginLogState;
}

export interface ModelType {
  namespace: string;
  state: ModalState;
  effects: {
    fetchCurrent: Effect;
    fetchUserLimits: Effect;
    fetchUserLoginLogs: Effect;
    navigateChanged: Effect;
    exportToExcel: Effect;
    fetch: Effect;
    addTag: Effect;
    removeTag: Effect;
    editSignature: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<ModalState>;
    queryList: Reducer<ModalState>;
    saveUserLimits: Reducer<ModalState>;
    saveUserLoginLogs: Reducer<ModalState>;
    userLimitsOnExpand: Reducer<ModalState>;
    updateTags: Reducer<ModalState>;
    updateSignature: Reducer<ModalState>;
  };
}

const Model: ModelType = {
  namespace: 'accountCenter',

  state: {
    currentUser: {},
    list: [],
    userLimits: { data: [], visibleColumn: [], expandedRowKeys: [] },
    userLoginLog: {
      data: [],
      pagination: {
        current: 1,
        pageSize: 20,
        total: 0
      },
      parentFilter: {},
      navigateFilter: [],
      navigateData: [],
    }
  },

  effects: {
 
    *exportToExcel(_, { call, put }) {

      const data = {
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
        moduleName: 'FUserloginlog',
        parentFilter: "{ 'moduleName': 'FUser', 'fieldahead': 'FUser', 'fieldName': 'userid', 'fieldtitle': '\u7cfb\u7edf\u7528\u6237', 'operator': '=', 'fieldvalue': '402882e562f6d0b40162f73d4482015c', 'text': '\u8d85\u7ea7\u7ba1\u7406\u5458' }",
        columns: "[{ 'text': '\u767b\u5f55\u7528\u6237', 'gridFieldId': '4028829165c7ce920165d0c14e1c001f', 'dataIndex': 'FUser.username' }, { 'text': '\u767b\u5f55IP\u5730\u5740', 'gridFieldId': '4028829165c7ce920165d0c14e1f0020', 'dataIndex': 'ipaddress' }, { 'text': '\u767b\u5f55\u65f6\u95f4', 'gridFieldId': '4028829165c7ce920165d0c14e200021', 'dataIndex': 'logindate' }, { 'text': '\u767b\u51fa\u65f6\u95f4', 'gridFieldId': '4028829165c7ce920165d0c14e210022', 'dataIndex': 'logoutdate' }, { 'text': '\u767b\u5f55\u65f6\u957f', 'gridFieldId': '4028829165c7ce920165d0c14e220023', 'dataIndex': 'udfloginminute', 'ismonetary': false, 'unittext': '\u5206\u949f' }, { 'text': '\u767b\u5f55\u65b9\u5f0f', 'gridFieldId': '4028829165c7ce920165d0c14e220024', 'dataIndex': 'logintype' }, { 'text': '\u767b\u51fa\u65b9\u5f0f', 'gridFieldId': '4028829165c7ce920165d0c14e230025', 'dataIndex': 'logouttype' }, { 'text': '\u5907\u6ce8', 'gridFieldId': '4028829165c7ce920165d0c14e240026', 'dataIndex': 'remark' }]",
        page: 1,
        start: 0,
        limit: 65000,
        conditions: "[{ 'property': '\u7cfb\u7edf\u7528\u6237', 'operator': ':', 'value': '\u8d85\u7ea7\u7ba1\u7406\u5458' }]",
      }

      download('/api/platform/dataobjectexport/exporttoexcel.do', data);

    },

    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
      yield put({
        type: 'fetchUserLimits',
        payload: {
          userid: response.user.id,
        }
      });
    },

    *fetchUserLimits({ payload }, { call, put }) {
      const response = yield call(queryUserLimits, payload);
      let visibleColumn = {};
      let key = 1;
      let adjust = function (record: any) {
        delete record.checked;
        const { type } = record
        record.key = key++;
        if (type == 'homepagescheme' || type == 'dataobject') {
          // 如果是最基层的模块，把权限的定义转换一下
          delete record.children;
          var atti = record['attributes'];
          for (var i in atti) {
            record[i] = atti[i];
            visibleColumn[i] = true;
          }
        } else {
          record.children.forEach((r: any) => {
            adjust(r);
          })
        }
      }
      // 所有展开的行的key
      let expandedRowKeys: string[] = [];
      response.forEach((record: any) => {
        adjust(record);
        expandedRowKeys.push(record.key);
      })
      let dataObject = {
        data: response,
        visibleColumn,
        expandedRowKeys,
      }
      yield put({
        type: 'saveUserLimits',
        payload: dataObject,
      })
    },

    *fetch({ payload }, { call, put }) {
      const response = yield call(queryFakeList, payload);
      yield put({
        type: 'queryList',
        payload: Array.isArray(response) ? response : [],
      });
    },

    *addTag({ payload }, { call, put }) {
      yield call(addTag, payload);
      yield put({
        type: 'updateTags',
        payload: {
          type: 'add',
          label: payload.label,
        }
      })
    },

    *removeTag({ payload }, { call, put }) {
      yield call(removeTag, payload);
      yield put({
        type: 'updateTags',
        payload: {
          type: 'remove',
          label: payload.label,
        }
      })
    },

    *editSignature({ payload }, { call, put }) {
      yield call(updateSignature, payload);
      yield put({
        type: 'updateSignature',
        payload: {
          text: payload.text,
        }
      })
    },

    *navigateChanged({ payload }, { call, put, select }) {
      const response = yield call(queryUserLoginLog, payload);
      response.navigateFilter = payload.navigates;
      yield put({
        type: 'saveUserLoginLogs',
        payload: response
      })
    },


    *fetchUserLoginLogs({ payload }, { call, put, select }) {
      const {navigateFilter} = yield select( (m_:any) => m_[Model.namespace].userLoginLog);
      payload.navigates = navigateFilter;
      console.log(payload);
      const response = yield call(queryUserLoginLog, payload);
      let navigateData = yield call(fetchNavigateData, payload);

      let key = 1;
      let rebuildData = (item: any) => {
        item.title = item.text;
        item.isLeaf = item.leaf;
        if (item.count) {
          item.title =  item.text  //<span>{item.text}<span style={{ color: 'blue' }}>({item.count})</span></span>
        }
        item.key = key++;
        if (item.children) {
          item.children.forEach((child:any) => child.parent = item);
          item.children = item.children.map(rebuildData);
        }
        return item;
      }
      if (navigateData.children)
        navigateData = navigateData.children.map(rebuildData)

      response.navigateData = navigateData;
      yield put({
        type: 'saveUserLoginLogs',
        payload: response
      })

    }
  },

  reducers: {
    saveUserLoginLogs(state, action) {
      const { payload } = action;
      let userLoginLog: userLoginLogState = {
        ...state.userLoginLog,
        data: payload.data,
        pagination: {
          current: payload.curpage,
          pageSize: payload.limit,
          total: payload.total
        },
      };
      if (payload.navigateData)
        userLoginLog.navigateData = payload.navigateData;
      if (payload.navigateFilter)
        userLoginLog.navigateFilter = payload.navigateFilter;
      return {
        ...(state as ModalState),
        userLoginLog,
      }
    },

    updateSignature(state, action) {
      const { text: signature } = action.payload;
      let { currentUser } = state as ModalState;
      const personnel = { ...currentUser.personnel, signature };
      currentUser = { ...currentUser, personnel };
      return {
        ...(state as ModalState),
        currentUser
      }
    },

    updateTags(state, action) {
      const { type, label } = action.payload;
      let { currentUser } = state as ModalState;
      let tags = currentUser.personnel.tags;
      if (type === 'add') {
        tags = [...tags, { key: label, label: label }];
      } else {
        tags = tags.filter((tag: TagType) => tag.label !== label);
      }
      const personnel = { ...currentUser.personnel, tags };
      currentUser = { ...currentUser, personnel };
      return {
        ...(state as ModalState),
        currentUser,
      }
    },

    saveCurrentUser(state, action) {
      return {
        ...(state as ModalState),
        currentUser: action.payload || {},
      };
    },

    saveUserLimits(state, action) {
      return {
        ...(state as ModalState),
        userLimits: action.payload || []
      }
    },
    /**
     * 用户权限展开的行的key
     * @param state 
     * @param action 
     */
    userLimitsOnExpand(state, action) {
      const { userLimits } = state as ModalState;
      const { expandedRowKeys } = userLimits;
      let { expanded, key } = action.payload;
      return {
        ...(state as ModalState),
        userLimits: {
          ...userLimits,
          expandedRowKeys: expanded ?
            [...expandedRowKeys, key] :
            expandedRowKeys.filter((value: string) => value != key)
        }
      }
    },

    queryList(state, action) {
      return {
        ...(state as ModalState),
        list: action.payload,
      };
    },
  },
};

export default Model;
