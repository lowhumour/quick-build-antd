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

