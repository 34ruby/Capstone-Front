<template lang="">
  <div
    class="flex flex-col items-center h-screen w-full"
    :class="`${currentStatus === 'NIGHT' ? 'bg-night-time' : 'bg-day-time'}`"
  >
    <div class="flex flex-col w-2/3 py-3 px-3 h-1/2">
      <GameHeader ref="game_header" @leave="leave"></GameHeader>
      <Board ref="board"></Board>
    </div>
    <PlayerVideo ref="player_video"></PlayerVideo>
    <Audio ref="audio"></Audio>
  </div>
</template>
<script>
import GameHeader from "@/components/game_elements/GameHeader.vue";
import Board from "@/components/game_elements/Board.vue";
import PlayerVideo from "@/components/game_elements/PlayerVideo.vue";
import Audio from "@/components/gameFlow_elements/audio.vue";
import { GameEvent } from "@/api/mafiaAPI";
export default {
  components: {
    GameHeader,
    Board,
    PlayerVideo,
    Audio,
  },
  computed: {
    myInfo() {
      return this.$store.getters["user/getMyInfo"];
    },
    myVideoNum() {
      return (
        this.$store.state.stream.roomMembers.findIndex(
          (e) => e.id == this.myInfo.id
        ) + 1
      );
    },
  },

  data() {
    return {
      currentStatus: "NIGHT",
      currentDate: 0,
      isGameEnd: false,
      alertContexts: {
        NIGHT: {
          title: "밤이 되었습니다",
          content: "마피아, 의사, 경찰은 자신의 능력을 사용합니다.",
          backdrop: "rgba(0,0,0,0.5)",
          background: "rgba(16,19,66)",
          color: "#ffffff",
          imageUrl: require("~/assets/ingame/moon.svg"),
        },
        MEETING: {
          title: "아침이 되었습니다",
          content: "자유롭게 대화하며 서로에 대해 알아가는 시간입니다.",
          backdrop: "rgba(255,255,255,0.5)",
          color: "#000000",
          imageUrl: require("~/assets/ingame/sun.svg"),
        },
        PUNISHMENT: {
          title: "유저가 지목되었습니다",
          content: "해당 유저에 대한 찬반투표를 시작합니다",
          color: "#000000",
          imageUrl: require("~/assets/ingame/punishment.svg"),
        },
        VOTE: {
          title: "투표를 시작합니다",
          content: "마피아로 의심되는 유저를 지목합니다",
          color: "#000000",
          imageUrl: require("~/assets/ingame/vote.svg"),
        },
      },
    };
  },
  methods: {
    init() {
      this.$root.gameSocket.on(GameEvent.SPEAK, (data) => {
        this.$store.commit("stream/setSpeaker", data);
      });

      this.$root.gameSocket.on(GameEvent.TIMER, (data) => {
        console.log("TIMER", data);
        this.$refs.game_header.leftTime = data.timer;

        if (this.currentStatus !== data.status) {
          if (this.currentDate !== data.day) {
            this.currentDate = data.day;
            this.$refs.board.date = data.day;
          }
          this.currentStatus = data.status;
          this.$refs.board.status = data.status;
          this.$refs.player_video.status = data.status;

          this.$refs.game_header.turnTime = data.totalTime;
          this.$refs.player_video.isCognizing = data.status !== "MEETING";
          this.$refs.player_video.isCheck = false;
          this.$refs.player_video.resetInterval();

          if (data.status === "MEETING") {
            this.$refs.audio.morningBgmEvent();
          } else if (data.status === "NIGHT") {
            this.$refs.audio.nightBgmEvent();
          }

          this.$swal({
            imageUrl: this.alertContexts[data.status].imageUrl,
            imageWidth: 150,
            imageHeight: 150,
            imageAlt: "Custom image",
            title: this.alertContexts[data.status].title,
            html: this.alertContexts[data.status].content,
            timer: 1500,
            showConfirmButton: false,
            backdrop:
              this.alertContexts[data.status].backdrop || "rgba(0,0,0,0)",
            background:
              this.alertContexts[data.status].background || "rgba(255,255,255)",
            color: this.alertContexts[data.status].color,
          });
        }
      });

      this.$root.gameSocket.on(GameEvent.JOIN, (data) => {
        // if (data.join) {
        console.log("JOIN", data);
        this.gameStart();
        // }
      });

      this.$root.gameSocket.on(GameEvent.START, (data) => {
        console.log("START", data);

        // 이곳에 플레이어 직업 배정 로직이 들어가야함
        this.$store.commit("stream/setRoomMembers", data.players);
        // find me from data.players
        const me = data.players.find(
          (player) => player.id === this.myInfo.profile.id
        );

        this.$refs.board.addLog({
          color: "text-yellow-500",
          message: `게임이 시작되었습니다. 당신의 직업은 ${me.job}입니다`,
        });
        this.$refs.board.grantJob(me.job);
      });

      this.$root.gameSocket.on(GameEvent.LEAVE, (data) => {
        console.log("LEAVE" + data);
        this.$refs.board.addLog({
          color: "text-yellow-500",
          message: data.message,
        });
        this.$store.commit("stream/killMember", data.playerVideoNum);
      });

      this.$root.gameSocket.on(GameEvent.GAME_END, (data) => {
        console.log("GAME_END", data);
        this.isGameEnd = true;
        this.$refs.board.addLog({
          color: "text-blue-500",
          message: `게임이 종료되었습니다. ${data.win}팀이 승리하였습니다`,
        });
        this.$refs.player_video.handClose();
        this.$swal({
          title: `${data.message}`,
          html: "잠시 후 게임을 종료하고 로비로 돌아갑니다.",
          timer: 5000,
          timerProgressBar: true,
          showConfirmButton: false,
          allowOutsideClick: false,
          backdrop: `
            ${
              data.win === "CITIZEN"
                ? "rgba(130,202,250,0.4)"
                : "rgba(219,0,0,0.4)"
            }
          `,
        }).then((result) => {
          if (result.dismiss === this.$swal.DismissReason.timer) {
            this.$router.push("/lobby");
          }
        });
      });

      this.$root.gameSocket.on(GameEvent.VOTE, (data) => {
        console.log("VOTE", data);
        this.$refs.board.addLog({
          message: `Day ${this.currentDate} 투표 결과: ${data.message}`,
        });
        if (data.playerVideoNum) {
          this.$refs.board.setPunishVidNum(data.playerVideoNum);
        }
        this.$swal({
          title: "투표 결과",
          text: data.message,
          icon: "info",
          timer: 2000,
          showConfirmButton: false,
        });
      });

      this.$root.gameSocket.on(GameEvent.PUNISH, (data) => {
        console.log("PUNISH", data);
        if (data.result) {
          this.$refs.audio.punishmentEvent();
          if (data.playerVideoNum === this.myVideoNum) {
            this.$refs.player_video.amIDead = true;
          }
          this.$refs.board.addLog({
            color: "text-red-500",
            message: `Day ${this.currentDate} 처형 결과: ${data.message}`,
          });
          this.$store.commit("stream/killMember", data.playerVideoNum);
        } else {
          this.$refs.board.addLog({
            message: `Day ${this.currentDate} 처형 결과: ${data.message}`,
          });
        }
        this.$swal({
          title: "처형 결과",
          text: data.message,
          icon: "info",
          timer: 2000,
          showConfirmButton: false,
        });
      });

      this.$root.gameSocket.on(GameEvent.SKILL, (data) => {
        console.log("SKILL", data);
        if (data.die) {
          this.$refs.board.addLog({
            color: "text-red-500",
            message: `Day ${this.currentDate}: ${data.message}`,
          });
          if (data.playerVideoNum === this.myVideoNum) {
            this.$refs.player_video.amIDead = true;
          }
          this.$store.commit("stream/killMember", data.playerVideoNum);

          this.$swal({
            title: "사망자 발생",
            text: data.message,
            imageUrl: require("~/assets/ingame/murder.svg"),
            imageWidth: 150,
            imageHeight: 150,
            imageAlt: "Custom image",
            timer: 2000,
            showConfirmButton: false,
          });
        } else if (data.message.startsWith("의사가")) {
          this.$refs.board.addLog({
            color: "text-blue-500",
            message: `Day ${this.currentDate}: ${data.message}`,
          });
          this.$swal({
            title: "사망자 없음",
            text: data.message,
            imageUrl: require("~/assets/ingame/save.svg"),
            imageWidth: 150,
            imageHeight: 150,
            imageAlt: "Custom image",
            timer: 2000,
            showConfirmButton: false,
          });
        } else {
          this.$refs.board.addLog({
            message: `Day ${this.currentDate}: ${data.message}`,
          });
          this.$swal({
            title: "사망자 없음",
            text: data.message,
            imageUrl: require("~/assets/ingame/dove3.svg"),
            imageWidth: 150,
            imageHeight: 150,
            imageAlt: "Custom image",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      });

      this.$root.gameSocket.on(GameEvent.POLICE, (data) => {
        this.$refs.board.addLog({
          color: "text-green-500",
          message: `Day ${this.currentDate} 경찰 능력 사용 결과: ${data.message}`,
        });
        this.$swal({
          imageUrl: require(`~/assets/sidebar/${data.player.job.toLowerCase()}.svg`),
          imageWidth: 150,
          imageHeight: 150,
          imageAlt: "Custom image",
          title: data.player.nickname + "을(를) 수사했습니다.",
          html: data.message,
          timer: 2000,
          showConfirmButton: false,
        });
      });
      this.$root.gameSocket.emit(GameEvent.JOIN, {
        roomId: this.$route.params.roomInfo.id,
      });
    },
    gameStart() {
      this.$root.gameSocket.emit(GameEvent.START);
    },
    leave() {
      if (!this.isGameEnd) {
        this.$root.gameSocket.emit(GameEvent.LEAVE);
      }
    },
  },
  mounted() {
    this.init();
  },
};
</script>
<style lang=""></style>
