import { getLeaveStatusVariant, leaveStatusLabels } from '../../utils/leaveMapper'
import Badge from '../ui/Badge'

function LeaveStatusBadge({ status }) {
  return <Badge variant={getLeaveStatusVariant(status)}>{leaveStatusLabels[status] || 'Unknown'}</Badge>
}

export default LeaveStatusBadge
