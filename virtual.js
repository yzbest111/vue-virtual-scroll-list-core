const DIRECTION_TYPE = {
  FRONT: 'FRONT',
  BEHIND: 'BEHIND'
}
const LEADING_BUFFER = 2

export default class Virtual {
  constructor(param, callUpdate) {
    this.init(param, callUpdate)
  }
  init(param, callUpdate) {
    this.param = param
    this.callUpdate = callUpdate

    // size data
    this.sizes = new Map()
    this.lastCalcIndex = 0 // 最后一项数据的index
    this.firstRangeTotalSize = 0

    // scroll data
    this.offset = 0
    this.direction = ''

    // range data
    this.range = Object.create(null)
    if (param) this.checkRange(0, param.keeps - 1) // start, end
  }
  checkRange(start, end) {
    const keeps = this.param.keeps
    const total = this.param.uniqueIds.length

    // if data less than keeps, render all
    if (total <= keeps) {
      start = 0
      end = this.getLastIndex()
    } else if (end - start < keeps - 1) {
      // if range data is less than keeps, correct start to base on end
      start = end - keeps + 1
    }

    if (this.range.start !== start) this.updateRange(start, end)
  }
  // return a new range
  updateRange(start, end) {
    this.range.start = start
    this.range.end = end
    this.range.paddingTop = this.getPaddingTop()
    this.range.paddingBottom = this.getPaddingBottom()
    this.callUpdate(this.getRange())
  }
  // return paddingTop
  getPaddingTop() {
    // 获取paddingTop的距离
    return this.getIndexOffset(this.range.start)
  }
  // return paddingBottom
  getPaddingBottom() {
    const end = this.range.end
    const lastIndex = this.getLastIndex()

    if(this.lastCalcIndex === lastIndex) {
      return this.getIndexOffset(lastIndex) - this.getIndexOffset(end)
    } else {
      return (lastIndex - end) * this.getEstimateSize()
    }
  }
  getRange() {
    const range = Object.create(null)
    range.start = this.range.start
    range.end = this.range.end
    range.paddingTop = this.range.paddingTop
    range.paddingBottom = this.range.paddingBottom
    return range
  }
  getLastIndex() {
    return this.param.uniqueIds.length - 1
  }
  getIndexOffset(givenIndex) {
    if (!givenIndex) return 0

    let offset = 0
    let indexSize = 0
    for (let index = 0; index < givenIndex; index++) {
      indexSize = this.sizes.get(this.param.uniqueIds[index])
      offset = offset + (typeof indexSize === 'number' ? indexSize : getEstimateSize())
    }

    // remember the last calcute index
    this.lastCalcIndex = Math.max(this.lastCalcIndex, givenIndex - 1)
    this.lastCalcIndex = Math.min(this.lastCalcIndex, this.getLastIndex())

    return offset
  }
  getEstimateSize() {
    return this.param.estimateSize
  }
  handleScroll(offset) {
    this.direction = offset < this.offset ? DIRECTION_TYPE.FRONT : DIRECTION_TYPE.BEHIND
    this.offset = offset

    if (!this.param) return

    if (this.direction === DIRECTION_TYPE.FRONT) {
      this.handleFront()
    } else if (this.direction === DIRECTION_TYPE.BEHIND) {
      this.handleBehind()
    }
  }
  handleFront() {
    const overs = this.getScrollOvers()
    if (overs > this.range.start) return

    const start = Math.max(overs - this.param.buffer, 0)
    this.checkRange(start, this.getEndByStart(start))
  }
  handleBehind() {
    const overs = this.getScrollOvers()
    if (overs < this.range.start + this.param.buffer) {
      return
    }

    this.checkRange(overs, this.getEndByStart(overs))
  }
  getScrollOvers() {
    const offset = this.offset
    let low = 0
    let middle = 0
    let middleOffset = 0
    let high = this.param.uniqueIds.length

    while (low <= high) {
      // this.__bsearchCalls++
      middle = low + Math.floor((high - low) / 2)
      middleOffset = this.getIndexOffset(middle)

      if (middleOffset === offset) {
        return middle
      } else if (middleOffset < offset) {
        low = middle + 1
      } else if (middleOffset > offset) {
        high = middle - 1
      }
    }

    return low > 0 ? --low : 0
  }
  getEndByStart(start) {
    const theoryEnd = start + this.param.keeps - 1
    const truelyEnd = Math.min(theoryEnd, this.getLastIndex())
    return truelyEnd
  }
}