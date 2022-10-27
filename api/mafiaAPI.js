import axios from "axios";

const instance = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://gjgjajaj.xyz/api"
      : "http://localhost:3065/api",
  withCredentials: true,
});

// Socket
export const socketJoin = () => {
  // 게임 방 참가 이벤트
  return instance.post("/Socket/join");
};

export const socketUpdate = () => {
  // 게임 방 정보 수정 이벤트
  return instance.post("/Socket/update");
};

export const socketOnlinelist = () => {
  // 게임 방 멤버들 정보 최신화
  return instance.post("/Socket/onlinelist");
};

export const socketMessage = () => {
  // 게임 방 채팅 이벤트
  return instance.post("/Socket/message");
};

export const socketStart = () => {
  // 게임 시작 이벤트
  return instance.post("/Socket/start");
};

export const socketReady = () => {
  // 게임 준비 이벤트
  return instance.post("/Socket/ready");
};

export const socketUnready = () => {
  // 게임 준비 해제 이벤트
  return instance.post("/Socket/unready");
};

// Auth
export const loginWithGoogle = () => {
  return instance.get(`/auth/google/login`);
};

export const redirectWithGoogle = () => {
  return instance.get(`/auth/google/redirect`);
};

export const loginWithNaver = () => {
  return instance.get(`/auth/naver/login`);
};

export const redirectWithNaver = () => {
  return instance.get(`/auth/naver/redirect`);
};

export const loginWithKakao = () => {
  return instance.get(`/auth/kakao/login`);
};

export const redirectWithKakao = () => {
  return instance.get(`/auth/kakao/redirect`);
};

export const logout = () => {
  return instance.post(`/auth/logout`);
};

// Users
export const checkNicknameDuplication = (nickname) => {
  // 닉네임 중복확인
  return instance.get(`/users/profile/check-duplicate/nickname/${nickname}`);
};

export const getMyInformation = () => {
  // 내 정보 가져오기
  return instance.get(`/users`);
};

export const withdrawUser = () => {
  // 회원 탈퇴
  return instance.delete(`/users`);
};

export const getUserInformation = (userId) => {
  // 특정 유저 정보 불러오기
  return instance.get(`/users/profile/${userId}`);
};

export const getUserInformationByNickname = (nickname) => {
  // 특정 유저 정보 불러오기(닉네임으로)
  return instance.get(`/users/profile?nickname=${nickname}`);
};

export const storeProfileImage = (image) => {
  // 프로필 이미지 저장
  const formData = new FormData();
  formData.append("image", image);
  return instance.post(`/users/profile/image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const destroyProfileImage = () => {
  // 프로필 이미지 삭제
  return instance.delete(`/users/profile/image`);
};

export const makeProfile = (data) => {
  // 프로필 생성
  return instance.post(`/users/profile`, data);
};

export const editProfile = (data) => {
  // 프로필 수정
  return instance.patch(`/users/profile`, data);
};

export const requestFriend = (id, requestId) => {
  // 친구 신청
  // id: 친구 신청할 유저의 id
  // requestId: 친구 신청 이벤트를 발생시킬 유저의 id
  return instance.post(`/users/${id}/requests/friends/${requestId}`);
};

export const confirmFriendRequest = (id, requestId, data) => {
  // 친구 신청 수락 / 거절
  // requestId: 이벤트를 발생시킬 유저의 id
  return instance.patch(`/users/${id}/requests/friends/${requestId}`, data);
};

export const deleteFriend = (id, friendId) => {
  // 친구 삭제
  // id: 내 id
  // friendId: 삭제할 친구의 id
  return instance.delete(`/users/${id}/friend/${friendId}`);
};

// Notifications
export const getNotifications = (userId) => {
  // 내 알림 목록 가져오기
  return instance.get(`/users/${userId}/notifications`);
};

export const readNotification = (id, data) => {
  // 알림 읽음 처리
  return instance.patch(`/users/${id}/notifications/read`, data);
};

// Posts
export const getPosts = ({ category, page, perPage = 10 }) => {
  // 게시물들 불러오기
  return instance.get(
    `/posts?category=${category}&page=${page}&perPage=${perPage}`
  );
};

export const detailPost = (postId) => {
  // 게시물 자세히 보기
  return instance.get(`/posts/${postId}`);
};

export const savePost = (data) => {
  // 게시물 등록
  return instance.post(`/posts`, data);
};

export const editPost = (postId, data) => {
  // 게시물 수정
  return instance.patch(`/posts/${postId}`, data);
};

export const deletePost = (postId) => {
  // 게시물 삭제
  return instance.delete(`/posts/${postId}`);
};

export const savePostImage = (data) => {
  // 게시물 이미지 저장
  return instance.post(`/posts/upload`, data);
};

export const deletePostImage = () => {
  // 게시물 이미지 삭제
  return instance.delete(`/posts/image`);
};

export const upVotePost = (postId) => {
  // 게시물 추천
  return instance.patch(`/posts/like/${postId}`);
};

export const downVotePost = (postId) => {
  // 게시물 추천 취소
  return instance.delete(`/posts/like/${postId}`);
};

// Comments
export const saveComment = (postId, data) => {
  // 댓글 등록
  return instance.post(`posts/` + postId + `/comments`, data);
};

export const editComment = (commentId, data) => {
  // 댓글 수정
  return instance.patch(`/comments/${commentId}`, data);
};

export const deleteComment = (commentId) => {
  // 댓글 삭제
  return instance.delete(`/comments/${commentId}`);
};

// Rooms
export const getRooms = () => {
  // 방들 불러오기
  return instance.get(`/games/rooms`);
};

export const makeRoom = (data) => {
  // 방 만들기
  return instance.post(`/games/rooms`, data);
};

export const refreshRooms = () => {
  // 5초마다 방들 불러오기
  return instance.get(`/games/rooms/sse`);
};

export const getRoom = (roomId) => {
  // 특정 방 정보 불러오기
  return instance.get(`/games/rooms/${roomId}`);
};

export const editRoom = (roomId, data) => {
  // 특정 방 정보 불러오기
  return instance.patch(`/games/rooms/${roomId}`, data);
};

export const isJoinable = (roomId) => {
  // 방 참가가능한가?
  return instance.get(`/games/rooms/${roomId}/joinable-room`);
};

export const destroyRoom = (roomId) => {
  // 방 삭제
  return instance.delete(`/games/rooms/${roomId}`);
};

export const leaveRoom = (roomId) => {
  // 게임 나가기 (마지막 사람이 나가면 자동 방 삭제)
  return instance.delete(`/games/rooms/${roomId}/users/me`);
};

export const checkPassword = (roomId, data) => {
  // 방 비밀번호 확인
  return instance.post(`/games/rooms/check-password/${roomId}`, data);
};

export const roomInvite = (roomId, memberId, userId) => {
  // 방 초대
  // roomId: 방 id
  // memberId: 초대 보낸 사람 id
  // userId: 초대 받은 사람 id
  return instance.post(
    `/games/rooms/${roomId}/providers/${memberId}/users/${userId}/invite`
  );
};

export const roomAccept = (roomId, memberId, userId, uuid) => {
  // 방 초대 수락
  // roomId: 방 id
  // memberId: 초대 보낸 사람 id
  // userId: 초대 받은 사람 id
  // uuid: notification 아이디
  return instance.post(
    `/games/rooms/${roomId}/providers/${memberId}/users/${userId}/accept/${uuid}`
  );
};

// DM
export const sendDM = ({ message, friendId }) => {
  // DM 보내기
  return instance.post(`/dms/friends/${friendId}`, { message });
};

// 전적
export const getRecord = (nickname, page, perPage) => {
  return instance.get(
    `/games/gamelists/by-nickname/${nickname}?page=${page}&item=${perPage}`
  );
};

export const getScore = (userId) => {
  return instance.get(`/games/${userId}`);
};

export const GameRoomEvent = {
  UPDATE: "room:update",
  JOIN: "room:join",
  MESSAGE: "room:message",
  MEMBER_LIST: "room:memberlist",
  LEAVE: "room:leave",
  START: "room:start",
  READY: "room:ready",
  UNREADY: "room:unready",
  SPEAK: "room:speak",
};

export const GameEvent = {
  JOIN: "game:join",
  LEAVE: "game:leave",
  START: "game:start",
  JOB: "game:job",
  PUNISH: "game:punish",
  FINISHP: "game:finishPunishment",
  VOTE: "game:vote",
  FINISHV: "game:finishVote",
  DAY: "game:day",
  POLICE: "game:police",
  DOCTOR: "game:doctor",
  MAFIA: "game:mafia",
  MAFIASEARCH: "game:mafiaSearch",
  TIMER: "game:timer",
  DEATH: "game:death",
  WINNER: "game:winner",
  USEJOBS: "game:useJobs",
  SPEAK: "game:speak",
  CURRENT_VOTE: "game:currentVote",
  GAME_END: "game:end",
  LANDMARK: "game:landmark",
  SKILL: "game:skill",
};

export const UserEvent = {
  FRIEND_REQUEST: "user:request-friend",
  FRIEND_ACCEPT: "user:accept-friend",
  FRIEND_DELETE: "user:delete-friend",
  DM: "user:dm",
  ONLINE: "user:online",
  OFFLINE: "user:offline",
  INVITE: "user:invite",
};

// Default
// axios.default.paramsSerializer = params => {
//   return qs.stringify(params);
// }
// const params = {
//   search:{
//     category : 'category',
//     page : 'page',
//   }
// }
