<template>
  <div class="chatBox w-full">
    <transition-group
      name="list"
      tag="div"
      class="h-fit flex flex-wrap-reverse group"
    >
      <Tab
        v-for="(chat, index) in chats"
        :key="chat.name"
        class="group-hover:translate-y-0"
        :index="index"
        :chat="chat"
        :selectedIndex="$store.state.selectedIndex"
      >
        <div class="flex justify-between relative items-center">
          <p
            class="font-bold text-sm inline-block whitespace-nowrap overflow-hidden overflow-ellipsis w-full pl-2"
            @click="tabClicked(index)"
          >
            {{ chat.name }}
          </p>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 hidden group-hover:inline-block text-red-600/50 hover:text-red-600"
            viewBox="0 0 20 20"
            fill="currentColor"
            v-if="chat.closable"
            @click="tabClose(index)"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          <TabBorder class="h-2/3" :index="index" :chats="chats">
            &nbsp;
          </TabBorder>
        </div>
      </Tab>
    </transition-group>
    <div
      class="h-52 bg-black/75 border-t-4"
      style="border-color: rgb(48, 48, 48)"
    >
      <div class="h-full flex flex-col-reverse overflow-auto">
        <div
          v-for="(message, index) in chats[selectedIndex].messages"
          :key="index"
          class="text-white font-semibold pl-2 mb-1"
        >
          {{ message }}
        </div>
      </div>
    </div>
    <!-- <label class="inline" for="chatInput">:</label>
    <input
      class="outline-none"
      v-model="input"
      @keyup.enter="sendMessage"
      type="text"
      name="chatInput"
    /> -->
    <div
      class="flex align-center py-2 px-3"
      style="background-color: rgb(48, 48, 48)"
    >
      <!-- <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 hover:cursor-pointer hover:text-blue-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg> -->
      <div class="grow mr-3">
        <input
          type="text"
          class="w-full bg-white px-2 py-1 outline-none"
          placeholder="Type your message here..."
          v-model="input"
          @keyup.enter="sendMessage"
        />
      </div>
      <!-- <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        class="h-6 w-6 hover:cursor-pointer inline text-amber-500 hover:text-blue-700"
        @click="sendMessage"
      >
        <path
          d="M511.6 36.86l-64 415.1c-1.5 9.734-7.375 18.22-15.97 23.05c-4.844 2.719-10.27 4.097-15.68 4.097c-4.188 0-8.319-.8154-12.29-2.472l-122.6-51.1l-50.86 76.29C226.3 508.5 219.8 512 212.8 512C201.3 512 192 502.7 192 491.2v-96.18c0-7.115 2.372-14.03 6.742-19.64L416 96l-293.7 264.3L19.69 317.5C8.438 312.8 .8125 302.2 .0625 289.1s5.469-23.72 16.06-29.77l448-255.1c10.69-6.109 23.88-5.547 34 1.406S513.5 24.72 511.6 36.86z"
        />
      </svg> -->
      <div
        class="p-1 cursor-pointer rounded-md hover:bg-zinc-600/50 transition"
        @click="sendMessage"
      >
        <svg
          class="w-6 h-6 text-amber-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 5l7 7-7 7M5 5l7 7-7 7"
          ></path>
        </svg>
      </div>
    </div>
  </div>
</template>
<script>
import styled from "vue-styled-components";
import { GameRoomEvent, sendDM } from "@/api/mafiaAPI";

const tapProps = { index: Number, selectedIndex: Number, chat: Object };
const TabBorder = styled("div", { index: Number, chats: Array })`
  border-right: ${(props) =>
    props.index + 1 !== props.chats.length
      ? "1px solid rgb(48, 48, 48)"
      : "none"};
`;
const Tab = styled("div", tapProps)`
  width: 12.5%;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  overflow: hidden;
  background-color: ${(props) => {
    return `${
      props.index == props.selectedIndex
        ? "rgb(48, 48, 48)"
        : props.chat.read
        ? "rgb(15, 15, 15)"
        : "rgb(245 158 11)"
    }`;
  }};
  color: rgb(216, 216, 216);
  /* border-width: 2px; */
  border-color: ${(props) => {
    return `${
      props.index == props.selectedIndex
        ? "rgb(48, 48, 48)"
        : props.chat.read
        ? "rgb(15, 15, 15)"
        : "rgb(245 158 11)"
    }`;
  }};
  position: relative;
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter,
    backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
  z-index: ${(props) => 50 - props.index};
  transform: ${(props) => {
    return `translateY(${parseInt(props.index / 8) * 3 * 0.25}rem);`;
  }};
  cursor: pointer;
  &:hover {
    background-color: ${(props) => {
      return `${
        props.index == props.selectedIndex
          ? "rgb(48, 48, 48)"
          : props.chat.read
          ? "rgb(30, 30, 30)"
          : "rgb(251 191 36)"
      }`;
    }};
    border-color: ${(props) => {
      return `${
        props.index == props.selectedIndex
          ? "rgb(48, 48, 48)"
          : props.chat.read
          ? "rgb(30, 30, 30)"
          : "rgb(251 191 36)"
      }`;
    }};
  }
`;

export default {
  components: {
    Tab,
    TabBorder,
  },
  data() {
    return {
      input: "",
      socket: null,
      messages: [],
    };
  },
  computed: {
    chats() {
      return this.$store.state.chats;
    },
    selectedIndex() {
      return this.$store.state.selectedIndex;
    },
  },
  methods: {
    tabClicked(index) {
      console.log("tab Clicked!!");
      this.$store.commit("tabClicked", index);
    },
    tabClose(index) {
      console.log("tab Closed!");
      this.$store.commit("tabClose", index);
    },
    sendMessage() {
      if (this.input) {
        const msg = this.input;
        this.input = "";
        if (this.selectedIndex === 0) {
          if (this.$route.name == "room-id") {
            this.$root.roomSocket.emit(GameRoomEvent.MESSAGE, { message: msg });
          } else if (this.$route.name == "lobby") {
            this.$root.lobbySocket.emit(GameRoomEvent.MESSAGE, {
              message: msg,
            });
          }
        } else {
          console.log("현재 탭 유저 Id", this.chats[this.selectedIndex].userId);
          sendDM({
            message: msg,
            friendId: this.chats[this.selectedIndex].userId,
          });
        }
      }
    },
  },
  mounted() {
    if (this.$route.name == "room-id") {
      this.$root.roomSocket.on(GameRoomEvent.MESSAGE, (data) => {
        console.log(data);
        this.$store.commit("newMessageOnMain", data);
      });
    } else if (this.$route.name == "lobby") {
      this.$root.lobbySocket.on(GameRoomEvent.MESSAGE, (data) => {
        console.log(data);
        this.$store.commit("newMessageOnMain", data);
      });
    }
  },
};
</script>
<style lang="css" scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s;
}

.list-enter,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
