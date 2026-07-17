import { CheckCircle2, Edit3, Eye, Trash2, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatLeaveDate, formatLeaveDays, leaveTypeLabels } from '../../utils/leaveMapper'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import LeaveStatusBadge from './LeaveStatusBadge'

function LeaveTable({ requests = [], onApprove, onReject, onCancel, onDelete, onEdit, getRequestPath = null }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-beige bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[62rem] text-left text-sm">
          <thead className="bg-ivory text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
            <tr><th className="px-5 py-4">Employee</th><th className="px-5 py-4">Leave Type</th><th className="px-5 py-4">Dates</th><th className="px-5 py-4">Days</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-beige">
            {requests.map((request) => {
              const requestPath = getRequestPath?.(request)
              return (
                <tr key={request.id} className="align-top transition hover:bg-ivory/70">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar src={request.profile_photo_url} name={request.employee_name} size="md" /><div>{requestPath ? <Link to={requestPath} className="font-semibold text-charcoal transition hover:text-terracotta">{request.employee_name || 'Employee'}</Link> : <span className="font-semibold text-charcoal">{request.employee_name || 'Employee'}</span>}<p className="mt-1 text-xs font-semibold text-brown">{request.employee_code || request.employee_id}</p></div></div></td>
                  <td className="px-5 py-4"><Badge variant="info">{leaveTypeLabels[request.leave_type] || 'Leave'}</Badge></td>
                  <td className="px-5 py-4 text-stone-600">{formatLeaveDate(request.start_date)} – {formatLeaveDate(request.end_date)}</td>
                  <td className="px-5 py-4 font-semibold text-charcoal">{formatLeaveDays(request.total_days)}</td>
                  <td className="px-5 py-4"><LeaveStatusBadge status={request.status} /></td>
                  <td className="px-5 py-4"><div className="flex justify-end gap-2" aria-label={`Actions for ${request.employee_name || 'leave request'}`}>{requestPath ? <Link to={requestPath} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown" title="View leave"><Eye className="h-4 w-4" /></Link> : null}{onEdit ? <button type="button" onClick={() => onEdit(request)} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown" title="Edit leave"><Edit3 className="h-4 w-4" /></button> : null}{request.status === 'pending' ? <button type="button" onClick={() => onApprove(request)} className="rounded-xl p-2 text-emerald-700 transition hover:bg-emerald-50" title="Approve leave"><CheckCircle2 className="h-4 w-4" /></button> : null}{request.status === 'pending' ? <button type="button" onClick={() => onReject(request)} className="rounded-xl p-2 text-rose-muted transition hover:bg-rose-muted/10" title="Reject leave"><XCircle className="h-4 w-4" /></button> : null}{request.status !== 'cancelled' ? <button type="button" onClick={() => onCancel(request)} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown" title="Cancel leave"><XCircle className="h-4 w-4" /></button> : null}<button type="button" onClick={() => onDelete(request)} className="rounded-xl p-2 text-rose-muted transition hover:bg-rose-muted/10" title="Delete leave"><Trash2 className="h-4 w-4" /></button></div></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LeaveTable
