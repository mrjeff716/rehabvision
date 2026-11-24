import { BUSINESS } from './business'

// Shows BUSINESS[name], or a highlighted "[to be completed]" marker if it's still empty
const Field = ({ name, label }) =>
  BUSINESS[name] ?? <span className="placeholder">[{label}]</span>

export default Field
