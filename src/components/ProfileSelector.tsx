import { useProfile } from '../context/ProfileContext';
import { useNavigate } from 'react-router-dom';

export default function ProfileSelector() {
  const { profiles, currentProfile, switchProfile } = useProfile();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      {profiles.map((p) => (
        <button
          key={p.id}
          onClick={() => switchProfile(p.id)}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            currentProfile?.id === p.id
              ? 'bg-ua-oasis text-white'
              : 'bg-ua-blue-lighter text-gray-300 hover:bg-ua-blue-light'
          }`}
        >
          {p.name}
        </button>
      ))}
      <button
        onClick={() => navigate('/onboarding')}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-ua-blue-lighter text-gray-400 transition-colors hover:bg-ua-red hover:text-white"
        title="Add Student"
      >
        +
      </button>
    </div>
  );
}
