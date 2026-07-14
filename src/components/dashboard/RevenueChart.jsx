import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCompactCurrency(value) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${Math.round(value / 1000)}k`
  return `₹${value}`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-2xl border border-beige bg-white px-4 py-3 shadow-soft">
      <p className="text-sm font-semibold text-charcoal">{label}</p>
      <p className="mt-1 text-sm text-stone-500">Revenue: {formatCurrency(payload[0].value)}</p>
    </div>
  )
}

function RevenueChart({ data }) {
  const first = data[0]
  const last = data[data.length - 1]

  return (
    <section className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft sm:p-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-terracotta">Weekly Revenue</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-charcoal">Revenue overview</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            A placeholder weekly trend ready for future Supabase revenue data.
          </p>
        </div>
        <div className="rounded-2xl border border-beige bg-ivory px-4 py-3 text-sm font-semibold text-brown">
          {formatCurrency(last.revenue)} this week
        </div>
      </div>

      <div className="h-72 w-full" role="img" aria-label="Weekly revenue area chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b8664b" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#b8664b" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e9dccb" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#78716c', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#78716c', fontSize: 12 }}
              tickFormatter={formatCompactCurrency}
              width={54}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#b8664b', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#b8664b"
              strokeWidth={2}
              fill="url(#revenueFill)"
              activeDot={{ r: 5, stroke: '#fbf6ee', strokeWidth: 2, fill: '#b8664b' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-4 text-sm leading-6 text-stone-500">
        Revenue moved from {formatCurrency(first.revenue)} on {first.day} to {formatCurrency(last.revenue)} on {last.day}.
      </p>

      <table className="sr-only">
        <caption>Weekly revenue values</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.day}>
              <td>{item.day}</td>
              <td>{formatCurrency(item.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default RevenueChart
