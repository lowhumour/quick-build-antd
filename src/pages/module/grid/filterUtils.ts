import { Key } from "react";
import { ColumnFilter, ColumnFilterType, ModuleState } from "../data";
import { getUserFilterCount, stringFieldOperator, numberFieldOperator, changeUserFilterToParam } from "../UserDefineFilter";

/**
 * 所有模块的grid column 的筛选的信息
 * 
 */
const columnFilterInfo: Record<Key, ColumnFilterType> = {};


export const getColumnFiltersInfo = (moduleid: string) => {
    if (!columnFilterInfo[moduleid])
        columnFilterInfo[moduleid] = {};
    return columnFilterInfo[moduleid]
}
export const getColumnFilterInfo = (moduleid: string, dataIndex: string) => {
    if (!columnFilterInfo[moduleid])
        columnFilterInfo[moduleid] = {};
    if (!columnFilterInfo[moduleid][dataIndex])
        columnFilterInfo[moduleid][dataIndex] = { title: '', type: 'string' };
    return columnFilterInfo[moduleid][dataIndex];
}

export const getAllFilterCount = (moduleState: ModuleState): number => {
    return (moduleState.filters.viewscheme.viewschemeid ? 1 : 0) +
        (moduleState.filters.columnfilter ? moduleState.filters.columnfilter.length : 0) +
        (moduleState.filters.navigate ? moduleState.filters.navigate.length : 0) +
        getUserFilterCount(moduleState.filters.userfilter);
}

/**
 * 获取所有的条件，用于fetch data时传送到后台的筛选参数
 */
export const getAllFilterAjaxParam = (moduleState: ModuleState) => {
    const payload: any = {};
    const { filters } = moduleState;
    const { columnfilter, navigate, viewscheme, userfilter } = filters;
    if (columnfilter && columnfilter.length > 0)
        payload.filter = JSON.stringify(columnfilter);
    if (navigate)
        payload.navigates = JSON.stringify(navigate);
    if (viewscheme.viewschemeid)
        payload.viewschemeid = viewscheme.viewschemeid;
    if (userfilter && userfilter.length) {
        payload.userfilter = changeUserFilterToParam(userfilter);
        if (payload.userfilter.length)
            payload.userfilter = JSON.stringify(payload.userfilter);
        else
            delete payload.userfilter;
    }
    return payload;
}

/**
 * 获取所有的条件文本描述
 * property
 * operator
 * value
 */
export const getAllFilterAjaxText = (moduleState: ModuleState): any[] => {
    const { moduleName } = moduleState;
    const result: any[] = [];

    result.push(...changeUserFilterToParam(moduleState.filters.userfilter, true).
        map((f: any) => {
            const result = { ...f };
            result.property = result.title;
            result.operator = getOperateTitle(result.operator); 
            delete result.title;
            return result;
        }))

    result.push(...getGridColumnFiltersDescription(moduleState.filters.columnfilter || [],
        getColumnFiltersInfo(moduleName), ','))

    result.push(...moduleState.filters.navigate);

    if (moduleState.filters.viewscheme.viewschemeid)
        result.push({
            property: '视图方案：' + moduleState.filters.viewscheme.title,
            operator: null,
            value: null,
        })

    return result;
}

/**
 * 根据用户的选择来生成ajax中的筛选条件
 *     用户可选择的列筛选条件，包括Boolean,数据字典等。
 * 
 * @param filters { issystem:['1'] , isowner: ['2','3'] }
 * 返回结果
 * filter: [{"property":"issystem","value":"null,1","operator":"in"}]
 * filter: [{"property":"issystem","value":"1","operator":"=="}]
 */
export const getGridColumnFilters = (filters: Record<string, Key[] | null>,
    columnFilterInfo: ColumnFilterType): ColumnFilter[] => {
    const result: ColumnFilter[] = new Array();
    for (var key in filters) {
        let value = filters[key];
        if (value !== null && value !== undefined) {
            let filter: any = {
                property: key,
                value: value.join(','),
                operator: "in",
            }
            switch (columnFilterInfo[key].type) {
                case 'number':
                    if (value[1] === null || value[1] === undefined)  //如果没有选择数值，那么就不参加筛选
                        continue;
                    filter.operator = value[0] ? value[0] : '=';
                    filter.value = value[1];
                    break;
                case 'string':
                    filter.operator = 'like';
                    filter.value = value[0];
                    break;
                default:
                    break;
            }
            result.push(filter);
        }
    }
    return result;
};


/**
 * 
 * 生成当前grid列的筛选条件的描述说明
 * 
 */
export const getGridColumnFiltersDescription = (filters: ColumnFilter[],
    columnFilterInfo: ColumnFilterType, sepatater: string = ','): ColumnFilter[] => {
    let result: ColumnFilter[] = new Array();
    result = filters.map((filter): ColumnFilter => {
        const { comboValue } = columnFilterInfo[filter.property];
        if (comboValue) {
            const array = filter.value.split(',');
            return {
                dataIndex: filter.property,
                property: columnFilterInfo[filter.property].title,
                operator: filter.operator,
                value: array.map((item: string) => {
                    for (var i in comboValue) {
                        if (comboValue[i].value == item)
                            return comboValue[i].text;
                    }
                    return '';
                }).join(sepatater),
            }
        } else
            return {
                dataIndex: filter.property,
                property: columnFilterInfo[filter.property].title,
                operator: filter.operator,
                value: filter.value,
            }
    })
    return result;
};


/**
 * 判断当前的grid的列的筛选状态和model中的是否一致,不一致则重新进行筛选
 * @param columnFilter  当前modal中的筛选
 * @param filters       grid column 中的字段筛选
 */
export const isGridFilterChanged = (columnFilter: ColumnFilter[] = [],
    filters: Record<string, Key[] | null>, columnFilterInfo: ColumnFilterType): boolean => {
    return JSON.stringify(columnFilter) !== JSON.stringify(getGridColumnFilters(filters, columnFilterInfo));
}

/**
 * 根据当前model中的筛选设置来取得某个字段的筛选值，用于grid重新渲染时指定列的筛选值
 * @param sorts 
 * @param columnKey 每个字段都有field表示是显示的字段，
 *                  columnKey表示是key字段。如field=field.name,columnKey=field.primarykey
 */
export const getColumnFilterValue = (columnFilter: ColumnFilter[] = [], columnKey: string): Key[] | null => {
    for (var i in columnFilter) {
        if (columnFilter[i].property === columnKey)
            return columnFilter[i].value.toString().split(',');
    }
    return null;
}

export const getStringColumnFilterValue = (columnFilter: ColumnFilter[] = [], columnKey: string): Key[] | null => {
    for (var i in columnFilter) {
        if (columnFilter[i].property === columnKey)
            if (columnFilter[i].value)
                return [columnFilter[i].value];
    }
    return null;
}

export const getNumberColumnFilterValue = (columnFilter: ColumnFilter[] = [], columnKey: string): Key[] | null => {
    for (var i in columnFilter) {
        if (columnFilter[i].property === columnKey)
            if (columnFilter[i].value)
                return [columnFilter[i].operator, columnFilter[i].value];
    }
    return null;
}

export const getBooleanFilter = (isrequired: boolean) => {
    return isrequired ? [
        { text: '是', value: 1, },
        { text: '否', value: 0, },
    ] : [
            { text: '是', value: 1, },
            { text: '否', value: 0, },
            { text: '未定义', value: 'null', }
        ];
};


export const NumberSelectOption = [
    { value: '=', text: '=' },
    { value: '>=', text: '>=' },
    { value: '>', text: '>' },
    { value: '<=', text: '<=' },
    { value: '<', text: '<' },
    { value: '<>', text: '<>' },
    { value: 'in', text: '列表' },
    { value: 'not in', text: '列表外' },
    { value: 'between', text: '区间' },
    { value: 'not between', text: '区间外' }];

const OptionSelectOption = [
    { value: 'like', text: '包含' },
    { value: 'is null', text: '' },
]

export const getOperateTitle = (operate: string): string => {
    let result: any = NumberSelectOption.filter(item => item.value === operate);
    if (result.length > 0)
        return result[0].text;
    result = OptionSelectOption.filter(item => item.value === operate);
    if (result.length > 0)
        return result[0].text;
    result = stringFieldOperator.filter(item => item.value === operate);
    if (result.length > 0)
        return result[0].text;
    result = numberFieldOperator.filter(item => item.value === operate);
    if (result.length > 0)
        return result[0].text;
    return operate;
}