import { AlipayOutlined, DingdingOutlined, TaobaoOutlined } from '@ant-design/icons';
import { List } from 'antd';
import React, { Component, Fragment } from 'react';
import { useIntl } from 'umi';


const { formatMessage } = useIntl();


class BindingView extends Component {
  getData = () => [
    {
      title: formatMessage({ id: 'accountandsettings.binding.taobao' }, {}),
      description: formatMessage({ id: 'accountandsettings.binding.taobao-description' }, {}),
      actions: [
        <a key="Bind">
          { formatMessage ({id:"accountandsettings.binding.bind"})}
        </a>,
      ],
      avatar: <TaobaoOutlined className="taobao" />,
    },
    {
      title: formatMessage({ id: 'accountandsettings.binding.alipay' }, {}),
      description: formatMessage({ id: 'accountandsettings.binding.alipay-description' }, {}),
      actions: [
        <a key="Bind">
         { formatMessage ({id:"accountandsettings.binding.bind" })}
        </a>,
      ],
      avatar: <AlipayOutlined className="alipay" />,
    },
    {
      title: formatMessage({ id: 'accountandsettings.binding.dingding' }, {}),
      description: formatMessage({ id: 'accountandsettings.binding.dingding-description' }, {}),
      actions: [
        <a key="Bind">
          { formatMessage ({id:"accountandsettings.binding.bind" })}
        </a>,
      ],
      avatar: <DingdingOutlined className="dingding" />,
    },
  ];

  render() {
    return (
      <Fragment>
        <List
          itemLayout="horizontal"
          dataSource={this.getData()}
          renderItem={item => (
            <List.Item actions={item.actions}>
              <List.Item.Meta
                avatar={item.avatar}
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Fragment>
    );
  }
}

export default BindingView;
