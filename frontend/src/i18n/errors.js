// =============================================================================
// errors.js — shows server and network error messages in the app language.
// The backend answers in English; each known message is matched here and
// replaced. Unknown messages are shown as they are (in English).
// If you change a message in the backend, update its pattern here.
// =============================================================================

const PATTERNS = [
  [/^Can't reach the server/, 'cantReach'],
  [/^Request failed \((\d+)\)$/, 'requestFailed'],
  [/^An account with this email already exists$/, 'emailTaken'],
  [/^Email and password are required$/, 'emailPasswordRequired'],
  [/^IDs look like PT-ABC234$/, 'idFormat'],
  [/^Invalid email or password$/, 'invalidLogin'],
  [/^Not found$/, 'notFound'],
  [/^Password must be 8–72 characters$/, 'passwordLength'],
  [/^Patient not found$/, 'patientNotFound'],
  [/^Please enter a valid email address$/, 'validEmail'],
  [/^Please enter your name/, 'nameRequired'],
  [/^Please log in$/, 'pleaseLogIn'],
  [/^Your session has expired/, 'sessionExpired'],
  [/^Something went wrong on the server$/, 'serverError'],
  [/^Too many requests/, 'tooManyRequests'],
  [/^Too many login attempts/, 'tooManyLogins'],
  [/^No physiotherapist found with that ID$/, 'noPhysioFound'],
  [/^Only \w+ accounts can do this$/, 'onlyRole'],
  [/^A patient can have at most (\d+) exercises$/, 'maxExercises'],
  [/^This reset link is invalid\. Please request a new one\.$/, 'resetInvalid'],
  [/^This reset link is invalid or has expired/, 'resetExpired'],
  [/^Your password was changed, please log in again$/, 'passwordChanged'],
  [/^Too many password reset requests/, 'tooManyResets'],
  [/^A session needs at least one rep$/, 'needOneRep'],
  [/^Exercise (\d+): invalid$/, 'exInvalid'],
  [/^Exercise (\d+): unknown exercise$/, 'exUnknown'],
  [/^Exercise (\d+): side must be left or right$/, 'exSide'],
  [/^Exercise (\d+): this exercise and side is already in the list$/, 'exDuplicate'],
  [/^Exercise (\d+): (startAngle|targetAngle|permittedMin|permittedMax) must be a number from 0 to 180$/, 'exAngle'],
  [/^Exercise (\d+): the permitted minimum must be lower than the maximum$/, 'exMinMax'],
  [/^Exercise (\d+): the start angle must be inside the permitted range$/, 'exStartRange'],
  [/^Exercise (\d+): the target angle must be inside the permitted range$/, 'exTargetRange'],
  [/^Exercise (\d+): start and target must be at least (\d+)° apart$/, 'exApart'],
  [/^Exercise (\d+): repetitions must be a whole number from 1 to 100$/, 'exReps'],
  [/^Exercise (\d+): please write when the patient should stop/, 'exStop'],
  [/^Exercise (\d+): confirm clinical clearance before assigning$/, 'exClearance'],
]

export function translateError(message, t) {
  if (!message) return message
  for (const [pattern, key] of PATTERNS) {
    const match = message.match(pattern)
    if (!match) continue
    const text = t.err[key]
    if (typeof text !== 'function') return text
    const args = match.slice(1)
    if (key === 'exAngle') args[1] = t.err.fields[args[1]] // field name in the app language
    return text(...args)
  }
  return message
}
