<template lang="">
  <div class="bg-white w-1/5 h-full">
    <div class="gameJobBox flex flex-col h-full">
      <div class="jobImage w-full p-3">
        <img :src="imageSrc[myJob]" />
      </div>
      <div class="jobName bg-yellow-400 p-2 text-center font-bold">
        {{ info[myJob].name }}
      </div>
      <div class="overflow-auto flex-1">
        <p class="jobSkill p-1">{{ info[myJob].skill }}</p>
        <p class="jobInformation p-1">{{ info[myJob].information }}</p>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      myJob: "WAITING",
      imageSrc: {
        MAFIA: require("@/assets/sidebar/mafia.svg"),
        POLICE: require("@/assets/sidebar/police.svg"),
        DOCTOR: require("@/assets/sidebar/doctor.svg"),
        CITIZEN: require("@/assets/sidebar/citizen.svg"),
        WAITING: require("@/assets/sidebar/question.svg"),
      },
      info: {
        MAFIA: {
          name: "마피아",
          skill:
            "특수능력 : 매일 밤마다 특정 유저 1명을 지목하여 죽일 수 있습니다. 마피아가 2명일 경우, 2명 모두 같은 유저를 지목하여야 됩니다.",
          information: "시민에게 들키지 않고 시민을 죽여야 합니다.",
        },
        POLICE: {
          name: "경찰",
          skill:
            "특수능력 : 매일 밤마다 특정 유저 1명을 지목하여 그 유저가 마피아인지 시민인지 확인할 수 있습니다.",
          information: "시민과 힘을 합쳐 마피아를 찾아내어야 합니다.",
        },
        DOCTOR: {
          name: "의사",
          skill:
            "특수능력 : 매일 밤마다 특정 유저 1명을 지목하여 그 유저를 살릴 수 있습니다.",
          information: "시민과 힘을 합쳐 마피아를 찾아내어야 합니다.",
        },
        CITIZEN: {
          name: "시민",
          skill: "특수능력 : 없음",
          information: "의사, 경찰과 힘을 합쳐 마피아를 찾아내어야 합니다.",
        },
        WAITING: {
          name: "WAITING",
          skill: "WAITING",
          information: "WAITING",
        },
      },
    };
  },
};
</script>
<style lang=""></style>
