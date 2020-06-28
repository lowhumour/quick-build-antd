import React from 'react';
import { Tooltip, Radio } from 'antd';
import { ModuleModal, ModuleState } from '../data';
import { getModuleInfo, getAllGridSchemes } from '../modules';
import { Dispatch } from 'redux';
import { RadioChangeEvent } from 'antd/lib/radio';


const GridSchemeButton = ({ moduleState, dispatch }: { moduleState: ModuleState, dispatch: Dispatch }) => {
    const { moduleName } = moduleState;
    const moduleInfo: ModuleModal = getModuleInfo(moduleName);
    const schemes: any[] = getAllGridSchemes(moduleInfo.gridschemes);
    if (schemes.length < 2)
        return <span style={{ visibility: 'hidden', width: '0px' }}>1</span>;
    else
        return <Radio.Group value={moduleState.currentGridschemeid} size="small"
            onChange={(e: RadioChangeEvent) => {
                dispatch({
                    type: 'modules/gridSchemeChanged',
                    payload: {
                        moduleName,
                        gridschemeid: e.target.value,
                    }
                })
            }}>
            {schemes.map((scheme: any, index: number) =>
                <Radio.Button value={scheme.gridschemeid}>
                    <Tooltip title={scheme.schemename}>
                        <span>{index + 1}</span>
                    </Tooltip>
                </Radio.Button>
            )}
        </Radio.Group>
}

export default GridSchemeButton;

/**
 * <>
        {schemes.map((scheme: any, index: number) =>
            <Tooltip title={scheme.schemename}>
                <Tag style={{ margin: '0px' }} color={moduleState.currentGridschemeid === scheme.gridschemeid ? '#108ee9' : ''}
                    onClick={() => {
                        dispatch({
                            type: 'modules/gridSchemeChanged',
                            payload: {
                                moduleName,
                                gridschemeid: scheme.gridschemeid,
                            }
                        })
                    }}
                >{index + 1}</Tag>
            </Tooltip>
        )}
</>


 */