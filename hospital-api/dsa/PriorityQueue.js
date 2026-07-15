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

  remove(id) {
    const index = this.items.findIndex(item => item.id === id)
    if (index !== -1) {
      return this.items.splice(index, 1)[0]
    }
    return null
  }

  peek() {
    return this.items[0]
  }

  values() {
    return this.items
  }
}
