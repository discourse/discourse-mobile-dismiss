import Component from "@ember/component";
import discourseComputed from "discourse-common/utils/decorators";
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

  @action
  dismissTopic() {
    console.log(this["data-topic-id"]);
  },

  @action
  untrackTopic() {
    console.log(this["data-topic-id"]);
  },

  @action
  untrackCategory() {
    console.log(this["data-category-id"]);
  },
})
