import React from 'react';
import { Spin } from 'antd';
// import { PageLoading } from '@ant-design/pro-layout';

// loading components from code split
// https://umijs.org/plugin/umi-plugin-react.html#dynamicimport

/**
 * 网页初始加载时的显示
 */

const Loading = () => {
    return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>
}

export default Loading;     //  PageLoading;
