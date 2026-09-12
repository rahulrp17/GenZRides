import React, { useMemo, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import Modal from './Modal';

/**
 * Shared driver-assignment picker.
 * Backend only accepts drivers that are Approved AND online, so offline
 * drivers are shown disabled with a reason instead of failing on tap
 * (which made the Approve button look broken).
 * When `requiredVehicleType` is set (booking's cab type), only drivers
 * whose registered vehicle matches are listed — cross-type assignment is
 * also rejected by the backend.
 */
const AssignDriverDialog = ({ open, onClose, drivers = [], isPending, pendingDriverId, onSelect, requiredVehicleType = null }) => {
  const [search, setSearch] = useState('');

  const requiredId = requiredVehicleType?._id || requiredVehicleType || null;
  const requiredName = requiredVehicleType?.name || null;
  const eligibleDrivers = useMemo(() => {
    if (!requiredId) return drivers;
    return drivers.filter((d) => {
      const typeId = d.vehicleType?._id || d.vehicleType;
      return typeId && typeId.toString() === requiredId.toString();
    });
  }, [drivers, requiredId]);

  const { online, list } = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? eligibleDrivers.filter((d) =>
          `${d.user?.name || ''} ${d.vehicleBrand || ''} ${d.vehicleModel || ''} ${d.vehicleNumber || ''}`
            .toLowerCase()
            .includes(q)
        )
      : [...eligibleDrivers];
    // Online drivers first so the working choices are on top.
    filtered.sort((a, b) => Number(b.isOnline || false) - Number(a.isOnline || false));
    return { online: eligibleDrivers.filter((d) => d.isOnline).length, list: filtered };
  }, [eligibleDrivers, search]);

  const close = () => {
    setSearch('');
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={close} title="Assign Driver" maxWidth="max-w-md">
      <div className="space-y-3">
        <p className="text-xs text-gray-400">
          <span className="font-semibold text-emerald-300">{online} online</span> · only online drivers can be assigned{requiredName ? ` · only ${requiredName} drivers shown` : ''}
        </p>
        {eligibleDrivers.length > 3 && (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <Search size={15} className="text-gray-500 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, vehicle…"
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-gray-500 min-w-0"
            />
          </div>
        )}
        {eligibleDrivers.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">{requiredName ? `No ${requiredName} drivers available` : 'No approved drivers available'}</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No drivers match “{search}”</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
            {list.map((driver) => {
              const enabled = !!driver.isOnline;
              const busy = isPending && pendingDriverId === driver._id;
              return (
                <button
                  key={driver._id}
                  onClick={() => enabled && onSelect(driver._id)}
                  disabled={!enabled || isPending}
                  title={enabled ? `Assign ${driver.user?.name || 'driver'}` : 'Offline — cannot assign'}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition min-w-0 ${
                    enabled
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-emerald-400/40 active:scale-[0.99]'
                      : 'bg-white/[0.02] border-white/5 opacity-55 cursor-not-allowed'
                  } disabled:cursor-wait`}
                >
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    enabled ? 'bg-green-500/20 border-green-500/30' : 'bg-white/5 border-white/10'
                  }`}>
                    <span className={`font-semibold text-sm ${enabled ? 'text-green-400' : 'text-gray-500'}`}>
                      {driver.user?.name?.charAt(0)?.toUpperCase() || 'D'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{driver.user?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {[driver.vehicleBrand, driver.vehicleModel].filter(Boolean).join(' ') || driver.vehicleType?.name || 'N/A'}
                      {driver.vehicleNumber ? ` · ${driver.vehicleNumber}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {busy ? (
                      <Loader2 size={15} className="animate-spin text-emerald-400" />
                    ) : (
                      <>
                        <span className={`w-2 h-2 rounded-full ${enabled ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                        <span className="text-[11px] text-gray-500">{enabled ? 'Online' : 'Offline'}</span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AssignDriverDialog;
