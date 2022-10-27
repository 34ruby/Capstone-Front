<template lang="">
  <div class="px-5 pb-5 flex-1 overflow-hidden">
    <div class="h-full mb-12 px-4">
      <div
        class="h-full flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-black/80 text-white"
      >
        <div class="rounded-t mb-0 px-4 py-3 border-0">
          <div class="flex flex-wrap items-center">
            <div class="relative w-full px-4 max-w-full flex-grow flex-1">
              <p class="font-medium text-2xl uppercase text-white inline">
                Currently
              </p>
              <p class="font-thin text-2xl uppercase text-white inline">
                Active
              </p>
              <p class="font-semibold text-2xl uppercase text-white inline">
                Rooms
              </p>
            </div>
          </div>
        </div>
        <div class="block w-full relative">
          <div class="grid grid-cols-12">
            <div
              class="flex align-middle border border-solid border-l-0 border-r-0 whitespace-nowrap bg-amber-400 border-amber-300"
            >
              <div class="h-full bg-transparent">&nbsp</div>
              <div
                class="px-6 py-2 text-base uppercase font-semibold text-left text-black flex justify-center"
              >
                No.
              </div>
            </div>
            <div
              class="col-span-5 px-6 align-middle border border-solid py-2 text-base uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left bg-amber-400 text-black border-amber-300 flex"
            >
              Room Name
            </div>
            <div
              class="px-6 align-middle border border-solid py-2 text-base uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left bg-amber-400 text-black border-amber-300 flex justify-center"
            >
              Mode
            </div>
            <div
              class="px-6 align-middle border border-solid py-2 text-base uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left bg-amber-400 text-black border-amber-300 flex justify-center"
            >
              Host
            </div>
            <div
              class="col-span-2 px-6 align-middle border border-solid py-2 text-base uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left bg-amber-400 text-black border-amber-300 flex justify-center"
            >
              Users
            </div>
            <div
              class="col-span-2 px-6 align-middle border border-solid py-2 text-base uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left bg-amber-400 text-black border-amber-300 flex justify-center"
            >
              Capacity
            </div>
          </div>
        </div>
        <div class="flex-1 overflow-auto flex flex-col">
          <div class="grow">
            <div class="">
              <div v-for="room in rooms">
                <div
                  class="grid grid-cols-12 transition duration-200 ease-in group hover:bg-gradient-to-r hover:from-white/20 hover:to-black/0 cursor-pointer"
                  @click="onClickRoomButton(room)"
                >
                  <div
                    class="border-t-0 flex items-center align-middle border-l-0 border-r-0 text-s whitespace-nowrap"
                  >
                    <div
                      class="h-full group-hover:bg-gradient-to-t group-hover:from-amber-500 group-hover:to-amber-300 bg-transparent"
                    >
                      &nbsp
                    </div>
                    <div
                      class="px-6 p-4 flex items-center align-middle text-amber-300 text-lg font-semibold justify-center"
                    >
                      {{ room.id }}
                    </div>
                  </div>
                  <div
                    class="col-span-5 border-t-0 px-6 align-middle flex items-center border-l-0 border-r-0 text-s whitespace-nowrap p-4 text-lg font-semibold"
                  >
                    <span>
                      {{ room.description
                      }}<svg
                        v-if="room.isPrivate"
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 mx-2 inline"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </span>
                  </div>
                  <div
                    class="border-t-0 px-6 align-middle flex items-center border-l-0 border-r-0 text-s whitespace-nowrap p-4 justify-center"
                  >
                    {{ room.mode == "classic" ? "Classic" : "Extended" }}
                  </div>
                  <div
                    class="border-t-0 px-6 align-middle flex items-center border-l-0 border-r-0 text-s whitespace-nowrap p-4 justify-center"
                  >
                    {{ room.members[0] ? room.members[0].nickname : "" }}
                  </div>
                  <div
                    class="col-span-2 border-t-0 px-6 align-middle flex-col items-center border-l-0 border-r-0 text-s p-4 justify-center"
                  >
                    <div class="flex justify-center items-center">
                      <img
                        v-for="(member, i) in room.members.slice(0, 5)"
                        :key="member.userId"
                        :src="
                          member.image
                            ? member.image.location
                            : '/defaultProfile.png'
                        "
                        :alt="member.nickname"
                        class="w-10 h-10 rounded-full border-2 border-blueGray-50 shadow bg-zinc-700"
                        :class="{ '-ml-4': i > 0 }"
                      />
                    </div>
                    <div
                      v-if="room.members.length > 5"
                      class="flex justify-center items-center -mt-4"
                    >
                      <img
                        v-for="(member, i) in room.members.slice(5, 10)"
                        :key="member.userId"
                        :src="
                          member.image
                            ? member.image.location
                            : '/defaultProfile.png'
                        "
                        :alt="member.nickname"
                        class="w-10 h-10 rounded-full border-2 border-blueGray-50 shadow bg-zinc-700"
                        :class="{ '-ml-4': i > 0 }"
                      />
                    </div>
                  </div>
                  <div
                    class="col-span-2 border-t-0 px-6 align-middle flex items-center border-l-0 border-r-0 text-s whitespace-nowrap p-4 justify-center"
                  >
                    <div class="flex flex-col items-center w-full">
                      <div class="relative w-full">
                        <div
                          :class="`overflow-hidden h-2 text-s flex rounded ${
                            getRound(room) >= 100
                              ? 'bg-red-200'
                              : getRound(room) > 60
                              ? 'bg-yellow-100'
                              : 'bg-green-100'
                          }`"
                        >
                          <!-- <div
                            :class="`shadow-none text-center whitespace-nowrap text-white justify-center ${
                              getRound(room) >= 100
                                ? 'bg-red-500'
                                : getRound(room) > 60
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            } w-[${getRound(room)}%]`"
                          ></div> -->
                          <ProgressBar :room="room"></ProgressBar>
                        </div>
                      </div>
                      <span class="mr-2"
                        >{{ room.members.length }}/{{ room.publishers }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import styled from "vue-styled-components";
import { isJoinable, checkPassword, getRoom } from "@/api/mafiaAPI";
// import { ProgressBar } from "@/components/lobby_elements/styled_components";

const ProgressBar = styled("div", { room: Object })`
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-text-opacity: 1;
  --tw-bg-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  text-align: center;
  white-space: nowrap;
  justify-content: center;
  background-color: ${(props) => {
    return `${
      Math.round((props.room.members.length / props.room.publishers) * 100) >=
      100
        ? "rgb(239 68 68 / var(--tw-bg-opacity))"
        : Math.round(
            (props.room.members.length / props.room.publishers) * 100
          ) >= 60
        ? "rgb(234 179 8 / var(--tw-bg-opacity))"
        : "rgb(34 197 94 / var(--tw-bg-opacity))"
    }`;
  }};
  width: ${(props) => {
    return `${Math.round(
      (props.room.members.length / props.room.publishers) * 100
    )}%`;
  }};
`;

export default {
  props: {
    rooms: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    ProgressBar,
  },
  data() {
    return {
      testArray: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    };
  },
  methods: {
    async onClickRoomButton(room) {
      isJoinable(room.id)
        .then(async (res) => {
          let pin;
          if (room.isPrivate) {
            const { value: password } = await this.$swal({
              title: "Enter password",
              input: "password",
              inputLabel: "Password",
              inputPlaceholder: "Enter password",
              inputAttributes: {
                maxlength: 10,
                autocapitalize: "off",
                autocorrect: "off",
              },
            });

            if (password) {
              // this.$swal(`Entered password: ${password}`);
              pin = password;
              checkPassword(room.id, { pin })
                .then((res) => {
                  console.log(res);
                  if (res.data.data.joinable) {
                    getRoom(room.id)
                      .then((res) => {
                        this.$store.commit(
                          "stream/setRoomMembers",
                          res.data.data.members
                        );
                        this.$router.push({
                          name: "room-id",
                          params: {
                            id: room.id,
                            room: room.room,
                            pin: pin,
                          },
                        });
                      })
                      .catch((err) => {
                        console.log(err);
                      });
                  }
                })
                .catch((err) => {
                  console.log(err);
                  this.$swal({
                    icon: "error",
                    title: "Wrong password",
                  });
                });
            }
          } else {
            getRoom(room.id)
              .then((res) => {
                this.$store.commit(
                  "stream/setRoomMembers",
                  res.data.data.members
                );
                this.$router.push({
                  name: "room-id",
                  params: {
                    id: room.id,
                    room: room.room,
                    pin: pin,
                  },
                });
              })
              .catch((err) => {
                console.log(err);
              });
          }
        })
        .catch((err) => {
          this.$swal({
            icon: "error",
            title: err.response.data.data.message,
            customClass: {
              container: "noRoom",
            },
          });
        });
    },
    getRound(room) {
      return Math.round((room.members.length / room.publishers) * 100);
    },
  },
};
</script>
<style lang="scss">
.noRoom {
  .swal2-popup {
    border: 5px solid white;
    background-color: rgba(0, 0, 0, 0.705);
    .swal2-title {
      color: white;
    }
    .swal2-confirm {
      background-color: white;
      color: black;
    }
  }
}
</style>
