import { Key } from "react";

export interface ModuleNavigates {

    [moduleName: string]: NavigateStateModal[];      // 所有模块的导航信息

}

export interface NavigateStateModal {
    navigateschemeid: string,           // 导航方案id
    title: string,                      // 导航的名称
    loading: 'needload' | 'loading' | 'loaded',// 请求数据的状态，'needload','loading,'loaded','

    allowNullRecordButton: boolean,     // 是否允许在包含无记录导航之间切换
    isContainNullRecord: boolean,       // 是否包含无记录导航值，当allowNullRecordButton为true时，可以切换
    cascading: boolean,                 // 是否层级，为false则定义的各级都平级展示，当allLevel大于1时可以切换
    allLevel: number,                   // 导航定义的层数

    parentFilter?: any[],               // 父级条件约束

    canExpandedKeys: string[],          // 所有的可以拆叠的节点,1000是根节点

    expandedKeys: string[],             // 当前展开的所有节点的key

    dataSource?: any[],                 // 所有导航的数据
    depth?: numbrer,                    // 导航树的深度,大于等于allLevel
    search?: string,                    // 搜索的文字
    nodeCount: number,                  // 一共有多少个节点
}