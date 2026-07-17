import Badge from '../ui/Badge'
import { formatBranchStatus, getBranchStatusVariant } from '../../utils/branchMappers'

function BranchStatusBadge({ status }) {
  return <Badge variant={getBranchStatusVariant(status)}>{formatBranchStatus(status)}</Badge>
}

export default BranchStatusBadge
