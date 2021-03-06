import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Router from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Checkbox, Button } from 'antd';
import styled from 'styled-components';
import axios from 'axios';
import { END } from 'redux-saga';
import useInput from '../hooks/useInput';
import { LOAD_MY_INFO_REQUEST, SIGN_UP_REQUEST } from '../reducers/user';

import AppLayout from '../components/AppLayout';
import wrapper from '../store/configureStore';
import { LOAD_POSTS_REQUEST } from '../reducers/post';

const SignUp = () => {
  const dispatch = useDispatch();
  const { signUpLoading, signUpDone, signUpError, me } = useSelector((state) => state.user);

  useEffect(() => {
    if (me && me.id) Router.replace('/');
  }, [me && me.id]);

  useEffect(() => {
    if (signUpDone) Router.replace('/');
  }, [signUpDone]);

  useEffect(() => {
    if (signUpError) alert(signUpError);
  }, [signUpError]);

  const [email, onChangeEmail] = useInput('');
  const [nickname, onChangeNickname] = useInput('');
  const [password, onChangePassword] = useInput('');

  const [passwordError, setPasswordError] = useState(false);
  const [passwordCheck, setPasswordCheck] = useState('');
  const onChangePasswordCheck = (event) => {
    setPasswordCheck(event.target.value);
    setPasswordError(event.target.value !== password);
  };

  const [termError, setTermError] = useState(false);
  const [term, setTerm] = useState('');
  const onChangeTerm = (event) => {
    setTerm(event.target.checked);
    setTermError(false);
  };

  const onSubmit = () => {
    if (password !== passwordCheck) setPasswordError(true);
    if (!term) setTermError(true);
    dispatch({
      type: SIGN_UP_REQUEST,
      data: { email, password, nickname },
    });
  };

  return (
    <AppLayout>
      <Head>
        <title>회원가입 | NodeBird</title>
      </Head>
      <Form onFinish={onSubmit}>
        <div>
          <label htmlFor="user-email">이메일</label>
          <br />
          <Input
            name="user-email"
            type="email"
            value={email}
            onChange={onChangeEmail}
            required
          />
        </div>
        <div>
          <label htmlFor="user-nick">닉네임</label>
          <br />
          <Input
            name="user-nickname"
            value={nickname}
            onChange={onChangeNickname}
          />
        </div>
        <div>
          <label htmlFor="user-password">비밀번호</label>
          <br />
          <Input
            name="user-password"
            value={password}
            type="password"
            onChange={onChangePassword}
            required
          />
        </div>
        <div>
          <label htmlFor="user-id">비밀번호 체크</label>
          <br />
          <Input
            name="user-password-check"
            type="password"
            value={passwordCheck}
            onChange={onChangePasswordCheck}
            required
          />
          {passwordError && (
            <ErrorMessage>비밀번호가 일치하지 않습니다</ErrorMessage>
          )}
        </div>
        <div>
          <Checkbox name="user-term" checked={term} onChange={onChangeTerm}>
            정민님 말을 잘 들을 것에 동의합니다
            {termError && <ErrorMessage>약관에 동의하셔야 합니다</ErrorMessage>}
          </Checkbox>
        </div>
        <SubmitButton>
          <Button type="primary" htmlType="submit" loading={signUpLoading}>
            가입하기
          </Button>
        </SubmitButton>
      </Form>
    </AppLayout>
  );
};

const ErrorMessage = styled.div`
  color: red;
`;

const SubmitButton = styled.div`
  margin-top: 10px;
`;

export const getServerSideProps = wrapper.getServerSideProps(async (context) => {
  console.log('getServerSideProps start');
  console.log(context.req.headers);
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  context.store.dispatch({
    type: LOAD_MY_INFO_REQUEST,
  });
  context.store.dispatch(END);
  console.log('getServerSideProps end');
  await context.store.sagaTask.toPromise();
});

export default SignUp;
