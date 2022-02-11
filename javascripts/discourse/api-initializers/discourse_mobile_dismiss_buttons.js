import { apiInitializer } from "discourse/lib/api";
import Category from "discourse/models/category";
import discourseComputed, { bind } from "discourse-common/utils/decorators";
import { action } from "@ember/object";

export default apiInitializer("0.11.1", (api) => {
  api.modifyClass("component:topic-list-item", {
    classNameBindings: ["swiped"],

    swiped: false,
    xDown: 0,
    xUp: 0,
    yDown: 0,
    yUp: 0,

    didInsertElement() {
      this._super(...arguments);
      if (this.isTrackingTopic || this.isTrackingCategory) {
        this.addTouchListeners(this.element);
        this.appEvents.on("mobile-swipe:untrack", this, "resetSwipe");
      }
    },

    willDestroyElement() {
      this._super(...arguments);
      this.removeTouchListeners(this.element);
      this.appEvents.off("mobile-swipe:untrack", this, "resetSwipe");
    },

    @discourseComputed(
      "topic.notification_level",
      "topic.details.notification_level"
    )
    isTrackingTopic(notificationLevel, preferredNotificationLevel) {
      return preferredNotificationLevel !== undefined
        ? preferredNotificationLevel > 1
        : notificationLevel > 1;
    },

    @discourseComputed("topic.category_id")
    isTrackingCategory(category_id) {
      let category = Category.findById(category_id);
      return category.notification_level > 1;
    },

    @action
    resetSwipe(isTrackingTopicFromAppEvent, isTrackingCategoryFromAppEvent) {
      this.set("swiped", false);
      if (!isTrackingTopicFromAppEvent && !isTrackingCategoryFromAppEvent) {
        this.removeTouchListeners(this.element);
      }
    },

    handleGesture(xUp, xDown, yUp, yDown) {
      // https://stackoverflow.com/a/23230280/8418914
      let xDiff = xDown - xUp;
      let yDiff = yDown - yUp;

      if (Math.abs(xDiff) > Math.abs(yDiff)) {
        /* make sure not swiping up or down */
        if (xDiff > 0) {
          this.set("swiped", true);
        } else {
          this.set("swiped", false);
        }
      }
    },

    addTouchListeners(element) {
      if (this.site.mobileView) {
        element.addEventListener("touchstart", this.touchStartSwipe, false);
        element.addEventListener("touchmove", this.touchMoveSwipe, false);
        element.addEventListener("touchend", this.touchEndSwipe, false);
      }
    },

    removeTouchListeners(element) {
      if (this.site.mobileView) {
        element.removeEventListener("touchstart", this.touchStartSwipe, false);
        element.removeEventListener("touchmove", this.touchMoveSwipe, false);
        element.removeEventListener("touchend", this.touchEndSwipe, false);
      }
    },

    @bind
    touchStartSwipe(e) {
      this.xDown = e.changedTouches[0].screenX;
      this.yDown = e.changedTouches[0].screenY;
    },

    @bind
    touchMoveSwipe(e) {
      this.xUp = e.changedTouches[0].screenX;
      this.yUp = e.changedTouches[0].screenY;
      this.handleGesture(this.xUp, this.xDown, this.yUp, this.yDown);
    },

    @bind
    touchEndSwipe(e) {
      this.xUp = e.changedTouches[0].screenX;
      this.yUp = e.changedTouches[0].screenY;
      this.handleGesture(this.xUp, this.xDown, this.yUp, this.yDown);
    },
  });
});
