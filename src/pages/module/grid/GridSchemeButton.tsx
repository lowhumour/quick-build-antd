import React from 'react';
import { Tooltip, Tag } from 'antd';
import { ModuleModal, ModuleState } from '../data';
import { getModuleInfo, getAllGridSchemes } from '../modules';
import { Dispatch } from 'redux';


const GridSchemeButton = ({ moduleState, dispatch }: { moduleState: ModuleState, dispatch: Dispatch }) => {
    const { moduleName } = moduleState;
    const moduleInfo: ModuleModal = getModuleInfo(moduleName);
    const schemes: any[] = getAllGridSchemes(moduleInfo.gridschemes);
    if (schemes.length < 2) return <span style={{ visibility: 'hidden', width: '0px' }}>1</span>;
    return <>
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


}

export default GridSchemeButton;