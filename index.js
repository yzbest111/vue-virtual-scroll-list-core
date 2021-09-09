import Vue from 'vue'
import { VirtualProps } from './props'
import Virtual from './virtual'
import { Item } from './item'

// 通过Vue.component注册组件
const VirtualList = Vue.component('virtual-list', {
  props: VirtualProps,
  data() {
    return {
      range: null, // 用来存储数据的起始位置和结束位置
    }
  },
  created() {
    this.directionKey = 'scrollTop'
    this.installVirtual()
  },
  methods: {
    // initial Virtual
    installVirtual() {
      this.virtual = new Virtual({
        keeps: this.keeps,
        estimateSize: this.estimateSize,
        buffer: Math.round(this.keeps / 3),
        uniqueIds: this.getUniqueIdFromDataSources()
      }, this.onRangeChanged)

      // initial range
      this.range = this.virtual.getRange()
    },
    getUniqueIdFromDataSources() {
      const { dataKey } = this
      return this.dataSources.map(dataSource => typeof dataKey === 'function' ? dataKey(dataSource) : dataSource[dataKey])
    },
    onRangeChanged(range) {
      this.range = range
    },
    getOffset() {
      const { root } = this.$refs
      return root ? Math.ceil(root[this.directionKey]) : 0
    },
    onScoll(event) {
      const offset = this.getOffset()
      // const clientSize = this.getClientSize()
      // const scrollSize = this.getScrollSize()

      this.virtual.handleScroll(offset)
    },
    getRenderSlots(h) {
      const slots = []
      const { start, end } = this.range
      const { itemTag, dataSources, dataKey, dataComponent } = this
      for (let index = start; index <= end; index++) {
        const dataSource = dataSources[index]
        if (dataSource) {
          const uniqueKey = typeof dataKey === 'function' ? dataKey(dataSource) : dataSource[dataKey]
          if (typeof uniqueKey === 'string' || typeof uniqueKey === 'number') {
            slots.push(h(Item, {
              props: {
                tag: itemTag,
                index,
                uniqueKey,
                source: dataSource,
                component: dataComponent
              }
            }))
          } else {
            console.warn(`Cannot get the data-key '${dataKey}' from data-sources.`)
          }
        } else {
          console.warn(`Cannot get the index '${index}' from data-sources.`)
        }
      }
      return slots
    }
  },
  render(h) {
    const { paddingTop, paddingBottom } = this.range
    const paddingStyle = { padding: `${paddingTop}px 0px ${paddingBottom}`}
    const wrapperStyle = paddingStyle

    return h('div', {
      ref: 'root',
      on: {
        'scoll': this.onScoll
      }
    }, [
      h('div', {
        attrs: {
          role: 'group'
        },
        style: wrapperStyle
      }, this.getRenderSlots(h)),

      // an empty element to use to scroll to bottom
      h('div', {
        ref: 'shepherd',
        style: {
          width: '100%',
          height: '0'
        }
      })
    ])
  }
})
