import React, { useEffect, useRef } from "react";
import { RiMoreLine, RiEyeLine, RiEditLine, RiCloseFill } from "react-icons/ri";

export default function ActionsDropdown({
  complaintId,
  openDropdownId,
  setOpenDropdownId,
  onRowClick,
  onActionClick,
}) {
  const ref = useRef(null);
  const isOpen = openDropdownId === complaintId;

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setOpenDropdownId]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() =>
          setOpenDropdownId((prev) => (prev === complaintId ? null : complaintId))
        }
        className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"
      >
        <RiMoreLine size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
          <ul className="text-sm text-gray-700 dark:text-gray-200">
            <li>
              <button
                onClick={() => {
                  onRowClick?.(complaintId);
                  setOpenDropdownId(null);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <RiEyeLine /> View Details
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  onActionClick?.(complaintId, "edit");
                  setOpenDropdownId(null);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <RiEditLine /> Edit
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  onActionClick?.(complaintId, "reject");
                  setOpenDropdownId(null);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
              >
                <RiCloseFill /> Reject
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
