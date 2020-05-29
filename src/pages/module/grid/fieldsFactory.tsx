
import { ModuleModal, ModuleState } from '../data'
import { getColumns } from './columnFactory';
import { Dispatch } from 'redux';
/**
 * 根据字段ＩＤ号取得字段的定义,如果没找到返回null
 */
export const getFieldDefine: any = (fieldId: string, moduleInfo: ModuleModal) => {
    if (!moduleInfo)
        return null;
    const { fields } = moduleInfo;
    for (var i in fields) {
        if (fields[i].fieldid === fieldId || fields[i].fieldname === fieldId)
            return fields[i];
    }
    return null;
}


/**
 * 根据定义生成columns
 */

export const getGridColumns = ({ gridScheme, moduleInfo, moduleState, dispatch }:
    {
        gridScheme: any, moduleInfo: ModuleModal, moduleState: ModuleState, dispatch: Dispatch<any>;
    }): any => {

    return getColumns({ moduleState, moduleInfo, gridScheme, dispatch });
}
