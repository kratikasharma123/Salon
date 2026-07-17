import { getRecordStatusVariant, recordStatusLabels } from '../../utils/salaryMapper'
import Badge from '../ui/Badge'

function SalaryStatusBadge({ status }) {
  return <Badge variant={getRecordStatusVariant(status)}>{recordStatusLabels[status] || 'Unknown'}</Badge>
}

export default SalaryStatusBadge
