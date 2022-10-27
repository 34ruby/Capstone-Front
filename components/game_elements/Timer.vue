<template lang="">
  <div class="flex w-full">
    <div
      class="flex exit_button w-32 justify-center items-center rounded-l-full bg-orange-400"
    >
      {{ parseInt(leftTime / 60) }} : {{ leftTime % 60 }}
    </div>
    <div
      class="flex timer w-full items-center mr-2 px-3 rounded-r-full bg-orange-700"
    >
      <!-- <div class="overflow-hidden h-5 text-s flex rounded-full bg-green-100"> -->
      <!-- <div
          class="text-center whitespace-nowrap justify-center bg-green-400 transition duration-1000 ease-linear"
          :style="{ width: `${percentage}%` }"
        ></div> -->
      <!-- <ProgressBar :percentage="percentage"></ProgressBar> -->
      <!-- </div> -->
      <ProgressBar :percentage="percentage"></ProgressBar>
    </div>
  </div>
</template>
<script>
import ProgressBar from "@/components/game_elements/ProgressBar.vue";
// import styled from "vue-styled-components";

// const ProgressBar = styled("div", { percentage: Number })`
//   --tw-shadow: 0 0 #0000;
//   --tw-shadow-colored: 0 0 #0000;
//   --tw-text-opacity: 1;
//   --tw-bg-opacity: 1;
//   color: rgb(255 255 255 / var(--tw-text-opacity));
//   box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
//     var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
//   text-align: center;
//   white-space: nowrap;
//   justify-content: center;
//   background-color: ${(props) => {
//     return `${
//       props.percentage >= 80
//         ? "rgb(239 68 68 / var(--tw-bg-opacity))"
//         : props.percentage >= 50
//         ? "rgb(234 179 8 / var(--tw-bg-opacity))"
//         : "rgb(34 197 94 / var(--tw-bg-opacity))"
//     }`;
//   }};
//   width: ${(props) => {
//     return `${props.percentage}%`;
//   }};
// `;

export default {
  props: {
    turnTime: {
      type: Number,
      required: true,
    },
    leftTime: {
      type: Number,
      required: true,
    },
  },
  components: {
    ProgressBar,
  },
  computed: {
    percentage() {
      return Math.round(
        ((this.turnTime - this.leftTime) / this.turnTime) * 100
      );
    },
  },
};
</script>
<style lang=""></style>
