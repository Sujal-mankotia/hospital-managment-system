const STATUS_PRIORITY = {
  Critical: 4,
  Admitted: 3,
  Stable: 2,
  Discharged: 1,
}

const CONDITION_PRIORITY = {
  emergency: 3,
  trauma: 3,
  cardiac: 3,
  stroke: 3,
  critical: 3,
  severe: 2,
  infection: 2,
  hypertension: 1,
  diabetes: 1,
}

function normalize(value) {
  return String(value || '').trim().toLowerCase()
}

function getPatientId(patient) {
  return patient?.id || patient?._id || ''
}

function getPatientSearchKey(patient) {
  return [
    patient?.name,
    getPatientId(patient),
    patient?.phone,
    patient?.disease,
    patient?.doctor,
    patient?.status,
    patient?.bloodGroup,
    patient?.gender,
    patient?.ward,
    patient?.admitted,
  ].map(normalize).filter(Boolean).join(' ')
}

class PatientSearchNode {
  constructor(patient) {
    this.patient = patient
    this.key = getPatientSearchKey(patient)
    this.left = null
    this.right = null
  }
}

export class PatientSearchTree {
  constructor() {
    this.root = null
  }

  insert(patient) {
    const node = new PatientSearchNode(patient)

    if (!this.root) {
      this.root = node
      return
    }

    let current = this.root
    while (current) {
      if (node.key < current.key) {
        if (!current.left) {
          current.left = node
          return
        }
        current = current.left
      } else {
        if (!current.right) {
          current.right = node
          return
        }
        current = current.right
      }
    }
  }

  search(term) {
    const query = normalize(term)
    const results = []

    if (!query) return results

    const traverse = (node) => {
      if (!node) return
      traverse(node.left)
      if (node.key.includes(query)) results.push(node.patient)
      traverse(node.right)
    }

    traverse(this.root)
    return results
  }
}

export class PatientPriorityHeap {
  constructor() {
    this.heap = []
  }

  insert(patient) {
    this.heap.push(patient)
    this.bubbleUp(this.heap.length - 1)
  }

  extractMax() {
    if (this.heap.length <= 1) return this.heap.pop() || null

    const max = this.heap[0]
    this.heap[0] = this.heap.pop()
    this.sinkDown(0)
    return max
  }

  toSortedArray() {
    const copy = new PatientPriorityHeap()
    this.heap.forEach((patient) => copy.insert(patient))

    const sorted = []
    while (copy.heap.length) sorted.push(copy.extractMax())
    return sorted
  }

  bubbleUp(index) {
    let childIndex = index

    while (childIndex > 0) {
      const parentIndex = Math.floor((childIndex - 1) / 2)
      if (this.getPriority(this.heap[childIndex]) <= this.getPriority(this.heap[parentIndex])) break

      this.swap(childIndex, parentIndex)
      childIndex = parentIndex
    }
  }

  sinkDown(index) {
    let parentIndex = index

    while (true) {
      const leftIndex = parentIndex * 2 + 1
      const rightIndex = parentIndex * 2 + 2
      let largestIndex = parentIndex

      if (
        leftIndex < this.heap.length &&
        this.getPriority(this.heap[leftIndex]) > this.getPriority(this.heap[largestIndex])
      ) {
        largestIndex = leftIndex
      }

      if (
        rightIndex < this.heap.length &&
        this.getPriority(this.heap[rightIndex]) > this.getPriority(this.heap[largestIndex])
      ) {
        largestIndex = rightIndex
      }

      if (largestIndex === parentIndex) return

      this.swap(parentIndex, largestIndex)
      parentIndex = largestIndex
    }
  }

  getPriority(patient) {
    const statusScore = STATUS_PRIORITY[patient?.status] || 0
    const ageScore = Number(patient.age) >= 60 ? 0.5 : 0
    const condition = normalize(patient?.disease)
    const conditionScore = Object.entries(CONDITION_PRIORITY).reduce((score, [keyword, value]) => (
      condition.includes(keyword) ? Math.max(score, value) : score
    ), 0)

    return statusScore + ageScore + conditionScore
  }

  swap(firstIndex, secondIndex) {
    ;[this.heap[firstIndex], this.heap[secondIndex]] = [this.heap[secondIndex], this.heap[firstIndex]]
  }
}

export class PatientHashTable {
  constructor(size = 53) {
    this.buckets = Array.from({ length: size }, () => [])
  }

  set(key, patient) {
    const normalizedKey = normalize(key)
    if (!normalizedKey) return

    const bucket = this.buckets[this.hash(normalizedKey)]
    const existing = bucket.find((entry) => entry.key === normalizedKey)

    if (existing) {
      existing.patient = patient
      return
    }

    bucket.push({ key: normalizedKey, patient })
  }

  get(key) {
    const normalizedKey = normalize(key)
    if (!normalizedKey) return null

    const bucket = this.buckets[this.hash(normalizedKey)]
    const match = bucket.find((entry) => entry.key === normalizedKey)
    return match?.patient || null
  }

  hash(key) {
    return String(key)
      .split('')
      .reduce((total, char) => (total * 31 + char.charCodeAt(0)) % this.buckets.length, 0)
  }
}

export function mergeSortPatients(patients, sortBy) {
  if (patients.length <= 1) return patients

  const middle = Math.floor(patients.length / 2)
  const left = mergeSortPatients(patients.slice(0, middle), sortBy)
  const right = mergeSortPatients(patients.slice(middle), sortBy)

  return mergePatients(left, right, sortBy)
}

function mergePatients(left, right, sortBy) {
  const sorted = []
  let leftIndex = 0
  let rightIndex = 0

  while (leftIndex < left.length && rightIndex < right.length) {
    if (comparePatients(left[leftIndex], right[rightIndex], sortBy) <= 0) {
      sorted.push(left[leftIndex])
      leftIndex += 1
    } else {
      sorted.push(right[rightIndex])
      rightIndex += 1
    }
  }

  return sorted.concat(left.slice(leftIndex), right.slice(rightIndex))
}

function comparePatients(first, second, sortBy) {
  if (sortBy === 'age') return Number(first.age || 0) - Number(second.age || 0)
  if (sortBy === 'id') return String(getPatientId(first)).localeCompare(String(getPatientId(second)))
  if (sortBy === 'status') return (STATUS_PRIORITY[second.status] || 0) - (STATUS_PRIORITY[first.status] || 0)
  if (sortBy === 'admitted') return String(second.admitted || '').localeCompare(String(first.admitted || ''))
  return String(first.name || '').localeCompare(String(second.name || ''))
}

export function buildPatientSearchTree(patients) {
  const tree = new PatientSearchTree()
  patients.forEach((patient) => tree.insert(patient))
  return tree
}

export function buildPatientPriorityHeap(patients) {
  const heap = new PatientPriorityHeap()
  patients.forEach((patient) => heap.insert(patient))
  return heap
}

export function buildPatientIndex(patients) {
  const table = new PatientHashTable()
  patients.forEach((patient) => {
    table.set(getPatientId(patient), patient)
    table.set(patient.phone, patient)
  })
  return table
}
