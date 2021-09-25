import { check } from "src/assets/scripts/functions";

export default {
  data() {
    return {
      preloader: true,
      watchPreload: null,
    };
  },

  methods: {
    startPreloading(watchPreload, maxms = 5000, watch = true) {
      if (watch) this.watchPreload = watchPreload;
      setTimeout(() => {
        if (this.preloader) this.preloader = false;
      }, maxms);
    },
  },

  watch: {
    watchPreload: {
      handler(val) {
        if (val) {
          const condType = check.type.isObject(val)
            ? Object.keys(val).length
            : val && val.length;
          setTimeout(() => {
            this.preloader = false;
          }, 1500);
        }
      },
      deep: true,
    },
  },
};
