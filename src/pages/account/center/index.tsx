import { TagOutlined, PlusOutlined, GiftOutlined, ClusterOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Card, Col, Divider, Input, Row, Tag } from 'antd';
import React, { Component } from 'react';

import { Dispatch } from 'redux';
import { GridContent } from '@ant-design/pro-layout';
import { RouteChildrenProps } from 'react-router';
import { connect } from 'dva';
import Projects from './components/Projects';
import Articles from './components/Articles';
import Applications from './components/Applications';
import UserLimits from './components/UserLimits';
import UserLoginLog from './components/UserLoginLog';
import { CurrentUser } from './data.d';
import styles from './Center.less';
import { ModalState } from '@/models/accountCenter';

const operationTabList = [
  {
    key: 'userLimits',
    tab: (
      <span>
        用户权限
      </span>
    ),
  },
  {
    key: 'userLoginLog',
    tab: (
      <span>
        登录日志
      </span>
    ),
  },
  {
    key: 'articles',
    tab: (
      <span>
        文章 <span style={{ fontSize: 14 }}>(8)</span>
      </span>
    ),
  },
  {
    key: 'applications',
    tab: (
      <span>
        应用 <span style={{ fontSize: 14 }}>(8)</span>
      </span>
    ),
  },
  {
    key: 'projects',
    tab: (
      <span>
        项目 <span style={{ fontSize: 14 }}>(8)</span>
      </span>
    ),
  },
];

interface CenterProps extends RouteChildrenProps {
  dispatch: Dispatch<any>;
  currentUser: Partial<CurrentUser>;
  currentUserLoading: boolean;
}
interface CenterState {
  //newTags: TagType[];
  tabKey?: 'userLimits' | 'userLoginLog' | 'articles' | 'applications' | 'projects';
  inputVisible?: boolean;
  inputValue?: string;
  signatureInputVisible: boolean;
}

class Center extends Component<
  CenterProps,
  CenterState
  > {
  // static getDerivedStateFromProps(
  //   props: accountCenterProps,
  //   state: accountCenterState,
  // ) {
  //   const { match, location } = props;
  //   const { tabKey } = state;
  //   const path = match && match.path;

  //   const urlTabKey = location.pathname.replace(`${path}/`, '');
  //   if (urlTabKey && urlTabKey !== '/' && tabKey !== urlTabKey) {
  //     return {
  //       tabKey: urlTabKey,
  //     };
  //   }

  //   return null;
  // }

  state: CenterState = {
    inputVisible: false,
    signatureInputVisible: false,
    inputValue: '',
    tabKey: 'userLimits',
  };

  public input: Input | null | undefined = undefined;
  public signatureInput: Input | null | undefined = undefined;

  componentDidMount() {
    const { dispatch, currentUser } = this.props;
    const { personnel } = currentUser;
    if (!(personnel && personnel.name)) {
      dispatch({
        type: 'accountCenter/fetchCurrent',
      });
      dispatch({
        type: 'accountCenter/fetch',
      });
    }
  }
  onTabChange = (key: string) => {
    // If you need to sync state to url
    // const { match } = this.props;
    // router.push(`${match.url}/${key}`);
    this.setState({
      tabKey: key as CenterState['tabKey'],
    });
  };

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input && this.input.focus());
  };

  saveInputRef = (input: Input | null) => {
    this.input = input;
  };

  saveSignatureInputRef = (input: Input | null) => {
    this.signatureInput = input;
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ inputValue: e.target.value });
  };

  signatureInputConfirm = () => {
    const { dispatch } = this.props;
    let text: string = this.signatureInput && this.signatureInput.state.value;
    if (text)
      text = text.trim();
    dispatch({
      type: 'accountCenter/editSignature',
      payload: {
        text: text || '',
      },
    })
    this.setState({
      signatureInputVisible: false,
    });
  }

  handleInputConfirm = () => {
    const { state } = this;
    let { inputValue } = state;
    const { dispatch } = this.props;
    const { currentUser: { personnel } } = this.props;
    let { tags } = personnel;
    inputValue = inputValue && inputValue.trim();
    if (inputValue && tags.filter((tag: any) => tag.label === inputValue).length === 0) {
      dispatch({
        type: 'accountCenter/addTag',
        payload: {
          label: inputValue,
        },
      })
    }
    this.setState({
      inputVisible: false,
      inputValue: '',
    });
  };

  removeTag = (label: string) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'accountCenter/removeTag',
      payload: {
        label,
      },
    })
  }


  renderChildrenByTabKey = (tabKey: CenterState['tabKey']) => {
    if (tabKey === 'projects') {
      return <Projects />;
    }
    if (tabKey === 'applications') {
      return <Applications />;
    }
    if (tabKey === 'articles') {
      return <Articles />;
    }
    if (tabKey === 'userLimits') {
      return <UserLimits />
    }
    if (tabKey === 'userLoginLog') {
      return <UserLoginLog />
    }

    return null;
  };

  render() {
    const { inputVisible, inputValue, tabKey, signatureInputVisible } = this.state;
    const { currentUser, currentUserLoading } = this.props;
    const { personnel, user } = currentUser;
    const dataLoading = currentUserLoading || !(personnel && Object.keys(personnel).length);
    return (
      <GridContent>
        <Row gutter={24}>
          <Col lg={7} md={24}>
            <Card bordered={false} style={{ marginBottom: 24 }} loading={dataLoading}>
              {!dataLoading ? (
                <div>
                  <div className={styles.avatarHolder}>
                    <img alt="" src="/api/platform/systemframe/getuserfavicon.do" />
                    <div className={styles.name}>{personnel.name}</div>
                    {signatureInputVisible ? (
                      <Input
                        ref={ref => this.saveSignatureInputRef(ref)}
                        type="text"
                        size="small"
                        style={{ width: '80%' }}
                        maxLength={30}
                        defaultValue={personnel.signature}
                        onBlur={this.signatureInputConfirm}
                        onPressEnter={this.signatureInputConfirm}
                      />
                    ) : <div onClick={() => {
                      this.setState({ signatureInputVisible: true },
                        () => this.signatureInput && this.signatureInput.focus())
                    }}>{personnel.signature ? personnel.signature : '上善若水，厚德载物'}</div>}

                  </div>
                  <div className={styles.detail}>
                    <p>
                      <GiftOutlined />
                      {personnel.technical} {personnel.stationname}
                    </p>
                    <p>
                      <ClusterOutlined />
                      {personnel.orgfullname}
                    </p>
                    <p>
                      <EnvironmentOutlined /> 江苏 无锡
                      {/* {personnel.geographic.province.label}
                      {personnel.geographic.city.label} */}
                    </p>
                  </div>
                  <Divider dashed />
                  <div className={styles.tags}>
                    <div className={styles.tagsTitle}>个人标签</div>
                    {personnel.tags.map((item: any) => (
                      <Tag key={item.key} closable
                        onClose={() => this.removeTag(item.label)}>
                        {item.label}
                      </Tag>
                    ))}
                    {inputVisible && (
                      <Input
                        ref={ref => this.saveInputRef(ref)}
                        type="text"
                        size="small"
                        style={{ width: 78 }}
                        maxLength={20}
                        value={inputValue}
                        onChange={this.handleInputChange}
                        onBlur={this.handleInputConfirm}
                        onPressEnter={this.handleInputConfirm}
                      />
                    )}
                    {!inputVisible && (
                      <Tag
                        onClick={this.showInput}
                        style={{ background: '#fff', borderStyle: 'dashed' }}
                      >
                        <PlusOutlined />
                      </Tag>
                    )}
                  </div>
                  <Divider style={{ marginTop: 16 }} dashed />
                  <div className={styles.team}>
                    <div className={styles.teamTitle}>权限组</div>
                    <Row gutter={36}>
                      {user.roles &&
                        user.roles.map((item: any) => (
                          <Col key={item} lg={24} xl={24}>
                            <TagOutlined /> <i />
                            {item}
                          </Col>
                        ))}
                    </Row>
                  </div>
                </div>
              ) : null}
            </Card>
          </Col>
          <Col lg={17} md={24}>
            <Card
              className={styles.tabsCard}
              bordered={false}
              tabList={operationTabList}
              activeTabKey={tabKey}
              onTabChange={this.onTabChange}
            >
              {this.renderChildrenByTabKey(tabKey)}
            </Card>
          </Col>
        </Row>
      </GridContent>
    );
  }
}

export default connect(
  ({
    loading,
    accountCenter,
  }: {
    loading: { effects: { [key: string]: boolean } };
    accountCenter: ModalState;
  }) => ({
    currentUser: accountCenter.currentUser,
    currentUserLoading: loading.effects['accountCenter/fetchCurrent'],
  }),
)(Center);
