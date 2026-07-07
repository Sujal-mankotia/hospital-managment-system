export default class PriorityQueue {
  constructor() {
    this.items = []
  }

  enqueue(patient) {
    this.items.push(patient)
    this.items.sort((a, b) => b.priority - a.priority)
  }

  dequeue() {
    return this.items.shift()
  }

  peek() {
    return this.items[0]
  }

  values() {
    return this.items
  }
}
