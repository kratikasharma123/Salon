import Badge from '../ui/Badge'
import { formatCategoryStatus, getCategoryStatusVariant } from '../../utils/categoryMapper'

function CategoryStatusBadge({ status }) {
  return <Badge variant={getCategoryStatusVariant(status)}>{formatCategoryStatus(status)}</Badge>
}

export default CategoryStatusBadge
