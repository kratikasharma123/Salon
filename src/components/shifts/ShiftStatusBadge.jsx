import { formatShiftStatus, getShiftStatusVariant } from '../../utils/shiftMapper'
import Badge from '../ui/Badge'

function ShiftStatusBadge({ status }) {
  return <Badge variant={getShiftStatusVariant(status)}>{formatShiftStatus(status)}</Badge>
}

export default ShiftStatusBadge
