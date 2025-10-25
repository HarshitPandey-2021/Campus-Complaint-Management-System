import { useNavigate } from 'react-router-dom';
import { RiDashboardLine } from 'react-icons/ri';

export default function UniversityLogo({ universityName }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/')}
      className="flex items-center gap-3 group hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-white/30 rounded-lg px-2 py-1"
    >
      {/* Icon + Text */}
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
        <RiDashboardLine className="h-6 w-6 text-white" />
        <div className="text-left hidden sm:block">
          <p className="text-sm font-bold text-white leading-tight">
            {universityName}
          </p>
          <p className="text-xs text-indigo-200">
            CCMS Admin
          </p>
        </div>
      </div>
    </button>
  );
}