import Component from "@ember/component";
import Category from "discourse/models/category";
import discourseComputed from "discourse-common/utils/decorators";
import { action } from "@ember/object";
import { readOnly } from "@ember/object/computed";

export default Component.extend({
  tagName: "div",
  classNames: ["mobile-dismiss-container"],
  attributeBindings: ["data-topic-id", "data-category-id"],
  "data-topic-id": readOnly("topic.id"),
  "data-category-id": readOnly("topic.category_id"),

  @discourseComputed("topic.category_id")
  category(category_id) {
    return Category.findById(category_id);
  },

  @discourseComputed(
    "topic.notification_level",
    "topic.details.notification_level"
  )
  topicTracked(notificationLevel, preferredNotificationLevel) {
    return preferredNotificationLevel !== undefined
      ? preferredNotificationLevel > 1
      : notificationLevel > 1;
  },

  @discourseComputed("category.notification_level")
  categoryTracked(notificationLevel) {
    return notificationLevel > 1;
  },

  @action
  untrackTopic() {
    this.topic.details
      .updateNotifications(1)
      .finally(() =>
        this.appEvents.trigger(
          "mobile-swipe:untrack",
          false,
          this.categoryTracked
        )
      );
  },

  @action
  untrackCategory() {
    this.category.setNotification(1).then(() => {
      this.appEvents.trigger("mobile-swipe:untrack", this.topicTracked, false);
    });
  },
});
