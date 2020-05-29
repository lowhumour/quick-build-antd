/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, {
  MenuDataItem,
  BasicLayoutProps as ProLayoutProps,
  Settings,
} from '@ant-design/pro-layout';
import React, { useEffect } from 'react';
import { Link, useIntl, connect, Dispatch } from 'umi';
import { BankOutlined, PhoneOutlined, QqOutlined, MailOutlined, UserOutlined, PhoneFilled, CopyrightOutlined } from '@ant-design/icons';
import { Result, Button, Popover } from 'antd';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { ConnectState } from '@/models/connect';
import { getAuthorityFromRouter } from '@/utils/utils';
import { SystemInfo } from '@/models/systeminfo';

const noMatch = (
  <Result
    status={403}
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={
      <Button type="primary">
        <Link to="/user/login">Go Login</Link>
      </Button>
    }
  />
);
export interface BasicLayoutProps extends ProLayoutProps {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
  route: ProLayoutProps['route'] & {
    authority: string[];
  };
  settings: Settings;
  dispatch: Dispatch;
  systemInfo: SystemInfo;
}
export type BasicLayoutContext = { [K in 'location']: BasicLayoutProps[K] } & {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
};
/**
 * use Authorized check all menu item
 */

const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] =>
  menuList.map((item) => {
    const localItem = { ...item, children: item.children ? menuDataRender(item.children) : [] };
    return Authorized.check(item.authority, localItem, null) as MenuDataItem;
  });


  export const footerRender = (props: any) => {
    const { systemInfo: { company, systeminfo } } = props;
    const { servicetelnumber: telnumber } = company;
    const style: React.CSSProperties = {
      padding: '0px 24px 8px 24px',
      textAlign: 'center',
    }
    const styleCopyright: React.CSSProperties = {
      padding: '0px 24px 36px 24px',
      textAlign: 'center',
    }
    const iconStyle: React.CSSProperties = {
      marginLeft: '20px',
      marginRight: '3px',
    }
    let serviceDepartment = <span style={iconStyle}>{'服务单位:' + company.servicedepartment}</span>;
    if (company.servicehomepage) {
      serviceDepartment = <a href={company.servicehomepage} target="_blank">{serviceDepartment}</a>
    }
    const content = <>
      {telnumber ? <div><PhoneOutlined style={{ marginRight: '10px' }} />{telnumber}</div> : null}
      {company.serviceqq ? <div><QqOutlined style={{ marginRight: '10px' }} />{company.serviceqq}</div> : null}
      {company.serviceemail ? <div><MailOutlined style={{ marginRight: '10px' }} />{company.serviceemail}</div> : null}
    </>;
  
    return (
      <>
        <div style={style}>
          <BankOutlined style={iconStyle} /> {company.companyname}
          {serviceDepartment}
          {company.servicemen ?
            <Popover trigger="click" title={<>服务人员：{company.servicemen}</>} content={content}>
              <Button type="link">
                <UserOutlined />
                {company.servicemen}
                {telnumber ? <span><PhoneFilled style={{ marginRight: '2px', marginLeft: '10px' }} />{telnumber}</span> : ''}
              </Button>
            </Popover>
            : ''}
        </div>
        <div style={styleCopyright}> <CopyrightOutlined />{systeminfo.copyrightinfo} </div>
      </>
    );
  };
  

const BasicLayout: React.FC<BasicLayoutProps> = (props) => {
  const {
    dispatch,
    children,
    settings,
    location = {
      pathname: '/',
    },
    systemInfo,
  } = props;
  /**
   * constructor
   */

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      });
      dispatch({
        type: 'settings/getSetting',
      });
      if (!systemInfo.company.companyname) {
        dispatch({
          type: 'systemInfo/fetch',
          payload: {
            dispatch,
          },
        })
      }
    }
  }, []);
  /**
   * init variables
   */

  const handleMenuCollapse = (payload: boolean): void => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  }; // get children authority

  const authorized = getAuthorityFromRouter(props.route.routes, location.pathname || '/') || {
    authority: undefined,
  };
  const { formatMessage } = useIntl();

  return (
    <ProLayout
    logo="/api/login/systemfavicon.do" // {logo}
    formatMessage={formatMessage}
    menuHeaderRender={(logoDom, titleDom) => (
      <Link to="/">
        {logoDom}
        {titleDom}
      </Link>
    )}
      onCollapse={handleMenuCollapse}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl || menuItemProps.children || !menuItemProps.path) {
          return defaultDom;
        }

        return <Link to={menuItemProps.path}>{defaultDom}</Link>;
      }}
      breadcrumbRender={(routers = []) => [
        {
          path: '/',
          breadcrumbName: formatMessage({ id: 'menu.home' }),
        },
        ...routers,
      ]}
      itemRender={(route, params, routes, paths) => {
        const first = routes.indexOf(route) === 0;
        return first ? (
          <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
        ) : (
          <span>{route.breadcrumbName}</span>
        );
      }}
      footerRender={footerRender}
      menuDataRender={menuDataRender}
      rightContentRender={() => <RightContent />}
      {...props}
      {...settings}
    >
      <Authorized authority={authorized!.authority} noMatch={noMatch}>
        {children}
      </Authorized>
    </ProLayout>
  );
};

export default connect(({ global, settings, systemInfo }: ConnectState) => ({
  collapsed: global.collapsed,
  settings,
  ...systemInfo,
}))(BasicLayout);
