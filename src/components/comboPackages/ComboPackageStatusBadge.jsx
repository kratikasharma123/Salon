import Badge from '../ui/Badge'
import { formatPackageStatus, getPackageStatusVariant } from '../../utils/comboPackageMapper'

function ComboPackageStatusBadge({ status }) {
  return <Badge variant={getPackageStatusVariant(status)}>{formatPackageStatus(status)}</Badge>
}

export default ComboPackageStatusBadge
