import { ref } from "vue";

export default {
  data() {
    return {
      timer: ref(null),
      minuteTimer: ref(0),
    };
  },

  created() {
    this.timer = setInterval(() => {
      this.minuteTimer += 1;
    }, 1000);
  },

  methods: {
    cancelAutoUpdate() {
      clearInterval(this.timer);
    },
  },

  beforeUnmount() {
    this.cancelAutoUpdate();
  },
};
