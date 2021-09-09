import Vue from 'vue'
import { ItemProps } from './props'

const Wrapper = {
  created() {
    this.shapeKey = 'offsetHeight'
  },
  mounted() {
    // create a resizeObserver to observe the target element
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.dispatchSizeChange()
      })
      this.resizeObserver.observe(this.$el)
    }
  },
  // since component will be used, so dispath when updated
  updated() {
    this.dispatchSizeChange()
  },
  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
  },
  methods: {
    getCurrentSize() {
      return this.$el ? this.$el[this.shapeKey] : 0
    },
    dispatchSizeChange() {
      this.$parent.emit(this.event, this.uniqueKey, this.getCurrentSize(), this.hasInitial)
    }
  }
}

export const Item = Vue.component('virtual-list-item', {
  mixin: [Wrapper],
  props: ItemProps,
  render(h) {
    const { component, index, uniqueKey, source } = this
    return h(tag, {
      key: uniqueKey,
      attrs: {
        role: 'listitem'
      }
    },[
      h(component, {
        props: {
          source,
          index
        }
      })
    ])
  }
})