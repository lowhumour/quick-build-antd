import { querySyncDicrionaryDefine, querySyncDictionaryData } from './service';

export interface TextValue {
    text: string | undefined;
    value: string | undefined;
}

export interface DictionaryDefine {
    columnsingle: boolean;
    dcode: string;
    dictionaryid: string;
    disablecolumnlist: boolean;
    disabled: boolean;
    inputmethod: string;
    isdisplaycode: boolean;
    isdisplayorderno: boolean;
    islinkedcode: boolean;
    islinkedkey: boolean;
    islinkedorderno: boolean;
    islinkedtext: boolean;
    title: string;
    data: TextValue[];
}

const dictionarys: Record<string, DictionaryDefine> = {};


export const getDictionary = (dictionaryid: string): DictionaryDefine => {
    if (!dictionarys[dictionaryid]) {
        dictionarys[dictionaryid] = querySyncDicrionaryDefine({ id: dictionaryid });
        dictionarys[dictionaryid].data = querySyncDictionaryData({ dictionaryId: dictionaryid }) as TextValue[];
    }
    return dictionarys[dictionaryid];
}



export const getDictionaryData = (dictionaryid: string): TextValue[] => {
    if (!dictionarys[dictionaryid]) {
        dictionarys[dictionaryid] = querySyncDicrionaryDefine({ id: dictionaryid });
        dictionarys[dictionaryid].data = querySyncDictionaryData({ dictionaryId: dictionaryid }) as TextValue[];
    }
    return dictionarys[dictionaryid].data;
}

// 将某个数字典的数组值，转换为文字描述,如果有separator,转换成字符串，否则转换成 数组
export const convertDictionaryValueToText = (dictionaryid: string, values: any[], separator: string | undefined): any => {
    if (!Array.isArray(values))
        values = [values];
    const data = getDictionaryData(dictionaryid);
    const arrayResult: any[] = values.map((value: any) => {
        for (let i in data) {
            if (data[i].value == value)
                return data[i].text;
        }
        return value == 'null' ? '未定义' : value;
    })
    if (separator)
        return arrayResult.join(separator);
    else
        return arrayResult;
}
