<template lang="">
  <div class="body">
    <Play></Play>
  </div>
</template>
<script>
import Play from "@/components/play.vue";
import { GameEvent } from "@/api/mafiaAPI";

export default {
  components: {
    Play,
  },
  data() {
    return {};
  },
  created() {
    this.$root.gameSocket = this.$nuxtSocket({
      channel: "/game",
      withCredentials: true,
      transports: ["websocket"],
    });
  },

  computed: {
    isRoomOut() {
      return this.$store.state.stream.isRoomOut;
    },
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
  methods: {
    exit() {
      console.log("나가");
      var unpublish = { request: "unpublish" };
      var leave = { request: "leave" };
      var vrc = this;
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
    },
  },
  asyncData({ params }) {
    return {
      janus: params.janus,
      storePlugin: params.storePlugin,
      roomInfo: params.roomInfo,
    };
  },
  beforeDestroy() {
    // if (this.isRoomOut) {
    //   this.exit();
    // }
    console.log("beforeDestroy 에서 exit발생");
    this.exit();
  },
};
</script>
<style lang="scss"></style>
