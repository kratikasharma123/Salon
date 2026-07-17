import { attendanceStatusLabels, getAttendanceStatusVariant } from '../../utils/attendanceMapper'
import Badge from '../ui/Badge'

function AttendanceStatusBadge({ status }) {
  return <Badge variant={getAttendanceStatusVariant(status)}>{attendanceStatusLabels[status] || 'Unknown'}</Badge>
}

export default AttendanceStatusBadge
