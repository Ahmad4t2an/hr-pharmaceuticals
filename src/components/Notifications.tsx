import React from "react";
import { NotificationItem } from "../types";
import { 
  Bell, 
  AlertTriangle, 
  ShoppingBag, 
  CheckCircle, 
  Clock, 
  Trash2,
  BellRing
} from "lucide-react";

interface NotificationsProps {
  notifications: NotificationItem[];
  onMarkAllAsRead: () => Promise<any>;
}

export default function Notifications({
  notifications,
  onMarkAllAsRead
}: NotificationsProps) {
  
  const [markedFeedback, setMarkedFeedback] = React.useState(false);

  const handleMarkAll = async () => {
    await onMarkAllAsRead();
    setMarkedFeedback(true);
    setTimeout(() => setMarkedFeedback(false), 2000);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case "low_stock":
        return <AlertTriangle className="text-amber-400 flex-shrink-0" size={16} />;
      case "out_of_stock":
        return <AlertTriangle className="text-rose-400 flex-shrink-0 animate-pulse" size={16} />;
      case "purchase":
        return <ShoppingBag className="text-indigo-400 flex-shrink-0" size={16} />;
      case "new_order":
        return <CheckCircle className="text-emerald-400 flex-shrink-0" size={16} />;
      default:
        return <Bell className="text-zinc-400 flex-shrink-0" size={16} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-sans font-bold tracking-tight text-white flex items-center gap-2">
            Operational Notification Center
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400">
                {unreadCount} UNREAD STATUS UPDATES
              </span>
            )}
          </h2>
          <p className="text-xs text-zinc-400 font-sans">
            Continuous background audit alerts of critical stock depletions, cashier sales events, and PO contract creations.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-sans text-xs px-3.5 py-2 rounded-xl transition-all font-semibold"
          >
            <BellRing size={13} /> Clear status notices
          </button>
        )}
      </div>

      {markedFeedback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-lg font-sans">
          All notifications marked as read!
        </div>
      )}

      {/* Main notifications log card */}
      <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="divide-y divide-zinc-900/60 font-sans text-xs">
          {notifications.map((n) => (
            <div 
              key={n.id} 
              className={`p-4 flex gap-4 items-start ${n.read ? "bg-zinc-950/40 text-zinc-400" : "bg-zinc-900/15 text-zinc-100"}`}
            >
              <span className="p-2 bg-zinc-90 w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-850">
                {getIcon(n.type)}
              </span>

              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-baseline gap-2">
                  <p className={`font-bold ${n.read ? "text-zinc-300" : "text-white"}`}>{n.title}</p>
                  
                  {/* Timestamp */}
                  <span className="text-[10px] text-zinc-550 font-mono flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(n.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
                <p className="text-zinc-400 leading-relaxed text-[11px]">{n.message}</p>
                {!n.read && (
                  <span className="inline-block mt-1 w-2 h-2 rounded-full bg-indigo-500" title="Unread Update" />
                )}
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="p-12 text-center text-zinc-500 font-mono text-xs space-y-2">
              <Bell className="mx-auto text-zinc-700" size={24} />
              <p>Status Ledger Empty</p>
              <p className="text-[10px] text-zinc-600 font-sans">No security or replenishment warnings have triggered yet today.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
