import { formatEmployeeStatus, getEmployeeStatusVariant } from '../../utils/employeeMapper'
import Badge from '../ui/Badge'

function EmployeeStatusBadge({ status }) {
  return <Badge variant={getEmployeeStatusVariant(status)}>{formatEmployeeStatus(status)}</Badge>
}

export default EmployeeStatusBadge
