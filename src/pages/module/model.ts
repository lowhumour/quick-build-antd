import { AnyAction, Reducer } from 'redux';
import { EffectsCommandMap } from 'dva';
import {
    queryModuleInfo, deleteModuleRecord, fetchObjectRecord,
    fetchObjectDataWithState
} from './service';
import { getGridColumnSorts } from './grid/sortUtils';
import { getGridColumnFilters, getColumnFiltersInfo } from './grid/filterUtils';
import { ModuleState, TextValue, ModuleModal, ModuleFilters, FetchObjectResponse } from './data';
import { setModuleInfo, generateModuleInfo, hasModuleInfo, getModuleInfo, getGridDefaultScheme } from './modules';
import { apply } from '@/utils/utils';
import { getMonetary } from './Grid/Monetary';

export type Effect = (
    action: AnyAction,
    effects: EffectsCommandMap & { select: <T>(func: (state: ModalState) => T) => T },
) => void;

export interface ModalState {
    [moduleid: string]: ModuleState,
}

export interface ModuleModelType {
    namespace: string;
    state: ModalState;
    effects: {
        fetchModuleInfo: Effect;
        fetchData: Effect;
        refreshRecord: Effect;
        deleteAttachment: Effect;

        filterChanged: Effect;  // 各种筛选条件改变后都执行此函数，在改变条件过后，获取数据，然后更新，少掉中间一个步骤

    };
    reducers: {
        updateModuleState: Reducer<ModalState>;
        updateDataList: Reducer<ModalState>;
        updateRecord: Reducer<ModalState>;
        insertRecord: Reducer<ModalState>;

        pageChanged: Reducer<ModalState>;
        pageSizeChanged: Reducer<ModalState>;

        columnSortChanged: Reducer<ModalState>;

        toggleUserFilter: Reducer<ModalState>;
        toggleNavigate: Reducer<ModalState>;
        toggleFormVisible: Reducer<ModalState>;
        removeAttachment: Reducer<ModalState>;

        selectedRowKeysChanged: Reducer<ModalState>;
        resetSelectedRow: Reducer<ModalState>;

        gridSchemeChanged: Reducer<ModalState>;
        monetaryChanged: Reducer<ModalState>;

    };
}

const loadedModules: Record<string, any> = {};

const Model: ModuleModelType = {
    namespace: 'modules',
    state: {},
    effects: {

        // 根据payload中的moduleId信息，删除一条记录
        *deleteAttachment({ payload }, { call, put }) {
            const response = yield call(deleteModuleRecord,
                {
                    moduleName: 'FDataobjectattachment',
                    recordId: payload.attachmentId
                });
            if (response && response.resultCode === 0)
                yield put({
                    type: 'removeAttachment',
                    payload
                })
            return response;
        },

        *fetchModuleInfo({ payload }, param) {
            const moduleName = payload.moduleid;
            console.log('fetchModuleInfo ', moduleName);
            const { put, call } = param;
            if (!hasModuleInfo(moduleName)) {
                const response = yield call(queryModuleInfo, payload);
                setModuleInfo(moduleName, generateModuleInfo(response));
            }
            loadedModules[moduleName] = { dataSourceLoadCount: 0 }
            const moduleInfo = getModuleInfo(moduleName);
            const moduleState: ModuleState = {
                moduleName,
                moduleInfo,
                dataSourceLoadCount: 1,
                currentGridschemeid: getGridDefaultScheme(moduleInfo).gridschemeid,
                monetary: getMonetary('tenthousand'),
                monetaryPosition: 'behindnumber',
                dataSource: [],
                selectedRowKeys: [],
                selectedTextValue: [],
                filters: { navigate: [], viewscheme: { title: undefined, viewschemeid: undefined } },
                sorts: [],
                gridParams: {
                    curpage: 1,
                    limit: 20,
                    start: 0,
                    total: 0,
                    totalpage: 0,
                },
                currSetting: {
                    navigate: {
                        type: 'card',
                        position: 'left',
                        visible: true,
                    },
                    userFilterRegionVisible: true,
                    formType: '',
                    formVisible: false,
                    currRecord: {},
                }
            };
            yield put({
                type: 'updateModuleState',
                payload: {
                    moduleState: moduleState,
                }
            });
        },

        *refreshRecord({ payload }, { call, put, select }) {
            console.log('refresh Record ', payload);
            const { moduleName } = payload;
            const response = yield call(fetchObjectRecord,
                { objectname: moduleName, id: payload.recordId });
            const record = response.data;
            // if (record.attachmenttooltip) {
            //     record.attachmenttooltip = getAttachmentData(record.attachmenttooltip);
            // }
            yield put({
                type: 'updateRecord',
                payload: { moduleName, record },
            });
        },

        *filterChanged({ payload }, { call, put, select }) {
            console.log('filterChanged', payload);
            const { type, moduleName } = payload;
            const moduleState: ModuleState =
                yield select(state => state['modules'][moduleName]) as ModuleState;
            const filters: ModuleFilters = { ...moduleState.filters };
            switch (type) {
                case 'columnFilterChange':
                    filters.columnfilter = getGridColumnFilters(payload.columnfilter,
                        getColumnFiltersInfo(moduleState.moduleName));
                    break;
                case 'clearAllColumnFilter':
                    filters.columnfilter = [];
                    break;
                case 'clearColumnFilter':
                    filters.columnfilter = filters.columnfilter?.
                        filter(filter => filter.property != payload.dataIndex);
                    break;
                case 'viewSchemeChange':
                    filters.viewscheme = { ...payload.viewscheme };
                    break;
                case 'navigateSelectChange':
                    filters.navigate = payload.navigates;
                    break;
                case 'clearNavigateFilter':
                    const { index } = payload;
                    let navigate: any[] = [];
                    if (index !== -1) {
                        navigate = [...filters.navigate];
                        navigate.splice(index, 1);
                    }
                    filters.navigate = navigate;
                    break;
                case 'userDefineFilter':
                    filters.userfilter = payload.userfilter;
                    break;
                case 'clearUserFilter':
                    filters.userfilter = filters.userfilter?.map((filter) => {
                        const f = {...filter};
                        delete f.value;
                        delete f.text;
                        return f;
                    })
                    break;
                default:
                    break;
            }
            const newModuleState = {
                ...moduleState,
                filters
            };
            const response: FetchObjectResponse = yield call(fetchObjectDataWithState, newModuleState);
            const { curpage, limit, start, total, totalpage, data: dataSource } = response;
            apply(newModuleState, {
                selectedRowKeys: [],
                selectedTextValue: [],
                gridParams: { curpage, limit, start, total, totalpage },
                dataSource,
            });
            yield put({
                type: 'updateModuleState',
                payload: { moduleState: newModuleState },
            });
            return response;

        },

        *fetchData({ payload }, { call, put, select }) {
            console.log('prepared fetchData......', payload);
            const { moduleName } = payload;
            const moduleState =
                yield select(state => state['modules'][moduleName]) as ModuleState
            if (!payload.forceUpdate &&
                loadedModules[moduleName].dataSourceLoadCount === moduleState.dataSourceLoadCount)
                return;
            loadedModules[moduleName].dataSourceLoadCount = moduleState.dataSourceLoadCount;
            console.log('fetchData...dataSourceLoadCount---' + moduleState.dataSourceLoadCount);
            const response = yield call(fetchObjectDataWithState, moduleState);
            yield put({
                type: 'updateDataList',
                payload: { ...response, moduleName },
            });
            return response;
        },

    },
    reducers: {


        removeAttachment(state = {}, action) {
            // action.payload = {
            // attachmentId: "4028e3ec69752e2a01697bf509a70014"
            // moduleName: "FWorkflowdesign"
            // moduleRecordId: "4028e3ec69752e2a01697ba41d050003"}

            const { moduleName, moduleRecordId: recordId, attachmentId } = action.payload;
            const { primarykey } = getModuleInfo(moduleName);
            const moduleState = state[moduleName];
            const dataSource = moduleState.dataSource.map(rec => {
                if (rec[primarykey] === recordId) {
                    const updatedRecord = { ...rec };
                    updatedRecord.attachmenttooltip = updatedRecord.attachmenttooltip.filter((record: any) => record.id !== attachmentId);
                    updatedRecord.attachmentcount = updatedRecord.attachmenttooltip.length;
                    return updatedRecord;
                }
                return rec
            })
            const result = {
                ...state
            };
            result[moduleName] = { ...moduleState, dataSource };
            return result;

        },

        pageChanged(state = {}, action) {
            console.log('page changed', action)
            const { moduleName } = action.payload;
            const result = {
                ...state
            };
            const moduleState: ModuleState = state[moduleName] as ModuleState;
            const { page } = action.payload;
            let gp = { ...moduleState.gridParams, curpage: page };
            result[moduleName] = {
                ...moduleState,
                gridParams: gp,
                dataSourceLoadCount: moduleState.dataSourceLoadCount + 1
            };
            return result;
        },

        pageSizeChanged(state = {}, action) {
            console.log('pagesize changed', action)
            // pagesize 改变后，最好还是能显示尽量多的当前页的数据
            const { moduleName, limit } = action.payload;
            const result = {
                ...state
            };
            const moduleState: ModuleState = state[moduleName] as ModuleState;
            const { gridParams } = moduleState;
            const { start: oldstart } = gridParams;
            // 在改变了每页显示之后，最接近原来页面的数据的页面0-19，20-39，。。。。。
            const page = Math.floor(oldstart / limit) + 1;
            let gp = { ...moduleState.gridParams, curpage: page, limit };
            result[moduleName] = {
                ...moduleState,
                gridParams: gp,
                dataSourceLoadCount: moduleState.dataSourceLoadCount + 1
            };
            return result;
        },

        // 用户点击grid column 进行排序
        columnSortChanged(state = {}, action) {
            console.log('column sort Changed', action)
            const { moduleName, columnsorter } = action.payload;
            const result = {
                ...state
            };
            const sorts = getGridColumnSorts(columnsorter);
            const moduleState: ModuleState = state[moduleName] as ModuleState;
            result[moduleName] = {
                ...moduleState,
                sorts,
                dataSourceLoadCount: moduleState.dataSourceLoadCount + 1
            };
            return result;
        },

        insertRecord(state = {}, action) {
            const { moduleName, record, setCurrRecord } = action.payload;
            const moduleState: ModuleState = state[moduleName] as ModuleState;
            const result = {
                ...state
            };
            record.__recno__ = '+';
            const dataSource = [...moduleState.dataSource, record]
            const gridParams = { ...moduleState.gridParams };
            const currSetting = { ...moduleState.currSetting };
            gridParams.total = gridParams.total + 1;
            if (gridParams.curpage == 0) gridParams.curpage = 1;
            if (gridParams.totalpage == 0) gridParams.totalpage = 1;
            //把新增的记录作为当前记录
            if (setCurrRecord) {
                currSetting.currRecord = record;
            }

            result[moduleName] = { ...moduleState, dataSource, gridParams, currSetting };
            return result;
        },

        updateRecord(state = {}, action) {
            const { moduleName, record, setCurrRecord } = action.payload;
            const moduleState: ModuleState = state[moduleName] as ModuleState;
            const { primarykey } = getModuleInfo(moduleName);
            const result = {
                ...state
            };
            const dataSource = moduleState.dataSource.map((rec: any) => {
                if (rec[primarykey] == record[primarykey]) {
                    record.__recno__ = rec.__recno__
                    return record;
                } else
                    return rec;
            })
            if (setCurrRecord) {
                const currSetting = { ...moduleState.currSetting, currRecord: record };
                result[moduleName] = { ...moduleState, dataSource, currSetting };
            } else
                result[moduleName] = { ...moduleState, dataSource };
            return result;
        },

        updateModuleState(state = {}, action) {
            const { moduleState } = action.payload;
            const { moduleName } = moduleState;
            const result = {
                ...state
            };
            result[moduleName] = { ...moduleState };
            return result;
        },

        updateDataList(state = {}, action) {
            const { moduleName, data: dataSource = [] } = action.payload;
            const moduleState: ModuleState = state[moduleName] as ModuleState;
            const result = {
                ...state
            };
            const { curpage, limit, start, total, totalpage } = action.payload
            result[moduleName] = {
                ...moduleState,
                gridParams: { curpage, limit, start, total, totalpage },
                dataSource
            };
            return result;
        },

        toggleUserFilter(state = {}, action) {
            console.log('toggleUserFilter visible.....')
            const { moduleName } = action.payload;
            const moduleState: ModuleState = state[moduleName] as ModuleState;
            const result = { ...state };
            const newCurrSetting = {
                ...moduleState.currSetting,
                userFilterRegionVisible: !moduleState.currSetting.userFilterRegionVisible
            };
            result[moduleName] = {
                ...moduleState,
                currSetting: newCurrSetting
            };
            return result;
        },

        toggleNavigate(state = {}, action) {
            const { moduleName } = action.payload;
            const moduleState: ModuleState = state[moduleName] as ModuleState;
            const result = { ...state };
            const newNavigate = { ...moduleState.currSetting.navigate }
            const { toggle } = action.payload;
            if (toggle === 'visible')
                newNavigate.visible = !newNavigate.visible;
            else if (toggle === 'position') {
                newNavigate.position = newNavigate.position === 'left' ? 'right' : 'left';
            } else if (toggle === "type") {
                newNavigate.type = newNavigate.type === 'card' ? 'drawer' : 'card';
            }
            const newCurrSetting = { ...moduleState.currSetting, navigate: newNavigate };
            result[moduleName] = {
                ...moduleState,
                currSetting: newCurrSetting
            };
            return result;
        },

        toggleFormVisible(state = {}, action) {
            const { moduleName, currRecord, formType } = action.payload;
            const moduleState: ModuleState = state[moduleName] as ModuleState;
            const result = { ...state };
            const newCurrSetting = {
                ...moduleState.currSetting,
                formVisible: action.payload.visible || !moduleState.currSetting.formVisible,
            };
            if (currRecord)
                newCurrSetting.currRecord = currRecord;
            if (!newCurrSetting.formVisible)
                newCurrSetting.currRecord = {};
            if (formType)
                newCurrSetting.formType = formType;
            result[moduleName] = {
                ...moduleState,
                currSetting: newCurrSetting
            };
            return result;
        },
        selectedRowKeysChanged(state = {}, action) {
            const { moduleName, selectedRowKeys, forceUpdate } = action.payload;
            const moduleState: ModuleState = state[moduleName] as ModuleState;
            const moduleInfo: ModuleModal = getModuleInfo(moduleName);
            const result = { ...state };
            // 把不在 selectedRowKeys 中的记录删除
            const selectedTextValue: TextValue[] = moduleState.selectedTextValue.filter((value) => {
                selectedRowKeys.find((key: any) => key == value.value);
            });
            // 不在selectedTextValue中的键
            const outKeys: any[] = selectedRowKeys.filter((key: any) =>
                selectedTextValue.find((value: TextValue) => value.value == key) == undefined);
            selectedTextValue.push(...outKeys.map((key: string): TextValue => {
                const rec = moduleState.dataSource.find((record: any) => record[moduleInfo.primarykey] == key) || {};
                return {
                    text: rec[moduleInfo.namefield],
                    value: key,
                }
            }))
            result[moduleName] = {
                ...moduleState,
                selectedRowKeys,
                selectedTextValue,
                dataSourceLoadCount: moduleState.dataSourceLoadCount + (!!forceUpdate ? 1 : 0),
            };
            return result;
        },
        resetSelectedRow(state = {}, action) {
            const { moduleName, type } = action.payload;
            const moduleState: ModuleState = state[moduleName] as ModuleState;
            const result = { ...state };
            const moduleInfo = getModuleInfo(moduleName);
            const getThisPageSelectedkeys = () =>
                moduleState.selectedRowKeys.filter((key: any) =>
                    moduleState.dataSource.find((record: any) =>
                        record[moduleInfo.primarykey] == key) !== undefined)

            result[moduleName] = {
                ...moduleState,
                selectedRowKeys: type == 'none' ? [] : getThisPageSelectedkeys(),
                selectedTextValue: type == 'none' ? [] : getThisPageSelectedkeys().map((key: string): TextValue => {
                    const rec = moduleState.dataSource.find((record: any) => record[moduleInfo.primarykey] == key) || {};
                    return {
                        text: rec[moduleInfo.namefield],
                        value: key,
                    }
                }),
            };
            return result;
        },

        gridSchemeChanged(state = {}, action) {
            const { moduleName } = action.payload;
            const moduleState: ModuleState = state[moduleName] as ModuleState;
            const result = { ...state };
            result[moduleName] = { ...moduleState, currentGridschemeid: action.payload.gridschemeid };
            return result;
        },

        monetaryChanged(state = {}, action) {
            const { position, monetaryType, moduleName } = action.payload;
            const moduleState: ModuleState = state[moduleName] as ModuleState;
            const result = { ...state };
            if (position)
                result[moduleName] = { ...moduleState, monetaryPosition: position };
            if (monetaryType)
                result[moduleName] = { ...moduleState, monetary: getMonetary(monetaryType) };
            return result;
        },
    }

}

export default Model;
