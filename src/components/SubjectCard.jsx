import { useTheme } from '../hooks/useTheme'

const subjectIcons = {
  'mathematics': '📐',
  'maths': '📐',
  'math': '📐',
  'science': '🔬',
  'english': '📖',
  'hindi': '📝',
  'social science': '🌍',
  'social studies': '🌍',
  'sst': '🌍',
  'physics': '⚛️',
  'chemistry': '🧪',
  'biology': '🧬',
  'computer': '💻',
  'sanskrit': '📜',
  'history': '🏛️',
  'geography': '🗺️',
  'civics': '⚖️',
  'economics': '📊',
}

const subjectColors = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-violet-600',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-blue-500',
  'from-amber-500 to-orange-500',
  'from-lime-500 to-green-600',
]

export function getSubjectIcon(name) {
  const lower = name?.toLowerCase() || ''
  for (const [key, icon] of Object.entries(subjectIcons)) {
    if (lower.includes(key)) return icon
  }
  return '📘'
}

export function getSubjectColor(index) {
  return subjectColors[index % subjectColors.length]
}

export default function SubjectCard({ subject, index }) {
  const gradient = getSubjectColor(index)
  const icon = getSubjectIcon(subject.name)

  return (
    <a
      href={`/subject/${subject.id}`}
      className="group block rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className={`bg-gradient-to-br ${gradient} p-6 h-36 flex items-center justify-center`}>
        <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-center group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {subject.name}
        </h3>
      </div>
    </a>
  )
}
