let billSequence = 0

export function buildBillNumber() {
  const year = new Date().getFullYear()
  const timestamp = Date.now().toString()
  billSequence = (billSequence + 1) % 1000

  return `BILL-${year}-${timestamp}-${String(billSequence).padStart(3, '0')}`
}
