import { Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  const [focused, setFocused] = useState(false)

  return (
    <motion.div
      animate={{ scale: focused ? 1.01 : 1 }}
      className="relative"
    >
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
      <input
        type="text"
        aria-label="Search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full bg-[#1A1A1A] rounded-xl h-10 pl-10 pr-10 text-sm text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/10 focus:outline-none transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
        >
          ×
        </button>
      )}
    </motion.div>
  )
}

export function FilterBar({ onFilter }: { onFilter: (filter: string) => void }) {
  const filters = ['All', 'Unread', 'Starred', 'Groups']
  const [active, setActive] = useState('All')

  return (
    <div className="flex gap-2 px-4 py-2 overflow-x-auto">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => {
            setActive(f)
            onFilter(f.toLowerCase())
          }}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            active === f
              ? 'bg-white text-black'
              : 'bg-[#1A1A1A] text-white/40 hover:text-white/60'
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  )
}
