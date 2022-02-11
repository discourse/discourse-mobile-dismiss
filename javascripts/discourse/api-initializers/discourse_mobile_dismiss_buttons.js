import { apiInitializer } from "discourse/lib/api";
import Category from "discourse/models/category";
import discourseComputed, { bind } from "discourse-common/utils/decorators";
import { action } from "@ember/object";

export default apiInitializer("0.11.1", (api) => {
  api.modifyClass("component:topic-list-item", {
    classNameBindings: ["swiped"],

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

    @discourseComputed("xDown", "xUp", "yDown", "yUp")
    swiped(xDown, xUp, yDown, yUp) {
      // https://stackoverflow.com/a/23230280/8418914
      const xDiff = xDown - xUp;
      const yDiff = yDown - yUp;

      // make sure not swiping up or down
      return Math.abs(xDiff) > Math.abs(yDiff) && xDiff > 0;
    },

    @action
    resetSwipe(isTrackingTopicFromAppEvent, isTrackingCategoryFromAppEvent) {
      this.set("swiped", false);
      if (!isTrackingTopicFromAppEvent && !isTrackingCategoryFromAppEvent) {
        this.removeTouchListeners(this.element);
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
      this.set("xDown", e.changedTouches[0].screenX);
      this.set("yDown", e.changedTouches[0].screenY);
    },

    @bind
    touchMoveSwipe(e) {
      this.set("xUp", e.changedTouches[0].screenX);
      this.set("yUp", e.changedTouches[0].screenY);
    },

    @bind
    touchEndSwipe(e) {
      this.set("xUp", e.changedTouches[0].screenX);
      this.set("yUp", e.changedTouches[0].screenY);
    }
  });
});
