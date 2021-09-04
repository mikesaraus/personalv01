import { formatDistance } from "date-fns";
import { date } from "quasar";

export default {
  methods: {
    relativeDate(value) {
      if (date.getDateDiff(new Date(), new Date(value), "years") == 0) {
        if (date.getDateDiff(new Date(), new Date(value), "hours") > 12) {
          return (
            date.formatDate(value, "MMMM D") +
            " at " +
            date.formatDate(value, "h:mm A")
          );
        } else {
          return formatDistance(value, new Date(), { addSuffix: true });
        }
      } else {
        return date.formatDate(value, "MMMM D, YYYY");
      }
    },
  },
};
