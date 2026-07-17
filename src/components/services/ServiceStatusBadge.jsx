import Badge from '../ui/Badge'
import { formatServiceStatus, getServiceStatusVariant } from '../../utils/serviceMapper'

function ServiceStatusBadge({ status }) {
  return <Badge variant={getServiceStatusVariant(status)}>{formatServiceStatus(status)}</Badge>
}

export default ServiceStatusBadge
