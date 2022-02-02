import Component from "@ember/component";
import Category from "discourse/models/category";
import discourseComputed from "discourse-common/utils/decorators";
import { ajax } from "discourse/lib/ajax";
import { action } from "@ember/object";
import { alias } from "@ember/object/computed";

export default Component.extend({
  tagName: "div",
  classNames: ["mobile-dismiss-container"],
  attributeBindings: ["data-topic-id", "data-category-id"],
  "data-topic-id": alias("args.topic.id"),
  "data-category-id": alias("args.topic.category_id"),

  init() {
    this._super(...arguments);
  },

  @discourseComputed("args.topic.category_id")
  category(category_id) {
    return Category.findById(category_id);
  },

  @discourseComputed(
    "args.topic.notification_level",
    "args.topic.details.notification_level"
  )
  topicTracked(notification_level, preferredNotification_level) {
    return preferredNotification_level !== undefined
      ? preferredNotification_level > 1
      : notification_level > 1;
  },

  @discourseComputed("category.notification_level")
  categoryTracked(notificationLevel) {
    return notificationLevel > 1;
  },

  @action
  untrackTopic() {
    this.set("isUntrackingTopic", true);
    this.args.topic.details
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
  }
});
