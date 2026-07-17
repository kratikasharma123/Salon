import Badge from '../ui/Badge'

function EmployeeRoleBadge({ role }) {
  return <Badge variant="info">{role || 'Role not assigned'}</Badge>
}

export default EmployeeRoleBadge
