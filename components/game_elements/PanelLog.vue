<template lang="">
  <div class="bg-black/70 text-white w-3/5">
    <div
      v-if="status === 'PUNISHMENT'"
      class="flex h-full justify-center items-center"
    >
      <video
        class="w-full h-full"
        :src-object.prop.camel="roomMembers[vidNum - 1].stream"
        autoplay
        muted
      ></video>
    </div>
    <div v-else class="h-full flex flex-col overflow-auto" id="log_box">
      <div
        v-for="(item, index) in logs"
        :key="index"
        class="font-semibold px-1"
        :class="`${item.color ? item.color : 'text-white'}`"
      >
        {{ item.message }}
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    status: {
      type: String,
      default: "NIGHT",
    },
  },
  computed: {
    roomMembers() {
      return this.$store.state.stream.roomMembers ?? [];
    },
  },
  data() {
    return {
      logs: [],
      vidNum: 0,
    };
  },
  methods: {
    addLog(message) {
      this.logs.push(message);
      let logBox = document.getElementById("log_box");
      if (logBox) {
        logBox.scrollTop = logBox.scrollHeight;
      }
    },
  },
  mounted() {
    this.$store.commit("stream/loadBackupMembers");
  },
};
</script>
<style lang=""></style>
