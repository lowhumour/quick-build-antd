/**
 * 自定义模块的参数定义
 */

import { MonetaryType } from "./Grid/Monetary";


// 模块字段类型
export interface ModuleFieldType {
    fieldgroup: string,                 // 字段分组
    fieldid: string,                    // 字段id
    fieldname: string,                  // 字段名
    fieldtitle: string,                 // 字段描述
    fieldtype: string,                  // 字段类型
    fieldlen: number,                   // 字段长度
    isBaseField: boolean,               // 是否是基础字段
    selectedmode: string,               // 被子模块选择时的选择模式
    fieldrelation?: string,
    isManyToOne: boolean,               // 是否是ManyToOne字段
    isOneToOne: boolean,
    isOneToMany: boolean,
    isManyToMany: boolean,
    manyToOneInfo?: any,
    fieldahead?: string,
    gridcolumnset: string,


    orderno: number,                    // 顺序号
    defaultvalue?: string,              // 新增时的缺省值
    fDictionaryid?: string,             // 数据字典id
    tooltip?: string,
    tooltiptpl?: string,
    digitslen: numbrer,
    unittext?: string,

    isrequired: boolean,                // 是否必填
    ishidden: boolean,                  // 是否隐藏
    ismonetary: boolean,
    allownew: boolean,                  // 允许新增
    allowedit: boolean,                 // 允许修改
    allowgroup: boolean,
    allowsummary: boolean,
}

// 模块的权限或者设置
export interface ModuleLimit {
    hasenable: boolean,                 // 可用
    hasbrowse: boolean,                 // 可浏览
    hasinsert: boolean,                 // 可新增
    allownewinsert?: boolean,           // 允许复制新增
    allowinsertexcel?: boolean,         // 允许excel导入新增数据
    hasedit: boolean,                   // 可修改
    hasdelete: boolean,                 // 可删除
    rowediting: boolean,                // 是否可进行行内编辑(对于字段较少相对简单的模块可以用此方式)
    hasattachment: boolean,             // 是否有附件
    hasapprove: boolean,                // 有审核流程
    hasdatamining: boolean,             // 可数据挖掘(BI)
    issystem: boolean,                  // 是否是系统模块
}

// 用户的模块附件操作权限
export interface AttachmentLimit {
    query?: boolean,                // 附件可查看
    add?: boolean,                  // 附件可上传
    edit?: boolean,                 // 附件可修改
    delete?: boolean,               // 附件可删除
}

// 审核流程的操作权限。注：是否可以进行流程审批由指定的人员来确定，并不用权限设置。
export interface ApproveLimit {
    start: boolean,                 // 可以启动审核流
    pause: boolean,                 // 可以暂停审核流
    cancel: boolean,                // 可以取消审核流
}

// 用户的操作权限
export interface UserLimit {
    query: boolean,                 // 可查看数据
    new: boolean,                   // 可新增
    edit: boolean,                  // 可修改
    delete: boolean,                // 可删除
    newnavigate?: boolean,          // 新增时可用新增向导
    approve?: ApproveLimit,         // 审核操作权限
    attachment?: AttachmentLimit,   // 附件权限
}

// 排序字段的定义
export interface SortModal {
    property: Key;
    direction: 'ASC' | 'DESC';
}

export interface ColumnFilter {
    property: Key,
    value: string,
    operator: string,
    dataIndex?: string,
}

export interface TextValue {
    text: string | undefined;
    value: string | undefined;
}

interface NavigateSetting {
    type: 'card' | 'drawer',
    position: 'left' | 'right',
    visible: boolean,
}

interface AttachmentModal {
    id: string;                         // 文件id
    title: string;                      // 文件描述
    filename: string;                   // 文件名
    fileext: string;                    // 后缀名
    thumbnail: boolean;                 // 是否有缩略图，有的话可以显示
    pdfpreview: boolean;                // 是否有PDF预览，包括doc,xls,等这些文件
    previewmode: 'image' | 'direct' | any// 原文件预览方式,image是图像文件,direct表示可以在网页中直接打开(pdf,mov,mp4,html等)
}


export interface ViewSchemeType {
    title: string | undefined,
    viewschemeid: string | undefined,
}


export interface FormOperType { };

interface ModuleSetting {
    navigate: NavigateSetting,
    userFilterRegionVisible: boolean,
    formVisible: boolean,
    formType: 'display' | 'insert' | 'edit' | 'approve' | '',
    currRecord: object,
}


export interface FormState {
    visible: boolean;
    operType: 'display' | 'insert' | 'edit' | 'approve' | '',

    currRecord: object,
}

export interface ModuleModal {
    moduleid: string,               // 模块id,
    modulename: string,             // 模块名称,
    objectname: string,             // 实体对象中文名称
    primarykey: string,             // 主键
    namefield: string,              // 名称字段，该字段可以用来描述唯一的记录
    namefieldtpl?: string,          // 名称定段tpl,如果单个字段不能用来描述唯一记录，可以用组合字段
    description?: string,           // 模块描述

    moduleLimit: ModuleLimit,       // 当前模块的权限设置
    userLimit: UserLimit,           // 当前用户的权限设置
    selectedmode: string,           // 被选择的方式
    fields: ModuleFieldType[],
    gridDefaultSchemeId: string,
    gridschemes: any[],
    formschemes: any[],
    viewschemes: any,
    userdefinedsorts: any[],
    navigateSchemes: any[],

}

export interface ModuleFilters {
    parentfilter?: any[],       // 父模块的限定条件
    viewscheme: ViewSchemeType, // 当前生效的视图方案
    navigate: any[],            // 当前生效的导航
    searchfilter?: any,         // 查询框中的文字
    columnfilter?: ColumnFilter[],       // 当前生效的列筛选条件
    userdefine?: any[],         // 用户自定义的筛选条件
}

export interface ModuleState {
    moduleName: string,
    moduleInfo: ModuleModal,
    dataSourceLoadCount: number,    // 列表调用次数，当需要刷新时，将此值+1即可
    currentGridschemeid: string,    // 当前显示的列表方案的id
    selectedRowKeys: any[], // 当前选中的记录
    selectedTextValue: TextValue[],  // 当前选中的记录的id和name
    dataSource: any[],              // 当前页的模块数据
    monetary: MonetaryType;
    monetaryPosition: 'behindnumber' | 'columntitle',
    filters: ModuleFilters,
    sorts: SortModal[],
    gridParams: {
        curpage: number,                    // 当前页码
        limit: number,                      // 每页记录数
        start: number,                      // 起始记录数
        total: number,                      // 记录总数
        totalpage: number,                  // 总页数
    },
    currSetting: ModuleSetting,
}


export interface ColumnFilterInfoType {
    title: string;
    comboValue?: TextValue[];
    type: 'dictionary' | 'combobox' | 'string' | 'boolean' | 'number' | 'date';
}

export interface ColumnFilterType {
    [index: string]: ColumnFilterInfoType
}

/**
 * fetchobjectdata返回的数据结构
 */
export interface FetchObjectResponse {
    start: number,
    limit: number,
    total: number,
    curpage: number,
    totalpage: number,
    data: any[],
    spendtime: number,
}
