<template lang="">
  <div class="bg-white w-1/5 flex flex-col h-full">
    <div class="p-1 bg-yellow-400 text-center font-extrabold text-2xl">
      Day {{ date }}
    </div>
    <div class="w-full p-3">
      <img :src="imageSrc[status]" alt="" />
    </div>
    <div class="p-2 overflow-auto flex-1">{{ info[status].information }}</div>
  </div>
</template>
<script>
export default {
  props: {
    date: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      imageSrc: {
        MEETING: require("@/assets/ingame/sun.svg"),
        VOTE: require("@/assets/ingame/vote.svg"),
        NIGHT: require("@/assets/ingame/moon.svg"),
        PUNISHMENT: require("@/assets/ingame/punishment.svg"),
      },
      info: {
        MEETING: {
          name: "낮",
          information:
            "서로 대화를 통해 마피아가 누구인지 추리하는 시간입니다.",
        },
        VOTE: {
          name: "투표",
          information: "마피아로 의심되는 사람을 투표하는 시간입니다.",
        },
        NIGHT: {
          name: "밤",
          information:
            "시민을 제외한 모든 직업들이 자신의 능력을 사용할 수 있는 시간입니다.",
        },
        PUNISHMENT: {
          name: "처형",
          information:
            "투표에서 가장 많은 표를 받은 사람의 최종 변론 시간입니다.",
        },
      },
    };
  },
};
</script>
<style lang=""></style>
