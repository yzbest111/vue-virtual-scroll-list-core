export const VirtualProps = {
  dataKey: {
    type: [String, Function],
    required: true
  },
  dataSources: {
    type: Array,
    required: true
  },
  dataComponent: {
    type: [Object, Function],
    required: true
  },
  keeps: {
    type: Number,
    default: 30
  },
  estimateSize: {
    type: Number,
    default: 50
  },
  itemTag: {
    type: String,
    default: 'div'
  }
}

export const ItemProps = {
  index: {
    type: Number
  },
  tag: {
    type: String,
    default: 'div'
  },
  source: {
    type: Object
  },
  component: {
    type: [Object, Function]
  },
  uniqueKey: {
    type: [String, Number]
  }
}
