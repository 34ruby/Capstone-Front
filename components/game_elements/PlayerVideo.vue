<template lang="">
  <div class="px-3 py-3 w-full h-1/2">
    <div class="grid grid-cols-5 gap-4 justify-evenly">
      <div
        class="justify-self-center mx-2 mb-3 w-full rounded border-[3px] relative"
        v-for="(s, index) in roomMembers"
        :class="`${
          s.die
            ? 'border-red-500'
            : s.speaking
            ? 'border-green-500'
            : 'border-white'
        }`"
        :key="s.id"
        @click.prevent.stop="handleClick($event, s)"
      >
        <div class="aspect-video">
          <div v-if="s.stream">
            <video
              v-if="
                status !== 'NIGHT' &&
                s.nickname !== myInfo.profile.nickname &&
                !s.die
              "
              :ref="'remote' + s.id"
              :id="'remote' + s.id"
              :src-object.prop.camel="s.stream"
              autoplay
            ></video>
            <video
              v-else
              :ref="'remote' + s.id"
              :id="'remote' + s.id"
              :src-object.prop.camel="s.stream"
              autoplay
              muted
            ></video>
          </div>
          <canvas
            v-if="
              (status === 'NIGHT' && s.nickname !== myInfo.profile.nickname) ||
              s.die === true
            "
            :class="`${'output_canvas' + s.id}`"
            class="absolute top-0 left-0 aspect-video w-full bg-black"
            width="640"
            height="360"
            :id="['output_canvas' + index]"
          >
          </canvas>
          <canvas
            v-else
            :class="`${'output_canvas' + s.id}`"
            class="absolute top-0 left-0 aspect-video w-full"
            width="640"
            height="360"
            :id="['output_canvas' + index]"
          >
          </canvas>
        </div>
        <div class="grid grid-cols-4 font-semibold">
          <div
            v-if="s.die"
            class="col-span-1 text-center bg-red-500 text-white"
          >
            {{ `No.${index + 1}` }}
          </div>
          <div v-else class="col-span-1 text-center bg-green-500 text-white">
            {{ `No.${index + 1}` }}
          </div>
          <div
            class="col-span-3 bg-white px-1 whitespace-nowrap overflow-ellipsis"
          >
            <span>{{ `${s.nickname}` }}</span>
          </div>
        </div>
      </div>
    </div>

    <Memo ref="memo" :status="status"></Memo>
    <vue-simple-context-menu
      :elementId="'myUniqueId'"
      :options="options"
      :ref="'vueSimpleContextMenu'"
      @option-clicked="optionClicked"
    />
  </div>
</template>
<script>
import Memo from "@/components/gameFlow_elements/memo.vue";
import { GameRoomEvent, GameEvent } from "@/api/mafiaAPI";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";

import {
  fingersCount as vote,
  check,
  punishment,
} from "@/common/detection/hand";

export default {
  components: {
    Memo,
  },
  computed: {
    myInfo() {
      return this.$store.getters["user/getMyInfo"];
    },
    roomMembers() {
      return this.$store.state.stream.roomMembers ?? [];
    },
    myJob() {
      const me = this.$store.state.stream.roomMembers.find((member) => {
        return member.id === this.myInfo.profile.id;
      });
      return me?.job;
    },
  },
  data() {
    return {
      options: [
        {
          name: "Mafia",
        },
        {
          name: "Police",
        },
        {
          name: "Doctor",
        },
        {
          name: "Citizen",
        },
        {
          name: "",
          type: "divider",
        },
        {
          name: "Remove Filter",
        },
      ],
      myVideo: null,
      myCanvas: null,
      myCanvasCtx: null,
      status: "",
      isCheck: false,
      isCognizing: false,
      voteResult: null,
      checkResult: null,
      punishmentResult: null,
      countDown: 0,
      interval: null,
      hands: null,
      amIDead: false,
    };
  },
  methods: {
    handleClick(event, item) {
      this.$refs.vueSimpleContextMenu.showMenu(event, item);
    },
    optionClicked(event) {
      this.$refs.memo.optionClicked(event);
    },
    async handCognition(videoElement, canvasElement, canvasCtx) {
      // videoElement.style.display = "none";
      let onResults = (results) => {
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        // 기준점을 지정한 크기(x,y)만큼 평행이동함
        canvasCtx.translate(canvasElement.width, 0);

        canvasCtx.restore();

        if (this.isCognizing) {
          const isAvailable = this.isAvailableVote(this.voteResult);
          switch (this.status) {
            case "VOTE":
              if (!this.isCheck) {
                this.voteResult = vote(
                  results,
                  canvasElement,
                  canvasCtx,
                  true,
                  isAvailable
                );
              } else {
                this.checkResult = check(
                  results,
                  canvasElement,
                  canvasCtx,
                  true
                );
              }
              break;
            case "PUNISHMENT":
              this.punishmentResult = punishment(
                results,
                canvasElement,
                canvasCtx,
                true
              );
              break;
            case "NIGHT":
              if (["MAFIA", "DOCTOR", "POLICE"].includes(this.myJob)) {
                if (!this.isCheck) {
                  this.voteResult = vote(
                    results,
                    canvasElement,
                    canvasCtx,
                    true,
                    isAvailable
                  );
                } else {
                  this.checkResult = check(
                    results,
                    canvasElement,
                    canvasCtx,
                    true
                  );
                }
              }
              break;
            default:
              this.checkResult = null;
              this.voteResult = null;
              this.isCognizing = false;
              break;
          }
        } else {
          this.checkResult = null;
          this.voteResult = null;
        }
      };

      // const getMedia = async () => {
      //   try {
      //     await media();
      //   } catch (e) {
      //     console.log(e);
      //   }
      // };
      const media = async () => {
        try {
          for (const member of this.roomMembers) {
            if (member.id === this.myInfo.profile.id) {
              if (member.die) {
                console.log("죽었으니 손 인식 안함");
                // this.handClose();
                return;
              }
              if (this.status !== "MEETING" && this.status !== "") {
                await this.hands.send({ image: videoElement });
              }
              requestAnimationFrame(media);
            }
          }
        } catch (e) {
          console.log(e);
        }
      };

      this.hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });
      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      this.hands.onResults(onResults);
      await this.hands.send({ image: videoElement });
      media();
    },
    changeVoteResult() {
      this.countDown = 0;
      clearInterval(this.interval);
      this.interval = setInterval(() => {
        const isAvailable = this.isAvailableVote(this.voteResult);
        if (this.countDown < 2 && isAvailable === 1) {
          this.countDown += 1;
        } else if (this.countDown === 2) {
          clearInterval(this.interval);
          this.$swal({
            icon: "success",
            title: this.voteResult + "번에게 투표",
            html: "OX 표시를 하여 투표를 확정하거나 취소할 수 있습니다.",
            timer: 2000,
            showConfirmButton: false,
          }).then((result) => {
            /* Read more about handling dismissals below */
            if (result.dismiss === this.$swal.DismissReason.timer) {
              console.log("vote 결과 출력");
            }
          });
          this.isCheck = true;
          this.interval = null;
        }
      }, 1000);
    },
    changeCheckResult() {
      this.countDown = 0;
      clearInterval(this.interval);
      this.interval = setInterval(() => {
        if (this.countDown < 2 && this.checkResult !== null) {
          this.countDown += 1;
        } else if (this.countDown === 2) {
          clearInterval(this.interval);
          // 스킬 사용이 아니며(밤이 아니며), O에 체크했을 경우
          if (this.status !== "NIGHT" && this.checkResult) {
            this.$root.gameSocket.emit(GameEvent.VOTE, {
              playerVideoNum: this.voteResult,
            });
            this.$swal({
              icon: "success",
              title: "유저 지목 완료",
              html:
                this.$store.state.stream.roomMembers[this.voteResult - 1]
                  .nickname + "을(를) 마피아로 의심합니다.",
              timer: 2000,
              showConfirmButton: false,
            }).then((result) => {
              /* Read more about handling dismissals below */
              if (result.dismiss === this.$swal.DismissReason.timer) {
                console.log("check 결과 출력");
              }
            });

            this.checkResult = null;
            this.voteResult = null;
            this.isCognizing = false;
          } else if (this.status === "NIGHT" && this.checkResult) {
            switch (this.myJob) {
              case "MAFIA":
                this.$root.gameSocket.emit(GameEvent.MAFIA, {
                  playerVideoNum: this.voteResult,
                });
                this.$swal({
                  icon: "success",
                  title: "유저 지목 완료",
                  html:
                    this.$store.state.stream.roomMembers[this.voteResult - 1]
                      .nickname + "을(를) 살해합니다.",
                  timer: 2000,
                  showConfirmButton: false,
                }).then((result) => {
                  /* Read more about handling dismissals below */
                  if (result.dismiss === this.$swal.DismissReason.timer) {
                    console.log("check 결과 출력");
                  }
                });
                break;
              case "POLICE":
                this.$root.gameSocket.emit(GameEvent.POLICE, {
                  playerVideoNum: this.voteResult,
                });
                break;
              case "DOCTOR":
                this.$root.gameSocket.emit(GameEvent.DOCTOR, {
                  playerVideoNum: this.voteResult,
                });
                this.$swal({
                  icon: "success",
                  title: "유저 지목 완료",
                  html:
                    this.$store.state.stream.roomMembers[this.voteResult - 1]
                      .nickname + "을(를) 치료합니다.",
                  timer: 2000,
                  showConfirmButton: false,
                }).then((result) => {
                  /* Read more about handling dismissals below */
                  if (result.dismiss === this.$swal.DismissReason.timer) {
                    console.log("check 결과 출력");
                  }
                });
                break;
            }

            this.checkResult = null;
            this.voteResult = null;
            this.isCognizing = false;
          } else if (this.status !== "NIGHT" && !this.checkResult) {
            this.$swal({
              icon: "error",
              title: "유저 지목 취소",
              html: "투표를 다시 진행합니다.",
              timer: 2000,
              showConfirmButton: false,
            }).then((result) => {
              /* Read more about handling dismissals below */
              if (result.dismiss === this.$swal.DismissReason.timer) {
                console.log("check 결과 출력");
              }
            });
          } else if (this.status === "NIGHT" && !this.checkResult) {
            this.$swal({
              icon: "error",
              title: "유저 지목 취소",
              html: "능력을 다시 사용합니다.",
              timer: 2000,
              showConfirmButton: false,
            }).then((result) => {
              /* Read more about handling dismissals below */
              if (result.dismiss === this.$swal.DismissReason.timer) {
                console.log("check 결과 출력");
              }
            });
          }
          this.isCheck = false;
          this.interval = null;
        }
      }, 1000);
    },
    changePunishmentResult() {
      this.countDown = 0;
      clearInterval(this.interval);
      this.interval = setInterval(() => {
        if (this.countDown < 2 && this.punishmentResult !== null) {
          this.countDown += 1;
        } else if (this.countDown === 2) {
          clearInterval(this.interval);
          this.$root.gameSocket.emit(GameEvent.PUNISH, {
            agree: this.punishmentResult,
          });
          this.$swal({
            icon: "success",
            title: `${this.punishmentResult ? "찬성" : "반대"}`,
            html: `${
              this.punishmentResult ? "사형에 찬성합니다" : "사형에 반대합니다"
            }`,
            timer: 2000,
            showConfirmButton: false,
          }).then((result) => {
            /* Read more about handling dismissals below */
            if (result.dismiss === this.$swal.DismissReason.timer) {
              console.log("punishment 결과 출력");
            }
          });
          this.punishmentResult = null;
          this.isCognizing = false;
          this.interval = null;
        }
      }, 1000);
    },
    resetInterval() {
      clearInterval(this.interval);
      this.interval = null;
    },
    handClose() {
      if (this.amIDead) {
        console.log("나는 죽었따");
        this.hands.close();
      }
    },
    isAvailableVote(voteResult) {
      if (voteResult === null) {
        return -2;
      } else if (voteResult > this.roomMembers.length || voteResult < 1) {
        return 0;
      } else if (this.roomMembers[voteResult - 1].die) {
        return -1;
      } else {
        return 1;
      }
    },
  },
  mounted() {
    this.$root.roomSocket.on(GameRoomEvent.SPEAK, (data) => {
      // console.log(data)
      this.$store.commit("stream/setSpeaker", data);
    });
    this.myVideo = document.getElementById(`remote${this.myInfo.profile.id}`);
    if (this.myVideo) {
      this.myCanvas = document.getElementsByClassName(
        `output_canvas${this.myInfo.profile.id}`
      )[0];
      if (this.myCanvas) {
        this.myCtx = this.myCanvas.getContext("2d");
      }
      this.handCognition(this.myVideo, this.myCanvas, this.myCtx);
    }
  },
  watch: {
    voteResult: function (newVal, oldVal) {
      if (
        newVal !== null &&
        newVal > 0 &&
        newVal <= this.$store.state.stream.roomMembers.length &&
        !this.$store.state.stream.roomMembers[newVal - 1].die &&
        newVal !== oldVal
      ) {
        this.changeVoteResult();
        return;
      }
    },
    checkResult: function (newVal, oldVal) {
      if (newVal !== null && newVal !== oldVal) {
        this.changeCheckResult();
        return;
      }
    },
    punishmentResult: function (newVal, oldVal) {
      if (newVal !== null && newVal !== oldVal) {
        this.changePunishmentResult();
        return;
      }
    },
  },
};
</script>
<style lang=""></style>
