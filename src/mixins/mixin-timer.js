export default {
  data() {
    return {
      timer: null,
      secondsTimer: 0,
    };
  },

  created() {
    this.timer = setInterval(() => {
      this.secondsTimer += 1;
    }, 1000);
  },

  computed: {
    minuteTimer() {
      return Math.round(this.secondsTimer / 60);
    },
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
