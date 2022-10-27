<template>
  <div class="w-full bg-gray-200 h-5 relative overflow-hidden rounded-full">
    <div
      class="h-full progressbar"
      :class="`${
        percentage >= 80
          ? 'bg-red-500'
          : percentage >= 50
          ? 'bg-yellow-500'
          : 'bg-green-500'
      }`"
      role="progressbar"
      :style="{ width: `${percentage}%` }"
      :aria-valuenow="percentage"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <span class="flex items-center h-full pl-5 pt-1">
        <slot></slot>
      </span>
    </div>
  </div>
</template>
<script>
export default {
  inheritAttrs: false,
  props: {
    percentage: {
      type: Number,
      default: 0,
    },
  },
};
</script>
<style scoped>
@keyframes progress-indeterminate {
  0% {
    width: 30%;
    left: -40%;
  }
  60% {
    left: 100%;
    width: 100%;
  }
  to {
    left: 100%;
    width: 0;
  }
}
.progressbar {
  transition: width 0.3s ease, background-color 1s ease;
}
.indeterminate .progressbar {
  animation: progress-indeterminate 1s ease infinite;
}
</style>
