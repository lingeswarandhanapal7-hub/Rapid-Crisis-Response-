export default function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full skeleton" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 skeleton rounded-lg w-3/4" />
          <div className="h-2.5 skeleton rounded-lg w-1/2" />
        </div>
        <div className="h-5 w-16 skeleton rounded-full" />
      </div>
      <div className="h-10 skeleton rounded-lg" />
      <div className="grid grid-cols-3 gap-2">
        {[0,1,2].map(i => <div key={i} className="h-10 skeleton rounded-lg" />)}
      </div>
      <div className="flex gap-2">
        <div className="h-6 skeleton rounded-lg w-24" />
        <div className="h-6 skeleton rounded-lg w-24" />
      </div>
    </div>
  )
}
