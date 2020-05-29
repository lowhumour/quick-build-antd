import { AnyAction, Reducer } from 'redux';
import { EffectsCommandMap } from 'dva';
import { FCompanyType } from './data';
import { getCompanyInfo } from './service';
export type Effect = (
    action: AnyAction,
    effects: EffectsCommandMap & { select: <T>(func: (state: ModalState) => T) => T },
) => void;


export interface ModalState {
    current: Partial<FCompanyType>;
}

export interface ModelType {
    namespace: string;
    state: { current?: FCompanyType | object };
    effects: {
        fetch: Effect;
    };
    reducers: {
        setCompany: Reducer<ModalState>;
    };
}

const Model: ModelType = {
    namespace: 'fCompany',
    state: { current : {}},
    effects: {
        *fetch({ payload }, { call, put }) {
            const response = yield call(getCompanyInfo, payload);
            console.log(response)
            yield put({
                type: 'setCompany',
                payload: { current: response.data[0] },
            });
        },
    },
    reducers: {
        setCompany(state, action) {
            console.log('setCompany', action);
            return {
                ...state,
                current: action.payload.current ,
            }
        },
    }

}

export default Model;
