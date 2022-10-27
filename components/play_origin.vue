<template>
  <div :class="`${flag ? 'gamebox-first' : 'gamebox-second'}`">
      <WinModal ref="win" @escapeGame="escapeGame" @gameFinish="gameFinish" />
    <button class="exitbtn"></button>
    <div class="dayTimeBox">
      <DayCount ref="dayCount" class="chatbox"></DayCount>
      <Timer
        v-on:nightResult="nightResult"
        v-on:startVote="startVote"
        v-on:finishVote="finishVote"
        v-on:finishPunishmentVote="finishPunishmentVote"
        ref="timer"
        class="timerbox"
      ></Timer>
      <div class="exitBtn">
        <exitGame @escapeGame="escapeGame"></exitGame>
      </div>
    </div>
    <Audio ref="audio" />
    <!-- 능력 결과 데이터는 전부 billboard로 보내야 한다! -->
    <!-- userVideo에도 유저 데이터를 보내고, 화면이 꺼지게 해야 함. -->
    <div class="atssds">
      <Billboard
        ref="billboard"
        v-on:punishmentVote="punishmentVote"
        v-on:nightEvent="nightEvent"
        v-on:victorySearch="victorySearch"
      />
      <sideBar ref="sideBarSet"></sideBar>
    </div>
    <div class="px-2 mt-10">
      <UserVideo
        ref="userVideo"
        v-on:startVoteMotion="startVote"
        v-on:punishmentVoteMotion="punishmentVote"
        v-on:skillMotion="nightEvent"
        @voteNumEmit="voteNumCheck"
        @punishmentEmit="punishmentVoteCheck"
        @skillNumEmit="skillNumCheck"
        v-bind:flag="flag"
        v-bind:anotherMafia="anotherMafia"
      />
    </div>
  </div>
</template>

<script>
import exitGame from "@/components/gameFlow_elements/exitGame.vue";
import Timer from "@/components/gameFlow_elements/timer.vue";
import Billboard from "@/components/gameFlow_elements/billboard.vue";
import SideBar from "@/components/gameFlow_elements/sideBar.vue";
import UserVideo from "@/components/gameFlow_elements/userVideo.vue";
import dayjs from "dayjs";
import { GameEvent } from "@/api/mafiaAPI";
import DayCount from "@/components/gameFlow_elements/dayCountView.vue";
import Audio from "@/components/gameFlow_elements/audio.vue";
import WinModal from "@/components/gameFlow_elements/winModal.vue";
export default {
  name: "App",
  components: {
    Timer,
    Billboard,
    SideBar,
    DayCount,
    UserVideo,
    Audio,
    dayjs,
    WinModal,
    exitGame,
  },
  computed: {
    myInfo() {
      return this.$store.getters["user/getMyInfo"];
    },
    roomMembers() {
      return this.$store.state.stream.roomMembers;
    },
    surviveMembers() {
      return this.$store.state.stream.surviveMembers;
    },
  },
  data() {
    return {
      electedPlayer: 0, // 마피아로 의심되는 유저 투표
      punishmentPlayer: false, // 찬반 투표, 디폴트는 반대
      selectedUser: false, // 자신의 선택 확정, 디폴트는 미승인 (true가 되야 선택값 넘어감)
      mafiaSelected: 0, // 마피아일 경우 유저 지목
      doctorSelected: 0, // 의사일 경우 유저 지목
      policeSelected: 0, // 경찰일 경우 유저 지목
      flag: false,
      day: false,
      morningAudio: null,
      nightAudio: null,
      startTime: null,
      endTime: null,
      myJob: null,
      anotherMafia: null,
      gameFinishData: false,
      // flag는 하위 컴포넌트에서 상속되게 해야한다.
      // 플레이엉 넘을 이용 n 번째 플레이어를 날린다.
    };
  },
  //새로고침 방지 위해서 추가 뒤로가기 하면 로비에서도 적용됨.
  mounted() {
    this.$store.commit("stream/loadBackupMembers");
    // let newRemoteFeed = null;
    this.gameSocketSet();
    // 여기서부터는 백엔드의 emit을 받아 처리
    // 게임 시작과 동시에, 유저 정보를 받아오고, 게임 시작 메서드 실행
    this.$root.gameSocket.on(GameEvent.JOIN, (data) => {
      console.log("JOIN" + data);
      // setTimeout(() => {
      this.gameStart();
      // }, 5000);
    });
    // 인게임에서 활용하기 위한 데이터를 가져오고, 직업 배분을 시작함
    this.$root.gameSocket.on(GameEvent.START, (data) => {
      for (let item of data) {
        this.$store.commit("stream/setRoomMembersDie", item);
      }
      this.grantPlayerJob();
    });
    // 유저의 직업을 배분하고, 배분된 직업에 따라 다른 이벤트 부여
    // 달라지는 것 - 빌보드 메세지, 사이드바 UI 내용
    this.$root.gameSocket.on(GameEvent.JOB, (data) => {
      console.log("JOB" + data);
      for (let item of data) {
        console.log(`${item}job` + item.job);
        this.$store.commit("stream/setRoomMembersJob", item);
        if (item.job === "MAFIA") {
          this.$refs.sideBarSet.myJobMafia();
          this.$refs.billboard.grantMafia();
          // this.$root.gameSocket.emit(GameEvent.MAFIASEARCH);
          this.myJob = item.job;
        } else if (item.job === "POLICE") {
          this.$refs.sideBarSet.myJobPolice();
          this.$refs.billboard.grantPolice();
          this.myJob = item.job;
        } else if (item.job === "DOCTOR") {
          this.$refs.sideBarSet.myJobDoctor();
          this.$refs.billboard.grantDoctor();
          this.myJob = item.job;
        } else if (item.job == "CITIZEN") {
          this.$refs.sideBarSet.myJobCitizen();
          this.$refs.billboard.grantCitizen();
          this.myJob = item.job;
        }
      }
      this.$store.commit("stream/surviveMemberCheck");
      // setTimeout(() => {
      this.victorySearch();
      // }, 5000);
    });
    // 낮밤 변경

    this.$root.gameSocket.on(GameEvent.WINNER, (data) => {
      console.log("WINNER" + data);
      // this.$root.gameSocket.emit(GameEvent.GAMEEND, {
      //   winner: data.winner
      // });
      if (data.winner === "MAFIA") {
        this.mafiaWin();
      } else if (data.winner === "CITIZEN") {
        this.citizenWin();
      }
    });

    this.$root.gameSocket.on(GameEvent.DAY, (data) => {
      console.log("170Code DAY" + data.day);
      this.flag = data.day;
      if (data.day === true) {
        this.morningEvent();
      } else {
        this.nightEvent();
      }
    });

    this.$root.gameSocket.on(GameEvent.VOTE, (data) => {
      console.log("VOTE" + data);
    });
    // this.$root.gameSocket.on(GameEvent.MAFIASEARCH, (data) => {
    //   // 모든 마피아 유저의 정보를 받아온다.
    //   console.log(data)
    //   // this.$store.commit('stream/mafiaInfoSave', data);
    //   // 이것을 stream.js에 담고 실행한다.
    // })

    // 의사와 마피아는 단순히 받아오기만 함
    // 실제 결과 처리는 프론트로 넘어오는 유저의 정보로 판별하기 때문.
    this.$root.gameSocket.on(GameEvent.DOCTOR, (data) => {
      console.log('DOCTOR' + data);
    })
    this.$root.gameSocket.on(GameEvent.MAFIA, (data) => {
      console.log('MAFIA' + data);
    })

    this.$root.gameSocket.on(GameEvent.SPEAK, (data) => {
      // console.log("SPEAK" + data);
      this.$store.commit("stream/setSpeaker", data);
    });

  },
  created() {},
  methods: {
    // 게임에 입장하는 즉시 실행되며, 유저의 소켓 정보 받아옴
    gameSocketSet() {
      this.$root.gameSocket.emit(GameEvent.JOIN, {
        roomId: this.$route.params.roomInfo.id,
      });
      this.$refs.billboard.gameStartBoard();
    },
    // 게임 스타트, 게임 스타트 관련 데이터
    gameStart() {
      this.$root.gameSocket.emit(GameEvent.START);
      this.$refs.billboard.grantPlayerJobBeforeBoard();
    },
    // 직업 배분 결과 통지
    grantPlayerJob() {
      this.$root.gameSocket.emit(GameEvent.JOB);
    },
    // 아침 이벤트 발생,
    morningEvent() {
      console.log(this.$store.state.stream.roomMembers);
      this.$refs.billboard.morningEventBoard();
      console.log("아침 시작");
      this.$refs.audio.morningBgmEvent();
      // 이곳에서 받아오는 시간은 서버 시간
      console.log(this.flag);
      this.$refs.timer.morningTimer();
      // dayCount에서는 빌보드 상단에 표기되는 day의 숫자를 +1
      this.$refs.dayCount.nextDay();
      // 타이머에서 다음 메서드를 실행하게 한다!
    },
    // 투표 시작
    startVote() {
      // this.citizenModal = true
      this.$refs.billboard.startVoteBoard();
      this.$refs.timer.voteTimer();
      this.$refs.userVideo.startVoteMotion();
      //여기서 유저 지목 값 받아올 수 있어야 함.
    },
    // 투표값 전송을 위한 메서드로, 집계는 startVote에서 한다.
    // 자신의 투표값을 저장한다.
    // userVideo.vue에서 얻어낸 유저 지목 값을 백엔드로 전송
    voteNumCheck(voteNum) {
      // this.electedPlayer = voteNum;
      console.log("voteNum " + voteNum);
      this.$root.gameSocket.emit(GameEvent.VOTE, {
        vote: voteNum,
      });
    },
    // 타이머 끝나면 이게 실행되고, 집계된 결과값을 가져온다.
    finishVote() {
      this.$root.gameSocket.emit(GameEvent.FINISHV);
    },
    // 사형시킬 유저가 특정되면 심판 투표를 진행
    punishmentVote() {
      this.$refs.billboard.startPunishmentVoteBoard();
      this.$refs.timer.punishmentTimer();
      this.$refs.userVideo.punishmentVoteMotion();
    },
    // userVideo.vue에서 얻어낸 심판투표 찬반여부를 백엔드로 전송
    // true가 엄지손가락을 내린 형태로 사형 찬성이고
    // false가 엄지손가락을 올린 형태로 사형 반대이다.
    punishmentVoteCheck(punishmentNum) {
      // punishmentNum 은 boolean
      console.log(punishmentNum + "자신의 심판투표 결과값");
      this.$root.gameSocket.emit(GameEvent.PUNISH, {
        punish: punishmentNum,
      });
    },
    // 심판 투표 결과값을 가져온다.
    finishPunishmentVote() {
      this.$root.gameSocket.emit(GameEvent.FINISHP);
      console.log("찬반 가져옴");
    },
    nightEvent() {
      console.log("게임 밤 이벤트 시작");
      this.$refs.audio.nightBgmEvent();
      this.$refs.billboard.nightEventBoard();
      this.$refs.timer.nightEvent();
      if (this.myJob === "MAFIA") {
        this.$refs.userVideo.skillMotion();
        //  this.$root.gameSocket.emit(GameEvent.MAFIASEARCH)
      } else if (this.myJob === "DOCTOR") {
        // select를 추가해야 할듯
        this.$refs.userVideo.skillMotion();
      } else if (this.myJob === "POLICE") {
        // select를 추가해야 할듯
        this.$refs.userVideo.skillMotion();
      } else {
        console.log("시민은 없다");
      }
    },
    skillNumCheck(voteNum) {
      if (this.myJob === "MAFIA") {
        this.$root.gameSocket.emit(GameEvent.MAFIA, {
          userNum: voteNum,
        });
      } else if (this.myJob === "DOCTOR") {
        this.$root.gameSocket.emit(GameEvent.DOCTOR, {
          userNum: voteNum,
        });
      } else if (this.myJob === "POLICE") {
        this.$root.gameSocket.emit(GameEvent.POLICE, {
          userNum: voteNum,
        });
      } // 이거
    },
    nightResult() {
      this.$refs.billboard.nightResultBoard();
      this.$root.gameSocket.emit(GameEvent.USEJOBS);
      // ! 죽은 유저의 정보를 출력한다.
      console.log("밤 결과");
    },

    victorySearch() {
      this.$store.commit("stream/surviveMemberCheck");
      console.log(this.$store.state.stream.roomMembers.die);
      console.log(this.flag);
      this.$root.gameSocket.emit(GameEvent.DAY, {
        day: this.flag,
      });
      console.log(this.flag);
    },
    mafiaWin() {
      this.$refs.win.mafiaWin();
      // this.$root.gameSocket.emit(GameEvent.GAMEEND);
    },
    citizenWin() {
      this.$refs.win.citizenWin();
      // this.$root.gameSocket.emit(GameEvent.GAMEEND);
    },
    escapeGame() {
      if (!this.gameFinishData) {
        console.log(this.gameFinishData)
        this.$root.gameSocket.emit(GameEvent.LEAVE);
        console.log('나 가요')
      }
      this.$router.push('/lobby');
    },
    gameFinish() {
      // this.$emit("gameFinish");
      this.gameFinishData = true;
      this.escapeGame();

    }
  },
};
</script>

<style lang="scss" scoped="scoped">
@import "~assets/game.scss";

.atssds {
  display: flex;
  justify-content: space-between;
}

.exitBtn {
  margin-left: 75px;
  margin-right: 75px;
  width: 150px;
  height: 50px;
}
</style>
