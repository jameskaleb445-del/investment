interface ProfileHeaderProps {
  name: string
  email: string
  avatarUrl?: string | null
}

export function ProfileHeader({ name, email, avatarUrl }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center py-6">
      {/* Profile Picture */}
      <div className="relative mb-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] flex items-center justify-center text-white text-2xl font-bold">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span>{name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        {/* Edit indicator on profile pic */}
        <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#8b5cf6] border-4 border-[#1a1a1f] flex items-center justify-center">
          <svg 
            className="w-4 h-4 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
            />
          </svg>
        </div>
      </div>

      {/* Name */}
      <h1 className="text-2xl font-bold text-white mb-1">{name}</h1>
      
      {/* Email */}
      <p className="text-[#a0a0a8] text-sm">{email}</p>
    </div>
  )
}

