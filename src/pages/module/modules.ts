import { ModuleModal, TextValue } from "./data";
import { querySyncModuleInfo, fetchObjectComboData } from "./service";
import { applyOtherSetting } from "@/utils/utils";

const modules: Record<string, ModuleModal> = {};
const moduleComboDataSource: Record<string, TextValue[]> = {}

export const getModuleComboDataSource = (moduleName: string): TextValue[] => {
    if (!moduleComboDataSource[moduleName]) {
        moduleComboDataSource[moduleName] = fetchObjectComboData({ moduleName }) as TextValue[];
    }
    return moduleComboDataSource[moduleName];
}

export const getModuleInfo = (moduleName: string): ModuleModal => {
    if (!modules[moduleName]) {
        modules[moduleName] = generateModuleInfo(
            querySyncModuleInfo(moduleName));
    }
    return modules[moduleName];
}

export const hasModuleInfo = (moduleName: string): boolean =>
    !!modules[moduleName]

export const setModuleInfo = (moduleName: string, moduleModal: ModuleModal) => {
    modules[moduleName] = moduleModal;
}

export const generateModuleInfo = (module: any): ModuleModal => {
    const obj = module.fDataobject;
    const basefunction = obj.baseFunctions;
    getAllGridSchemes(obj.gridSchemes).forEach((scheme: any) => {
        applyOtherSetting(scheme, scheme.othersetting)
    })
    const moduleInfo: ModuleModal = {
        moduleid: obj.objectname,
        modulename: obj.objectname,
        objectname: obj.title,
        primarykey: obj.primarykey,
        namefield: obj.namefield,
        namefieldtpl: obj.namefieldtpl,
        description: obj.description,
        fields: obj.fDataobjectfields,
        gridDefaultSchemeId: obj.gridDefaultSchemeId,
        selectedmode: obj.selectedmode,
        gridschemes: obj.gridSchemes,
        formschemes: obj.fovFormschemes,
        viewschemes: obj.viewSchemes,
        userdefinedsorts: [],
        navigateSchemes: obj.navigateSchemes || [],
        moduleLimit: {
            hasenable: obj.hasenable,
            hasbrowse: obj.hasbrowse,
            hasinsert: obj.hasinsert,
            allownewinsert: obj.allownewinsert,
            allowinsertexcel: obj.allowinsertexcel,
            hasedit: obj.hasedit,
            hasdelete: obj.hasdelete,
            rowediting: !!obj.rowediting,
            hasattachment: obj.hasattachment,
            hasapprove: obj.hasapprove,
            hasdatamining: obj.hasdatamining,
            issystem: obj.issystem,
        },
        userLimit: {
            query: basefunction.query,
            new: basefunction.new,
            edit: basefunction.edit,
            delete: basefunction.delete,
            newnavigate: basefunction.newnavigate,
            approve: {
                start: true,
                pause: true,
                cancel: true,
            },
            attachment: {
                query: basefunction.attachmentquery,
                add: basefunction.attachmentadd,
                edit: basefunction.attachmentedit,
                delete: basefunction.attachmentdelete,
            }
        }
    };
    return moduleInfo;
}

/**
 * 根据方案类型获取一个form方案
 * @param moduleName 
 * @param type 
 */
export const getFormSchemeFormType = (moduleName: string, type: string) => {
    const moduleInfo: ModuleModal = getModuleInfo(moduleName);
    return moduleInfo.formschemes.find((scheme) => scheme.formtype == type)
}

/**
 * 返回一个scheme方案的具体定义
 */
export const getGridScheme = (schemeid: string, moduleInfo: ModuleModal) => {
    var gridSchemes: any = moduleInfo.gridschemes;
    var gs = null;
    if (gridSchemes.system)
        gridSchemes.system.forEach((scheme: any) => {
            if (scheme.gridschemeid == schemeid) {
                gs = scheme;
                //return false;
            }
        });
    if (gs == null && gridSchemes.owner)
        gridSchemes.owner.forEach((scheme: any) => {
            if (scheme.gridschemeid == schemeid) {
                gs = scheme;
                //return false;
            }
        });
    if (gs == null && gridSchemes.othershare)
        gridSchemes.othershare.forEach((scheme: any) => {
            if (scheme.gridschemeid == schemeid) {
                gs = scheme;
                //return false;
            }
        });
    return gs;
}

/**
 * 取得缺省的列表方案
 */
export const getGridDefaultScheme = (moduleInfo: ModuleModal) => {
    var gridSchemes: any = moduleInfo.gridschemes;
    var gs = getGridScheme(moduleInfo.gridDefaultSchemeId, moduleInfo);
    return gs ? gs : gridSchemes.system
        ? gridSchemes.system[0]
        : gridSchemes.owner
            ? gridSchemes.owner[0]
            : gridSchemes.othershare[0]
}

export const getAllGridSchemes = (gridschemes: any): any[] => {
    const result = [];
    if (gridschemes.system)
        result.push(...gridschemes.system);
    if (gridschemes.owner)
        result.push(...gridschemes.owner);
    if (gridschemes.othershare)
        result.push(...gridschemes.othershare);
    return result;
}




export const canDelete = (moduleInfo: ModuleModal): boolean => {
    return moduleInfo.moduleLimit.hasdelete && moduleInfo.userLimit.delete;
}

