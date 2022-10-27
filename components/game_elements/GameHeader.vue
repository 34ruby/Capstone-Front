<template lang="">
  <div class="justify-center h-12">
    <div class="flex h-full">
      <Timer ref="timer" :turnTime="turnTime" :leftTime="leftTime"></Timer>
      <div
        class="flex exit_button w-32 justify-center items-center rounded-xl bg-yellow-400 transition duration-300 hover:bg-yellow-600 cursor-pointer"
        @click="exit"
      >
        나가기
      </div>
    </div>
  </div>
</template>
<script>
import Timer from "@/components/game_elements/Timer.vue";
export default {
  components: {
    Timer,
  },
  data() {
    return {
      turnTime: 60,
      leftTime: 60,
    };
  },
  methods: {
    exit() {
      this.$swal({
        icon: "warning",
        title: "게임에서 나가시겠습니까?",
        html: "지금 나가면 패배 처리 되며 이 게임에 다시 들어올 수 없습니다.",
        showDenyButton: true,
        showCancelButton: true,
        denyButtonText: "나가기",
        cancelButtonText: "취소",
        showConfirmButton: false,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isDenied) {
          // this.$Swal('Changes are not saved', '', 'info')
          // this.$router.push('/lobby');
          this.$emit("leave");
          this.$router.push("/lobby");
        }
      });
    },
  },
};
</script>
<style lang=""></style>
