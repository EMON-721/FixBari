"use client";

import { useState } from "react";
import { X, User, Star, Briefcase, Loader2, Search } from "lucide-react";
import { useAvailableTechnicians, useAssignTechnician } from "@/hooks/use-orders";
import type { OrderListItem } from "@/lib/api";

interface AssignTechnicianModalProps {
  booking: OrderListItem;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssignTechnicianModal({ booking, onClose, onSuccess }: AssignTechnicianModalProps) {
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: technicians, isLoading: techniciansLoading } = useAvailableTechnicians();
  const assignMutation = useAssignTechnician();

  const filteredTechnicians = technicians?.filter((tech) =>
    tech.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleAssign = async () => {
    if (!selectedTechnicianId) return;

    try {
      await assignMutation.mutateAsync({
        orderId: booking.id,
        technicianId: selectedTechnicianId,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to assign technician:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Assign Technician</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Booking: <span className="font-mono">{booking.bookingId}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Booking Info */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Service:</span>
                <p className="font-medium text-gray-900">{booking.serviceName}</p>
              </div>
              <div>
                <span className="text-gray-500">Customer:</span>
                <p className="font-medium text-gray-900">{booking.userName}</p>
              </div>
              <div>
                <span className="text-gray-500">Date:</span>
                <p className="font-medium text-gray-900">
                  {new Date(booking.scheduledDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Time:</span>
                <p className="font-medium text-gray-900">{booking.scheduledTime}</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search technicians..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Technicians List */}
          <div className="max-h-[300px] overflow-y-auto p-4">
            {techniciansLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : filteredTechnicians.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? "No technicians found" : "No available technicians"}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTechnicians.map((technician) => (
                  <button
                    key={technician.id}
                    onClick={() => setSelectedTechnicianId(technician.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      selectedTechnicianId === technician.id
                        ? "border-primary bg-primary/5"
                        : "border-gray-100 hover:border-gray-200 bg-white"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      {technician.avatar ? (
                        <img
                          src={technician.avatar}
                          alt={technician.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900">{technician.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          {technician.rating.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {technician.completedJobs} jobs
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedTechnicianId === technician.id
                          ? "border-primary bg-primary"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedTechnicianId === technician.id && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedTechnicianId || assignMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assignMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Assign Technician
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
