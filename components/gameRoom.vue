<template lang="">
  <div class="flex flex-col min-h-screen w-full">
    <div class="flex-grow relative mb-3" id="roomMain">
      <div
        class="flex px-6 py-2 items-center justify-between align-middle border border-solid border-l-0 border-r-0 bg-amber-400 border-amber-300"
        id="titlebox"
      >
        <div>
          <p class="font-bold">
            [No.{{ roomInfo.id }}] {{ roomInfo.description }}
          </p>
        </div>
        <div>
          <p class="font-bold">2022-FAFIA ONLINE</p>
        </div>
        <div>
          <p class="font-bold">
            {{ roomInfo.mode === "classic" ? "클래식 모드" : "확장 모드" }} |
            {{ roomMembers.length ? roomMembers.length : 0 }}/{{
              roomInfo.publishers
            }}
          </p>
        </div>
      </div>
      <div class="px-2" id="tesgs">
        <div class="grid grid-cols-5 gap-4 justify-evenly py-3 px-3">
          <!-- <div
            v-if="publishStream"
            class="justify-self-center px-2 pb-3 w-full"
          >
            <div class="aspect-video bg-fuchsia-400 border">
              <video
                v-if="publishStream"
                id="myVideo"
                ref="myVideo"
                :src-object.prop.camel="publishStream.stream"
                autoplay
                muted
              ></video>
            </div>
            <p
              :class="
                `${isReady ? 'bg-green-300' : 'bg-white'}` + ' rounded-b-lg'
              "
            >
              {{ myInfo.profile ? myInfo.profile.nickname : "Yuuto" }}
            </p>
          </div> -->
          <div
            id="awasd"
            class="justify-self-center mx-2 mb-3 w-full rounded border-[3px]"
            v-for="(s, index) in roomMembers"
            :class="`${s.speaking ? 'border-green-500' : 'border-white'}`"
            :key="s.userId"
          >
            <div class="aspect-video">
              <div v-if="s.stream">
                <video
                  v-if="s.nickname !== myInfo.profile.nickname"
                  :ref="'remote' + s.userId"
                  :id="'remote' + s.userId"
                  :src-object.prop.camel="s.stream"
                  autoplay
                ></video>
                <video
                  v-else
                  :ref="'remote' + s.userId"
                  :id="'remote' + s.userId"
                  :src-object.prop.camel="s.stream"
                  autoplay
                  muted
                ></video>
              </div>
            </div>
            <div class="grid grid-cols-4 font-semibold">
              <div
                :class="`
                col-span-1 text-center ${
                  s.ready || index === 0
                    ? 'bg-green-500'
                    : 'bg-black text-white'
                }`"
              >
                {{ s.ready || index === 0 ? "Ready" : "Wait" }}
              </div>
              <div
                class="col-span-3 bg-white px-1 whitespace-nowrap overflow-ellipsis"
              >
                <span>{{ `Lv.${s.level} ${s.nickname}` }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="flex flex-row-reverse absolute inset-x-0 bottom-0"
        id="btntest"
      >
        <div class="m-4 w-40 justify-center items-center">
          <div class="leaveBox">
            <button class="buttonCore" @click="leave()">나가기</button>
          </div>
        </div>
        <template v-if="roomMembers">
          <template v-if="roomMembers.length">
            <div
              class="m-4 md:w-40"
              v-if="roomMembers[0].userId !== myInfo.profile.userId"
            >
              <div class="readyBox">
                <button class="buttonCore" @click="getReady()">
                  {{ amIReady ? "준비 해제" : "준비 하기" }}
                </button>
              </div>
            </div>
            <div class="m-4 md:w-40" v-else>
              <div class="startBox">
                <button class="buttonCore" @click="getStart()">
                  게임 시작
                </button>
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>
    <chatBox></chatBox>
  </div>
</template>
<script>
import chatBox from "@/components/lobby_elements/chatBox.vue";
import Janus from "@/plugins/janus";
// import * as hark from "@/plugins/hark";
import hark from "@/plugins/hark.bundle";
import { GameRoomEvent, GameEvent } from "@/api/mafiaAPI";

export default {
  components: {
    chatBox,
  },
  props: {
    roomInfo: Object,
  },
  data() {
    return {
      game: {},
      storePlugin: null,
      janus: null,
      socket: null,
      isReady: false,
      messages: [],
      speechEvents: null,
    };
  },
  computed: {
    mainFeed() {
      return this.$store.state.stream.mainFeed;
    },
    joinedRoom() {
      return this.$store.state.stream.joinedRoom;
    },
    isRoomOut() {
      return this.$store.state.stream.isRoomOut;
    },
    myInfo() {
      return this.$store.getters["user/getMyInfo"];
    },
    roomMembers() {
      return this.$store.state.stream.roomMembers;
    },
    amIReady() {
      const i = this.$store.state.stream.roomMembers.find((s) => {
        return s.userId === this.myInfo.profile.userId;
      });
      if (i) {
        return i.ready;
      }
      return false;
    },
    publishStream() {
      const i = this.$store.state.stream.roomMembers.find((s) => {
        return s.userId === this.myInfo.profile.userId;
      });

      return i;
    },
    // ...mapState([
    //   "subscribedStreams",
    //   "mainFeed",
    //   "publishStream",
    //   "joinedRoom",
    // ]),
  },
  methods: {
    // async exit() {
    //   const res = await leaveGame(this.$route.params.id)
    //   console.log(res);
    //   this.$router.push(`/lobby`)
    // }
    leave() {
      this.$router.push("/lobby");
      // leaveRoom(this.$route.params.id).then((res) => {
      //   if (res.data.success) {
      //   }
      // });
    },
    // checkIsStreamOn(userId) {
    //   let res = this.roomMembers.find((s) => s.userId === userId).stream;
    //   console.log(`isStreamOn${userId}`, res);
    //   return res;
    // },
    exit() {
      var unpublish = { request: "unpublish" };
      var leave = { request: "leave" };
      let vrc = this;
      this.$root.roomSocket.emit(GameRoomEvent.LEAVE);
      this.storePlugin.send({
        message: unpublish,
        success: function () {
          vrc.$store.commit("stream/removeAllSubscribers");
          vrc.$store.commit("stream/destroyRoomMembers");
        },
        error: function (error) {
          console.log("unpublish failed:", error);
        },
      });
      this.storePlugin.send({
        message: leave,
        success: function () {
          vrc.janus.destroy();
        },
        error: function (error) {
          console.log("leave failed:", error);
        },
      });
      if (this.speechEvents) {
        this.speechEvents.stop();
        this.speechEvents = null;
      }
    },
    getReady() {
      this.$root.roomSocket.emit(GameRoomEvent.READY);
    },
    goToGame() {
      this.$router.replace({
        name: "game-id",
        params: {
          id: this.roomInfo.id,
          janus: this.janus,
          storePlugin: this.storePlugin,
          roomInfo: this.roomInfo,
        },
      });
    },
    getStart() {
      this.$root.roomSocket.emit(GameRoomEvent.START);
    },
  },
  mounted() {
    const ServerWS =
      process.env.NODE_ENV === "production"
        ? "wss://gjgjajaj.xyz/janus"
        : "ws://13.125.132.255:8188/janus";
    let janus = null;
    // const opaqueId = "videoroomtest-" + Janus.randomString(12); //opaqueId 값을 통해서 유저 구분
    const opaqueId = "videoroomtest-" + "dong"; //opaqueId 값을 통해서 유저 구분
    let videoHandlerGame = null; //Handle 객체

    let vrc = this;
    let pin = this.$route.params.pin;
    let username = this.myInfo.profile ? this.myInfo.profile.nickname : "Yuuto";
    let roomId = parseInt(this.$route.params.room);
    // let newRemoteFeed = null;

    this.$root.roomSocket.on(GameRoomEvent.JOIN, (data) => {
      console.log(data.member);
      this.$store.commit("stream/setRoomMembers", data.members);
      if (data.member.userId !== this.myInfo.id) {
        this.$toast.show(data.member.nickname + " 님이 입장하셨습니다.");
      }
    });

    this.$root.roomSocket.on(GameRoomEvent.MEMBER_LIST, (data) => {
      console.log(data.members);
      // for (let i = 0; i < data.members.length; i++) {
      //   let member = data.members[i];
      //   if (member.nickname === username) {
      //     this.isReady = member.ready;
      //   } else {
      //     this.$store.commit("stream/readySubscriber", member);
      //   }
      // }
      this.$store.commit("stream/setRoomMembers", data.members);
    });

    this.$root.roomSocket.on(GameRoomEvent.START, (data) => {
      console.log(data);
      this.$store.commit("stream/saveBackupMembers");
      if (data.start) {
        this.goToGame();
      }
    });

    this.$root.roomSocket.on(GameRoomEvent.LEAVE, (data) => {
      if (data.member.userId !== this.myInfo.id) {
        this.$store.commit("stream/removeRoomMember", data.member);
        this.$toast.show(data.member.nickname + " 님이 퇴장하셨습니다.");
      }
    });

    this.$root.roomSocket.on(GameRoomEvent.SPEAK, (data) => {
      // console.log(data)
      this.$store.commit("stream/setSpeaker", data);
    });

    this.$root.roomSocket.emit(GameRoomEvent.JOIN, {
      roomId: this.$route.params.id,
    });

    Janus.init({
      debut: "all",
      callback: function () {
        if (!Janus.isWebrtcSupported()) {
          Janus.log("No WebRTC support...");
          return;
        }
        console.log("초기화 콜백");
        // 세션 생성
        vrc.janus = new Janus({
          server: ServerWS,
          opaqueId: opaqueId,
          success: function () {
            console.log("세션 생성 성공");
            vrc.janus.attach({
              plugin: "janus.plugin.videoroom",
              success: function (pluginHandle) {
                console.log("플러그인 접속 성공");
                vrc.storePlugin = pluginHandle;

                if (pin) {
                  var register = {
                    request: "join",
                    room: roomId,
                    ptype: "publisher",
                    display: username,
                    pin: pin,
                  };
                } else {
                  var register = {
                    request: "join",
                    room: roomId,
                    ptype: "publisher",
                    display: username,
                  };
                }

                vrc.storePlugin.send({
                  message: register,
                });
              },
              error: function (e) {
                Janus.error(" -- Error attaching plugin...", e);
              },
              consentDialog: function (on) {
                Janus.debug(
                  "Consent dialog should be " + (on ? "on" : "off") + " now"
                );

                if (on) {
                  // getUserMedia 호출 전
                } else {
                  // getUserMedia 호출 후
                }
              },
              iceState: function (state) {
                // ICE 상태 변화시
                Janus.log("ICE state changed to " + state);
              },
              mediaState: function (medium, on) {
                // Media 정보를 받기 시작하거나 중지할시
                Janus.log(
                  "Janus " +
                    (on ? "started" : "stopped") +
                    " receiving our " +
                    medium
                );
              },
              webrtcState: function (on) {
                // ICE, DTLS를 포함한 모든 것이 성공하여 PeerConnection이 활성화 => true
                //PeerConnection이 죽는다면 파라미터가 false
                Janus.log(
                  "Janus says our WebRTC PeerConnection is " +
                    (on ? "up" : "down") +
                    " now"
                );
                if (!on) {
                  return;
                }
              },
              onmessage: function (msg, jsep) {
                Janus.debug(" ::: Got a message (publisher) :::", msg);
                Janus.log(" ::: Got a message (publisher) :::", msg);

                var event = msg["videoroom"];

                if (event) {
                  function newRemoteFeed(id, display, audio, video) {
                    let remoteFeed = null;
                    vrc.janus.attach({
                      plugin: "janus.plugin.videoroom",
                      opaqueId: opaqueId,
                      success: function (pluginHandle) {
                        remoteFeed = pluginHandle;
                        Janus.log(
                          "Plugin attached! (" +
                            remoteFeed.getPlugin() +
                            ", id=" +
                            remoteFeed.getId() +
                            ")"
                        );
                        Janus.log(" -- This is a subscriber");

                        let subscribe = null;
                        if (pin) {
                          subscribe = {
                            request: "join",
                            room: roomId,
                            ptype: "subscriber",
                            feed: id,
                            pin: pin,
                            private_id: vrc.joinedRoom.publisherPvtId,
                          };
                        } else {
                          subscribe = {
                            request: "join",
                            room: roomId,
                            ptype: "subscriber",
                            feed: id,
                            private_id: vrc.joinedRoom.publisherPvtId,
                          };
                        }

                        remoteFeed.videoCodec = video;
                        remoteFeed.send({ message: subscribe });
                      },
                      error: function (error) {
                        Janus.error(" -- Error attaching plugin...", error);
                      },
                      onmessage: function (msg, jsep) {
                        Janus.debug(" ::: Got a message (subscriber) :::", msg);
                        Janus.log(" ::: Got a message (subscriber) :::", msg);

                        var event = msg["videoroom"];
                        Janus.debug("Event: " + event);

                        if (msg["error"]) {
                          console.log(msg["error"]);
                        } else if (event) {
                          if (event === "attached") {
                            remoteFeed.rfid = msg["id"];
                            remoteFeed.rfdisplay = msg["display"];
                            // vrc.$store.commit("stream/subscribeFeed", {
                            //   id: msg["id"],
                            //   display: msg["display"],
                            // });

                            Janus.log(
                              "Successfully attached to feed" +
                                remoteFeed.rfid +
                                " (" +
                                remoteFeed.rfdisplay +
                                ") in room " +
                                msg["room"]
                            );
                          } else if (event === "event") {
                            // publisher로부터의 동시 캐스트를 사용할 시 사용 (현재 사용 x)
                          } else {
                            // What just happened?
                          }
                        }
                        if (jsep) {
                          Janus.debug("Handling SDP as well...", jsep);
                          // Answer and attach

                          remoteFeed.createAnswer({
                            jsep: jsep,
                            media: {
                              audioSend: false,
                              videoSend: false,
                            },
                            success: function (jsep) {
                              Janus.debug("Got SDP!", jsep);
                              var body = { request: "start", room: roomId };
                              remoteFeed.send({ message: body, jsep: jsep });
                            },
                            error: function (error) {
                              Janus.error("WebRTC error:", error);
                            },
                          });
                        }
                      },
                      iceState: function (state) {
                        // ICE 상태 변화시
                        Janus.log(
                          "ICE state of this WebRTC PeerConnection (feed #" +
                            remoteFeed.rfindex +
                            ") changed to " +
                            state
                        );
                      },
                      webrtcState: function (on) {
                        // WebRETC PeerConnection 연결시 혹은 중단시
                        Janus.log(
                          "Janus says this WebRTC PeerConnection (feed #" +
                            remoteFeed.rfindex +
                            ") is " +
                            (on ? "up" : "down") +
                            " now"
                        );
                      },
                      onlocalstream: function (stream) {
                        // subscriber는 오직 수신만
                      },
                      onremotestream: function (stream) {
                        Janus.debug(
                          "Remote feed #" + remoteFeed.rfid + ", stream:",
                          stream
                        );
                        console.log("if 전 active:", stream.active);
                        if (stream.active) {
                          console.log("if 후 active:", stream.active);
                          console.log("리모트 스트림 입니다:", stream);
                          vrc.$store.commit("stream/addSubscribeStream", {
                            rfid: remoteFeed.rfid,
                            nickname: remoteFeed.rfdisplay,
                            stream: stream,
                            ready: false,
                          });
                          // var elId = "remote" + vrc.myInfo.profile.userId;
                          // document.getElementById(elId).pause();
                          // document.getElementById(elId).load();
                          // document.getElementById(elId).play();
                        } else {
                          vrc.$store.commit(
                            "stream/removeSubscriber",
                            remoteFeed.rfid
                          );
                        }
                      },
                      oncleanup: function () {
                        // 퇴장시 Subscriber Feed에서 제거
                        console.log("clean user rfid: ", remoteFeed.rfid);
                        vrc.$store.commit(
                          "stream/removeSubscriber",
                          remoteFeed.rfid
                        );
                      },
                    });
                  }
                  if (event === "joined") {
                    vrc.$store.commit("stream/joinRoom", {
                      room: msg["room"],
                      publisherId: msg["id"],
                      nickname: username,
                      publisherPvtId: msg["private_id"],
                    });

                    Janus.log(
                      `Successfully joined room ${msg["room"]} with Id ${msg["id"]}`
                    );

                    const publishOwnFeed = () => {
                      vrc.storePlugin.createOffer({
                        // DataChannel 사용안함, Publisher는 전송만 진행하고 수신은 Subscriber에서 진행
                        media: {
                          audioRecv: false,
                          videoRecv: false,
                          audioSend: true,
                          videoSend: true,
                          video: "stdres-16:9",
                        },

                        success: function (jsep) {
                          Janus.debug("Got publisher SDP!", jsep);
                          var publish = {
                            request: "publish",
                            audio: true,
                            video: true,
                          };

                          // SDP Offer 생성 완료 후, Publish 메세지와 jsep를 담아 Plugin에 전송
                          vrc.storePlugin.send({
                            message: publish,
                            jsep: jsep,
                          });
                        },
                        error: function (error) {
                          // 에러 발생시 재시도
                          Janus.error("WebRTC error:", error);
                          publishOwnFeed();
                        },
                      });
                    };
                    publishOwnFeed();

                    if (msg["publishers"]) {
                      var list = msg["publishers"];
                      Janus.debug(
                        "Got a list of available publishers/feeds: ",
                        list
                      );
                      for (var f in list) {
                        var id = list[f]["id"];
                        var display = list[f]["display"];
                        var audio = list[f]["audio_codec"];
                        var video = list[f]["video_codec"];

                        Janus.debug(
                          "  >> [" +
                            id +
                            "] " +
                            display +
                            " (audio: " +
                            audio +
                            ", video: " +
                            video +
                            ")"
                        );
                        // 모두 Subscribe 진행
                        newRemoteFeed(id, display, audio, video);
                      }
                    }
                  } else if (event === "destroyed") {
                    Janus.warn("The room hs been destroyed!");
                    vrc.$router.push("/lobby");
                  } else if (event === "event") {
                    // 새로운 publisher 접속
                    if (msg["publishers"]) {
                      var list = msg["publishers"];
                      Janus.debug(
                        "Got a list of available publishers/feeds: ",
                        list
                      );
                      for (var f in list) {
                        var id = list[f]["id"];
                        var display = list[f]["display"];
                        var audio = list[f]["audio_codec"];
                        var video = list[f]["video_codec"];

                        Janus.debug(
                          "  >> [" +
                            id +
                            "] " +
                            display +
                            " (audio: " +
                            audio +
                            ", video: " +
                            video +
                            ")"
                        );
                        // 모두 Subscribe 진행
                        newRemoteFeed(id, display, audio, video);
                      }
                    } else if (msg["leaving"]) {
                      var leaving = msg["leaving"];
                      if (leaving === "ok") {
                        return;
                      }

                      vrc.$store.commit("stream/removeSubscriber", leaving);
                    } else if (msg["unpublished"]) {
                      var unpublished = msg["unpublished"];
                      if (unpublished === "ok") {
                        return;
                      }
                      console.log(
                        "unpublished 발생!! unpublished: ",
                        unpublished
                      );

                      vrc.$store.commit("stream/removeSubscriber", unpublished);
                    } else if (msg["error"]) {
                      if (msg["error_code"] === 433) {
                        vrc.$router.push("/lobby");
                        alert(`잘못된 비밀번호입니다!`);
                      } else if (msg["error_code"] === 426) {
                        // This is a "no such room" error: give a more meaningful description
                      } else {
                        Janus.error(msg["error"]);
                      }
                    }
                  }
                }
                if (jsep) {
                  Janus.debug("Handling SDP as well...", jsep);
                  vrc.storePlugin.handleRemoteJsep({ jsep: jsep });
                  // Audio가 거절당할 시
                  var audio = msg["audio_codec"];
                  if (
                    vrc.publishStream &&
                    vrc.publishStream.stream.getAudioTracks() &&
                    vrc.publishStream.stream.getAudioTracks().length > 0 &&
                    !audio
                  ) {
                    Janus.log(
                      "우리의 오디오 스트림이 거절되었습니다. viewer들은 우리를 들을 수 없습니다."
                    );
                  }

                  // Video가 거절당할 시
                  var video = msg["video_codec"];
                  if (
                    vrc.publishStream &&
                    vrc.publishStream.stream.getVideoTracks() &&
                    vrc.publishStream.stream.getVideoTracks().length > 0 &&
                    !video
                  ) {
                    Janus.log(
                      "우리의 비디오 스트림이 거절되었습니다. viewer들은 우리를 볼 수 없습니다."
                    );
                  }
                }
              },
              onlocalstream: function (stream) {
                console.log(stream);
                Janus.debug(" ::: Got a local stream :::", stream);
                if (stream.active) {
                  vrc.$store.commit("stream/addSubscribeStream", {
                    stream: stream,
                    nickname: username,
                  });
                  vrc.speechEvents = hark(stream, {});
                  vrc.speechEvents.on("speaking", function () {
                    console.log("speaking");
                    if (vrc.$route.name === "room-id") {
                      vrc.$root.roomSocket.emit(GameRoomEvent.SPEAK, {
                        userId: vrc.myInfo.profile.userId,
                        nickname: vrc.myInfo.profile.nickname,
                        speaking: true,
                      });
                    } else if (
                      vrc.$route.name === "game-id" &&
                      vrc.$root.gameSocket
                    ) {
                      vrc.$root.gameSocket.emit(GameEvent.SPEAK, {
                        userId: vrc.myInfo.profile.userId,
                        nickname: vrc.myInfo.profile.nickname,
                        speaking: true,
                      });
                    }
                  });

                  vrc.speechEvents.on("stopped_speaking", function () {
                    console.log("stopped_speaking");
                    if (vrc.$route.name === "room-id") {
                      vrc.$root.roomSocket.emit(GameRoomEvent.SPEAK, {
                        userId: vrc.myInfo.profile.userId,
                        nickname: vrc.myInfo.profile.nickname,
                        speaking: false,
                      });
                    } else if (
                      vrc.$route.name === "game-id" &&
                      vrc.$root.gameSocket
                    ) {
                      vrc.$root.gameSocket.emit(GameEvent.SPEAK, {
                        userId: vrc.myInfo.profile.userId,
                        nickname: vrc.myInfo.profile.nickname,
                        speaking: false,
                      });
                    }
                  });
                  // var elId = "remote" + vrc.myInfo.profile.userId;
                  // document.getElementById(elId).pause();
                  // document.getElementById(elId).load();
                  // document.getElementById(elId).play();
                }
              },
              // onlocaltrack: function (track, on) {
              //   console.log("온 로컬 스트림 ㄱㄱ");
              //   console.log("track is :", track);
              //   console.log("on is :", on);
              //   Janus.debug(
              //     "Local track " + (on ? "added" : "removed") + ":",
              //     track
              //   );
              //   var trackId = track.id.replace(/[{}]/g, "");

              //   if (!on) {
              //     // 트랙 제거됨
              //     return;
              //   }
              //   if (track.kind === "audio") {
              //   } else {
              //     let stream = new MediaStream();
              //     stream.addTrack(track.clone());
              //     vrc.$store.commit("stream/setPublishStream", {
              //       stream: stream,
              //       display: username,
              //     });
              //     Janus.log("로컬 스트림 생성됨: ", stream);
              //     if (vrc.publishStream) {
              //       vrc.$refs.myVideo.pause();
              //       Janus.attachMediaStream(vrc.$refs.myVideo, stream);
              //       vrc.$refs.myVideo.load();
              //       vrc.$refs.myVideo.play();
              //     }
              //   }
              // },
              onremotestream: function (stream) {
                // 오직 Publish에서만 전송
              },
              oncleanup: function () {
                Janus.log(
                  " ::: Got a cleanup notification: we are unpublished now :::"
                );
              },
              detached: function () {},
            });
          },
          error: function (err) {
            Janus.error(err);
            console.error(err);
          },
          destroyed: function () {
            Janus.log("Janus Destroyed");
          },
        });
      },
    });
  },
  beforeDestroy() {
    if (this.isRoomOut) {
      this.exit();
    }
  },
};
</script>
<style lang="scss" scoped>
#titlebox {
  font-size: 22px;
  font-weight: bold;
}
#tesgs {
  margin-top: 20px;
}
.leaveBox {
  width: 160px;
  height: 60px;
  margin: auto;
  //border: 3px solid rgb(255, 255, 255);
  display: flex;
  justify-content: center;
  position: relative;

  &:hover {
    .buttonCore {
      animation: color1 0.3s;
      animation-fill-mode: forwards;
    }
  }

  .buttonCore {
    margin-top: 20px;
    width: 150px;
    height: 40px;
    line-height: 27px;
    font-size: 20px;
    --tw-bg-opacity: 1;
    background-color: rgb(0 0 0 / 80%);
    color: white;
    font-weight: bold;
    border: 3px solid white;

    &:active {
      width: 140px;
      height: 35px;
      font-size: 20px;
    }
    button {
      width: 140px;
      height: 34px;
    }
  }
}
.readyBox {
  width: 160px;
  height: 60px;
  margin: auto 75px auto auto;
  //border: 3px solid rgb(255, 255, 255);
  display: flex;
  justify-content: center;
  position: relative;

  &:hover {
    .buttonCore {
      animation: color2 0.3s;
      animation-fill-mode: forwards;
    }
  }

  .buttonCore {
    margin-top: 20px;
    width: 150px;
    height: 40px;
    line-height: 27px;
    font-size: 20px;
    --tw-bg-opacity: 1;
    background-color: rgb(0 0 0 / 80%);
    color: white;
    font-weight: bold;
    border: 3px solid white;

    &:active {
      width: 140px;
      height: 35px;
      font-size: 20px;
    }
    button {
      width: 140px;
      height: 34px;
    }
  }
}
.startBox {
  width: 160px;
  height: 60px;
  margin: auto;
  //border: 3px solid rgb(255, 255, 255);
  display: flex;
  justify-content: center;
  position: relative;

  &:hover {
    .buttonCore {
      animation: color3 0.3s;
      animation-fill-mode: forwards;
    }
  }

  .buttonCore {
    margin-top: 20px;
    width: 150px;
    height: 40px;
    line-height: 27px;
    font-size: 20px;
    --tw-bg-opacity: 1;
    background-color: rgb(0 0 0 / 80%);
    color: white;
    font-weight: bold;
    border: 3px solid white;

    &:active {
      width: 140px;
      height: 35px;
      font-size: 20px;
    }
    button {
      width: 140px;
      height: 34px;
    }
  }
}
@keyframes buttonLineW {
  0% {
  }
  100% {
    width: 170px;
  }
}
@keyframes buttonLineH {
  0% {
  }
  100% {
    height: 60px;
  }
}
@keyframes color1 {
  0% {
  }
  100% {
    --tw-bg-opacity: 1;
    background-color: white;
    border-color: white;
    /* background-color: white; */
    color: #000;
  }
}
@keyframes color2 {
  0% {
  }
  100% {
    --tw-bg-opacity: 1;
    background-color: white;
    border-color: white;
    /* background-color: white; */
    color: #000;
  }
}
@keyframes color3 {
  0% {
  }
  100% {
    --tw-bg-opacity: 1;
    background-color: white;
    border-color: white;
    /* background-color: white; */
    color: #000;
  }
}
#roomMain {
  background-color: rgba(0, 0, 0, 0.665);

  #btntest {
    height: 90px;
    padding-right: 30px;
    // border-bottom: 5px solid #FBBF24;
  }
}
</style>
