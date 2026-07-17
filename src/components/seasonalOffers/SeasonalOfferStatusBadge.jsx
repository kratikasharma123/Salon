import Badge from '../ui/Badge'
import { formatOfferStatus, getOfferStatusVariant } from '../../utils/seasonalOfferMapper'

function SeasonalOfferStatusBadge({ status }) {
  return <Badge variant={getOfferStatusVariant(status)}>{formatOfferStatus(status)}</Badge>
}

export default SeasonalOfferStatusBadge
