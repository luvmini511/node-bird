import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Button, Card, Comment, List, Popover } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  RetweetOutlined,
  HeartOutlined,
  MessageOutlined,
  EllipsisOutlined,
  HeartTwoTone,
} from '@ant-design/icons';
import Link from 'next/link';
import moment from 'moment';

import {
  LIKE_POST_REQUEST,
  REMOVE_POST_REQUEST,
  RETWEET_REQUEST,
  UNLIKE_POST_REQUEST,
} from '../reducers/post';

import PostImages from './PostImages';
import CommentForm from './CommentForm';
import PostCardContent from './PostCardContent';
import FollowButton from './FollowButton';

moment.locale('ko');

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { removePostLoading } = useSelector((state) => state.post);
  const id = useSelector((state) => state.user.me?.id);
  const [commentFormOpened, setCommentFormOpened] = useState(false);

  const onLike = () => {
    if (!id) alert('로그인이 필요합니다');
    return dispatch({
      type: LIKE_POST_REQUEST,
      data: post.id,
    });
  };
  const onUnlike = () => {
    if (!id) alert('로그인이 필요합니다');
    return dispatch({
      type: UNLIKE_POST_REQUEST,
      data: post.id,
    });
  };

  const onToggleComment = () => setCommentFormOpened((prev) => !prev);

  const onRemovePost = () => {
    if (!id) alert('로그인이 필요합니다');
    return dispatch({
      type: REMOVE_POST_REQUEST,
      data: post.id,
    });
  };

  const onRetweet = () => {
    if (!id) alert('로그인이 필요합니다');
    return dispatch({
      type: RETWEET_REQUEST,
      data: post.id,
    });
  };

  const liked = post.Likers.find((v) => v.id === id);
  return (
    <div style={{ marginBottom: 20 }}>
      <Card
        cover={post.Images[0] && <PostImages images={post.Images} />}
        images={post.Images}
        actions={[
          <RetweetOutlined key="retweet" onClick={onRetweet} />,
          liked ? (
            <HeartTwoTone
              twoToneColor="#eb2f96"
              key="heart"
              onClick={onUnlike}
            />
          ) : (
            <HeartOutlined onClick={onLike} key="heart" />
          ),
          <MessageOutlined onClick={onToggleComment} key="comment" />,
          <Popover
            key="more"
            content={(
              <Button.Group>
                {id && post.User.id === id ? (
                  <>
                    <Button>수정</Button>
                    <Button type="danger" loading={removePostLoading} onClick={onRemovePost}>삭제</Button>
                  </>
                ) : (
                  <Button>신고</Button>
                )}
              </Button.Group>
            )}
          >
            <EllipsisOutlined />
          </Popover>,
        ]}
        title={post.RetweetId && `${post.User.nickname}님이 리트윗하셨습니다`}
        extra={id && <FollowButton post={post} />}
      >
        {post.RetweetId && post.Retweet
          ? (
            <Card
              cover={post.Retweet.Images[0] && <PostImages images={post.Retweet.Images} />}
            >
              <div style={{ float: 'right' }}>{moment(post.createdAt).format('YYYY.MM.DD')}</div>
              <Card.Meta
                avatar={(
                  <Link href={`/user/${post.Retweet.User.id}`}>
                    <a><Avatar>{post.Retweet.User.nickname[0]}</Avatar></a>
                  </Link>
                )}
                title={post.Retweet.User.nickname}
                description={<PostCardContent postContents={post.Retweet.content} />}
              />
            </Card>
          )
          : (
            <>
              <div style={{ float: 'right', color: 'grey' }}>{moment(post.createdAt).startOf('day').fromNow()}</div>
              <Card.Meta
                avatar={(
                  <Link href={`/user/${post.User.id}`}>
                    <a><Avatar>{post.User.nickname[0]}</Avatar></a>
                  </Link>
              )}
                title={post.User.nickname}
                description={<PostCardContent postContents={post.content} />}
              />
            </>
          )}
      </Card>
      {commentFormOpened && (
        <div>
          <CommentForm post={post} />
          <List
            header={`${post.Comments ? post.Comments.length : 0}개의 댓글`}
            itemLayout="horizontal"
            dataSource={post.Comments || []}
            renderItem={(item) => (
              <li>
                <Comment
                  author={item.User.nickname}
                  avatar={(
                    <Link href={`/user/${item.User.id}`}>
                      <a><Avatar>{item.User.nickname[0]}</Avatar></a>
                    </Link>
                  )}
                  content={item.content}
                />
              </li>
            )}
          />
        </div>
      )}
      {/* <CommentForm /> */}
      {/* <Comments /> */}
    </div>
  );
};

PostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.number,
    User: PropTypes.object,
    content: PropTypes.string,
    createdAt: PropTypes.string,
    Comments: PropTypes.arrayOf(PropTypes.object),
    Images: PropTypes.arrayOf(PropTypes.object),
    Likers: PropTypes.arrayOf(PropTypes.object),
    RetweetId: PropTypes.number,
    Retweet: PropTypes.objectOf(PropTypes.any),
  }),
};

export default PostCard;
