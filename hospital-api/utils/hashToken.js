import crypto from 'crypto'

export function createResetToken() {
  const plainToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = hashToken(plainToken)

  return { plainToken, hashedToken }
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}
