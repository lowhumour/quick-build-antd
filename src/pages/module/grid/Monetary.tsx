import React from 'react';

import { TextValue } from "../data";

export interface MonetaryType {
    type: string;
    monetaryColoredText: any;
    monetaryText: string;
    monetaryUnit: number;
    unittext: string;
}

const createAMonetary = (type: string, monetaryText: string, monetaryUnit: number, unittext: string): MonetaryType => {
    return {
        type,
        monetaryColoredText: monetaryText ? <span style={{ color: 'green' }}>{monetaryText}</span> : null,
        monetaryText: monetaryText, // 跟在数值后面的金额单位文字,如
        // 100.00万
        monetaryUnit: monetaryUnit, // 显示的数值需要除的分子
        unittext: unittext
        // 跟在字段后面的单位如 合同金额(万元)
    };
}

const monetarys = [
    {
        type: 'unit',
        monerary: createAMonetary('unit', '', 1, '个'),
    },
    {
        type: 'thousand',
        monerary: createAMonetary('thousand', '千', 1000, '千'),
    },
    {
        type: 'tenthousand',
        monerary: createAMonetary('tenthousand', '万', 10000, '万'),
    },
    {
        type: 'million',
        monerary: createAMonetary('million', 'M', 100 * 10000, '百万'),
    },
    {
        type: 'hundredmillion',
        monerary: createAMonetary('hundredmillion', '亿', 10000 * 10000, '亿'),
    }
];

export const getMonetarysValueText = (): TextValue[] => {
    return monetarys.map((monerary): TextValue => {
        return {
            text: monerary.monerary.unittext,
            value: monerary.type,
        }
    })
}

export const getMonetary = (key: string): MonetaryType => {
    const result = monetarys.find((monetary) => monetary.type === key);
    return result ? result.monerary : monetarys[0].monerary;
}

export const getMonetaryUnit = (key: string): number => {
    const monetary = monetarys.find((monetary) => monetary.type === key)?.monerary;
    return monetary ? monetary.monetaryUnit : 1;
}