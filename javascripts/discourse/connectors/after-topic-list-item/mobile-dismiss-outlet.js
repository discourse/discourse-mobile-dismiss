export default {
  // only render on mobile
  shouldRender(args, component) {
    return component.site.mobileView;
  },
};
