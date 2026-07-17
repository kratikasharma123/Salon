import { commissionTypeLabels, formatCommission, getRecordStatusVariant, recordStatusLabels } from '../../utils/commissionMapper'
import Badge from '../ui/Badge'

function CommissionBadge({ record, status, type }) {
  if (record) return <Badge variant={record.commission_type === 'percentage' ? 'brand' : 'info'}>{formatCommission(record)}</Badge>
  if (type) return <Badge variant={type === 'percentage' ? 'brand' : 'info'}>{commissionTypeLabels[type] || 'Commission'}</Badge>
  return <Badge variant={getRecordStatusVariant(status)}>{recordStatusLabels[status] || 'Unknown'}</Badge>
}

export default CommissionBadge
