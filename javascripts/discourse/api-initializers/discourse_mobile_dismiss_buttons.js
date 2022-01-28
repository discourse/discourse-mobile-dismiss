import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("0.11.1", api => {
  api.modifyClass("component:topic-list-item", {
    didInsertElement() {
      this._super(...arguments);
      this.addTouchListeners(this.element);
    },

    willDestroyElement() {
      this._super(...arguments);
      this.removeTouchListeners(this.element);
    },

    handleGesture(xUp, xDown, yUp, yDown) {
      // https://stackoverflow.com/a/23230280/8418914
      let xDiff = xDown - xUp;
      let yDiff = yDown - yUp;

      if (Math.abs(xDiff) > Math.abs(yDiff)) {
        /* make sure not swiping up or down */
        if (xDiff > 0) {
          this.element.classList.add("swiped");
        } else {
          this.element.classList.remove("swiped");
        }
      }
    },

    addTouchListeners(element) {
      if (this.site.mobileView) {
        let xDown = 0;
        let xUp = 0;
        let yDown = 0;
        let yUp = 0;

        this.touchStart = e => {
          xDown = e.changedTouches[0].screenX;
          yDown = e.changedTouches[0].screenY;
        };
        this.touchMove = e => {
          xUp = e.changedTouches[0].screenX;
          yUp = e.changedTouches[0].screenY;
          this.handleGesture(xUp, xDown, yUp, yDown);
        };
        this.touchEnd = e => {
          xUp = e.changedTouches[0].screenX;
          yUp = e.changedTouches[0].screenY;
          this.handleGesture(xUp, xDown, yUp, yDown);
        };

        const opts = {
          passive: false
        };

        element.addEventListener("touchstart", this.touchStart, opts);
        element.addEventListener("touchmove", this.touchMove, opts);
        element.addEventListener("touchend", this.touchEnd, opts);
      }
    },

    removeTouchListeners(element) {
      if (this.site.mobileView) {
        element.removeEventListener("touchstart", this.touchStart);
        element.removeEventListener("touchmove", this.touchMove);
        element.removeEventListener("touchend", this.touchEnd);
      }
    }
  });
});
