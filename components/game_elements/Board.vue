<template lang="">
  <div
    class="board_box flex mt-3 h-full rounded-xl overflow-hidden border-2 border-yellow-400"
  >
    <PanelTurn :date="date" :status="status"></PanelTurn>
    <PanelLog :status="status" ref="panel_log"></PanelLog>
    <PanelJob ref="panel_job"></PanelJob>
  </div>
</template>
<script>
import PanelJob from "@/components/game_elements/PanelJob.vue";
import PanelLog from "@/components/game_elements/PanelLog.vue";
import PanelTurn from "@/components/game_elements/PanelTurn.vue";
export default {
  components: {
    PanelJob,
    PanelLog,
    PanelTurn,
  },
  data() {
    return {
      date: 0,
      status: "NIGHT",
    };
  },
  methods: {
    addLog(message) {
      this.$refs.panel_log.addLog(message);
    },
    grantJob(job) {
      this.$refs.panel_job.myJob = job;
    },
    setPunishVidNum(num) {
      this.$refs.panel_log.vidNum = num;
    },
  },
};
</script>
<style lang="scss" scoped>
.board_box {
  font-family: "Jua", sans-serif;
}
</style>
