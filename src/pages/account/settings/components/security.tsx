
import React, { Component } from 'react';

import { List } from 'antd';
import { useIntl } from 'umi';

const { formatMessage } = useIntl();
type Unpacked<T> = T extends (infer U)[] ? U : T;

const passwordStrength = {
  strong: (
    <span className="strong">
      { formatMessage ({id:"accountandsettings.security.strong"})}
    </span>
  ),
  medium: (
    <span className="medium">
      { formatMessage ({id:"accountandsettings.security.medium"})}
    </span>
  ),
  weak: (
    <span className="weak">
      { formatMessage ({id:"accountandsettings.security.weak" })}
      Weak
    </span>
  ),
};

class SecurityView extends Component {
  getData = () => [
    {
      title: formatMessage({ id: 'accountandsettings.security.password' }, {}),
      description: (
        <>
          {formatMessage({ id: 'accountandsettings.security.password-description' })}：
          {passwordStrength.strong}
        </>
      ),
      actions: [
        <a key="Modify">
         { formatMessage ({id:"accountandsettings.security.modify" })}
        </a>,
      ],
    },
    {
      title: formatMessage({ id: 'accountandsettings.security.phone' }, {}),
      description: `${formatMessage(
        { id: 'accountandsettings.security.phone-description' },
        {},
      )}：138****8293`,
      actions: [
        <a key="Modify">
          { formatMessage ({id:"accountandsettings.security.modify" })}
        </a>,
      ],
    },
    {
      title: formatMessage({ id: 'accountandsettings.security.question' }, {}),
      description: formatMessage({ id: 'accountandsettings.security.question-description' }, {}),
      actions: [
        <a key="Set">
         { formatMessage ({id:"accountandsettings.security.set" })}
        </a>,
      ],
    },
    {
      title: formatMessage({ id: 'accountandsettings.security.email' }, {}),
      description: `${formatMessage(
        { id: 'accountandsettings.security.email-description' },
        {},
      )}：ant***sign.com`,
      actions: [
        <a key="Modify">
          { formatMessage ({id:"accountandsettings.security.modify" })}
        </a>,
      ],
    },
    {
      title: formatMessage({ id: 'accountandsettings.security.mfa' }, {}),
      description: formatMessage({ id: 'accountandsettings.security.mfa-description' }, {}),
      actions: [
        <a key="bind">
          { formatMessage ({id:"accountandsettings.security.bind" })}
        </a>,
      ],
    },
  ];

  render() {
    const data = this.getData();
    return (
      <>
        <List<Unpacked<typeof data>>
          itemLayout="horizontal"
          dataSource={data}
          renderItem={item => (
            <List.Item actions={item.actions}>
              <List.Item.Meta title={item.title} description={item.description} />
            </List.Item>
          )}
        />
      </>
    );
  }
}

export default SecurityView;
