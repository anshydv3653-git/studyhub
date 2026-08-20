import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './hooks/useTheme'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import SubjectPage from './pages/SubjectPage'
import ChapterPage from './pages/ChapterPage'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/subject/:subjectId" element={<SubjectPage />} />
              <Route path="/chapter/:chapterId" element={<ChapterPage />} />
            </Routes>
          </main>
          {/* Footer */}
          <footer className="border-t border-gray-200 dark:border-gray-800 mt-12 py-6 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              StudyHub — Built for Class 10 exam prep 🎓
            </p>
          </footer>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
