import { useState, useEffect, useRef } from 'react'
import './App.css'
import { playCompletionSound, playAchievementSound, playLevelUpSound } from './sounds'

interface Todo {
  id: string;
  value: string;
  isCompleted: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all')
  const [isAddingTodo, setIsAddingTodo] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [points, setPoints] = useState(0)
  const [level, setLevel] = useState(1)
  const [showReward, setShowReward] = useState(false)
  const [rewardMessage, setRewardMessage] = useState('')
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first-todo',
      title: 'First Step',
      description: 'Complete your first todo',
      icon: '🏆',
      unlocked: false
    },
    {
      id: 'five-todos',
      title: 'Getting Things Done',
      description: 'Complete 5 todos',
      icon: '⭐',
      unlocked: false,
      progress: 0,
      target: 5
    },
    {
      id: 'ten-todos',
      title: 'Productivity Master',
      description: 'Complete 10 todos',
      icon: '🌟',
      unlocked: false,
      progress: 0,
      target: 10
    },
    {
      id: 'streak-three',
      title: 'On a Roll',
      description: 'Complete 3 todos in a row',
      icon: '🔥',
      unlocked: false,
      progress: 0,
      target: 3
    }
  ])
  const [showAchievementModal, setShowAchievementModal] = useState(false)
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)
  const [streak, setStreak] = useState(0)
  const [lastCompletionDate, setLastCompletionDate] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Load todos from localStorage on component mount
  useEffect(() => {
    const loadTodos = () => {
      try {
        setLoading(true)
        const savedTodos = localStorage.getItem('todos')
        
        if (savedTodos) {
          setTodos(JSON.parse(savedTodos))
        }
        
        // Load points, level, streak, and achievements from localStorage
        const savedPoints = localStorage.getItem('points')
        if (savedPoints) setPoints(Number(savedPoints))
        
        const savedLevel = localStorage.getItem('level')
        if (savedLevel) setLevel(Number(savedLevel))
        
        const savedStreak = localStorage.getItem('streak')
        if (savedStreak) setStreak(Number(savedStreak))
        
        const savedAchievements = localStorage.getItem('achievements')
        if (savedAchievements) setAchievements(JSON.parse(savedAchievements))
        
        const savedLastCompletionDate = localStorage.getItem('lastCompletionDate')
        if (savedLastCompletionDate) setLastCompletionDate(savedLastCompletionDate)
        
        setError('')
      } catch (err) {
        setError('加载任务失败。请重试。')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    loadTodos()
  }, [])

  // Add a new todo
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newTodo.trim()) return
    
    try {
      setLoading(true)
      setIsAddingTodo(true)
      
      // Create a new todo with a unique ID
      const newTodoItem: Todo = {
        id: Date.now().toString(),
        value: newTodo,
        isCompleted: false
      }
      
      // Update state
      const updatedTodos = [...todos, newTodoItem]
      setTodos(updatedTodos)
      setNewTodo('')
      setError('')
      
      // Save to localStorage
      localStorage.setItem('todos', JSON.stringify(updatedTodos))
      
      // Focus back on input after adding
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } catch (err) {
      setError('添加任务失败。请重试。')
      console.error(err)
    } finally {
      setLoading(false)
      setIsAddingTodo(false)
    }
  }

  // Check and update achievements
  const checkAchievements = (completedCount: number, currentStreak: number) => {
    let updatedAchievements = [...achievements];
    let newUnlockedAchievement: Achievement | null = null;
    
    // Check first todo achievement
    if (completedCount === 1 && !updatedAchievements.find(a => a.id === 'first-todo')?.unlocked) {
      updatedAchievements = updatedAchievements.map(a => 
        a.id === 'first-todo' ? {...a, unlocked: true} : a
      );
      newUnlockedAchievement = updatedAchievements.find(a => a.id === 'first-todo') || null;
    }
    
    // Update progress for 5 todos achievement
    const fiveTodosAchievement = updatedAchievements.find(a => a.id === 'five-todos');
    if (fiveTodosAchievement && !fiveTodosAchievement.unlocked) {
      const updatedProgress = Math.min(completedCount, fiveTodosAchievement.target || 5);
      
      if (updatedProgress === fiveTodosAchievement.target) {
        updatedAchievements = updatedAchievements.map(a => 
          a.id === 'five-todos' ? {...a, progress: updatedProgress, unlocked: true} : a
        );
        newUnlockedAchievement = updatedAchievements.find(a => a.id === 'five-todos') || null;
      } else {
        updatedAchievements = updatedAchievements.map(a => 
          a.id === 'five-todos' ? {...a, progress: updatedProgress} : a
        );
      }
    }
    
    // Update progress for 10 todos achievement
    const tenTodosAchievement = updatedAchievements.find(a => a.id === 'ten-todos');
    if (tenTodosAchievement && !tenTodosAchievement.unlocked) {
      const updatedProgress = Math.min(completedCount, tenTodosAchievement.target || 10);
      
      if (updatedProgress === tenTodosAchievement.target) {
        updatedAchievements = updatedAchievements.map(a => 
          a.id === 'ten-todos' ? {...a, progress: updatedProgress, unlocked: true} : a
        );
        newUnlockedAchievement = updatedAchievements.find(a => a.id === 'ten-todos') || null;
      } else {
        updatedAchievements = updatedAchievements.map(a => 
          a.id === 'ten-todos' ? {...a, progress: updatedProgress} : a
        );
      }
    }
    
    // Update streak achievement
    const streakAchievement = updatedAchievements.find(a => a.id === 'streak-three');
    if (streakAchievement && !streakAchievement.unlocked) {
      if (currentStreak === streakAchievement.target) {
        updatedAchievements = updatedAchievements.map(a => 
          a.id === 'streak-three' ? {...a, progress: currentStreak, unlocked: true} : a
        );
        newUnlockedAchievement = updatedAchievements.find(a => a.id === 'streak-three') || null;
      } else {
        updatedAchievements = updatedAchievements.map(a => 
          a.id === 'streak-three' ? {...a, progress: currentStreak} : a
        );
      }
    }
    
    setAchievements(updatedAchievements);
    localStorage.setItem('achievements', JSON.stringify(updatedAchievements));
    
    // Show achievement notification if a new one was unlocked
    if (newUnlockedAchievement) {
      setNewAchievement(newUnlockedAchievement);
      setShowAchievementModal(true);
      // Play achievement sound
      playAchievementSound();
      setTimeout(() => {
        setShowAchievementModal(false);
        setNewAchievement(null);
      }, 5000);
    }
  };
  
  // Calculate level based on points
  const calculateLevel = (points: number) => {
    return Math.floor(points / 100) + 1;
  };

  // Toggle todo completion status
  const toggleTodo = async (id: string) => {
    try {
      setLoading(true)
      
      // Find the todo to update
      const todoToUpdate = todos.find(todo => todo.id === id)
      if (!todoToUpdate) {
        throw new Error('任务不存在')
      }
      
      // Create updated todo
      const updatedTodo = { ...todoToUpdate, isCompleted: !todoToUpdate.isCompleted }
      
      // Check if this todo is being completed
      const isCompleting = !todoToUpdate.isCompleted && updatedTodo.isCompleted
      
      if (isCompleting) {
        // Play completion sound
        playCompletionSound();
        
        // Show confetti animation when completing a todo
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
        
        // Award points for completing a todo
        const newPoints = points + 10;
        setPoints(newPoints);
        localStorage.setItem('points', newPoints.toString());
        
        // Update level if needed
        const newLevel = calculateLevel(newPoints);
        if (newLevel > level) {
          // Play level up sound
          playLevelUpSound();
          
          setLevel(newLevel);
          localStorage.setItem('level', newLevel.toString());
          
          setRewardMessage(`恭喜！您已经达到等级 ${newLevel}!`);
          setShowReward(true);
          setTimeout(() => setShowReward(false), 3000);
        }
        
        // Update streak
        const today = new Date().toDateString();
        let newStreak = streak;
        
        if (lastCompletionDate !== today) {
          newStreak = streak + 1;
          setStreak(newStreak);
          setLastCompletionDate(today);
          localStorage.setItem('streak', newStreak.toString());
          localStorage.setItem('lastCompletionDate', today);
        }
        
        // Check achievements
        const completedCount = todos.filter(t => t.isCompleted).length + 1; // +1 for the current one being completed
        checkAchievements(completedCount, newStreak);
      } else if (todoToUpdate.isCompleted && !updatedTodo.isCompleted) {
        // If a todo is being uncompleted
        // Reduce points (but not below 0)
        const newPoints = Math.max(0, points - 10);
        setPoints(newPoints);
        localStorage.setItem('points', newPoints.toString());
      }
      
      // Update todos state
      const updatedTodos = todos.map(todo => todo.id === id ? updatedTodo : todo);
      setTodos(updatedTodos);
      localStorage.setItem('todos', JSON.stringify(updatedTodos));
      
      setError('')
    } catch (err) {
      setError('更新任务失败。请重试。')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Delete a todo
  const deleteTodo = async (id: string) => {
    try {
      setLoading(true)
      
      // Filter out the todo to delete
      const updatedTodos = todos.filter(todo => todo.id !== id)
      
      // Update state
      setTodos(updatedTodos)
      
      // Save to localStorage
      localStorage.setItem('todos', JSON.stringify(updatedTodos))
      
      setError('')
    } catch (err) {
      setError('删除任务失败。请重试。')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Get filtered todos based on current filter
  const filteredTodos = todos.filter(todo => {
    if (filterStatus === 'active') return !todo.isCompleted
    if (filterStatus === 'completed') return todo.isCompleted
    return true // 'all'
  })

  // We now load todos in the initial useEffect at the top of the component

  // Confetti animation component
  const Confetti = () => {
    if (!showConfetti) return null
    
    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {Array.from({ length: 100 }).map((_, i) => {
          const size = Math.random() * 10 + 5
          const left = Math.random() * 100
          const animationDuration = Math.random() * 3 + 2
          const delay = Math.random() * 0.5
          
          return (
            <div 
              key={i}
              className="absolute top-0 rounded-sm animate-confetti"
              style={{
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
                animation: `confetti ${animationDuration}s ease-in-out ${delay}s forwards`,
              }}
            />
          )
        })}
      </div>
    )
  }

  // Achievement notification component
  const AchievementNotification = () => {
    if (!showAchievementModal || !newAchievement) return null;
    
    return (
      <div className="fixed top-4 right-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-4 rounded-lg shadow-lg z-50 animate-slide-down">
        <div className="flex items-center">
          <div className="text-4xl mr-3">{newAchievement.icon}</div>
          <div>
            <h3 className="font-bold text-lg">解锁成就！</h3>
            <p className="font-semibold">{newAchievement.title}</p>
            <p className="text-sm">{newAchievement.description}</p>
          </div>
        </div>
      </div>
    );
  };
  
  // Level up notification
  const LevelUpNotification = () => {
    if (!showReward) return null;
    
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg shadow-lg z-50 animate-bounce">
        <div className="flex items-center">
          <div className="text-4xl mr-3">🎉</div>
          <div>
            <h3 className="font-bold text-lg">等级提升！</h3>
            <p>{rewardMessage}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-white flex flex-col">
      {/* Confetti Effect */}
      <Confetti />
      
      {/* Achievement Notification */}
      <AchievementNotification />
      
      {/* Level Up Notification */}
      <LevelUpNotification />
      
      {/* Header */}
      <header className="bg-white shadow-md animate-slide-down">
        <div className="container mx-auto px-4 py-6">
          {/* Main Header */}
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-indigo-600">我的待办事项</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">高效管理您的任务</p>
            
            {/* User Stats - Centered Responsive Layout */}
            <div className="flex flex-wrap justify-center gap-3 mt-6 max-w-2xl mx-auto">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 px-4 py-3 rounded-xl shadow-sm border border-indigo-100 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 bg-opacity-10 flex items-center justify-center mr-3">
                    <span className="text-xl text-indigo-600">⭐</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">积分</p>
                    <p className="font-bold text-indigo-700 text-lg">{points}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 px-4 py-3 rounded-xl shadow-sm border border-purple-100 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-purple-500 bg-opacity-10 flex items-center justify-center mr-3">
                    <span className="text-xl text-purple-600">🏆</span>
                  </div>
                  <div className="w-24 sm:w-32">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">等级</p>
                      <p className="font-bold text-purple-700 text-lg">{level}</p>
                    </div>
                    {/* Level progress bar */}
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500" 
                        style={{ width: `${(points % 100) / 100 * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{points % 100}/100 距离等级 {level + 1}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 px-4 py-3 rounded-xl shadow-sm border border-red-100 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-red-500 bg-opacity-10 flex items-center justify-center mr-3">
                    <span className="text-xl text-red-600">🔥</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">连续</p>
                    <p className="font-bold text-red-700 text-lg">{streak}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Blobs - Only visible on larger screens */}
          <div className="hidden md:block mt-4">
            <div className="relative w-full max-w-4xl h-24 opacity-75 mx-auto overflow-hidden">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
              <div className="absolute top-0 right-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-32 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-grow animate-fade-in">
        <div className="max-w-4xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded animate-shake">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Add Todo Form */}
          <div className="card mb-8 animate-slide-up">
            <div className="card-header">
              <h2 className="card-title">添加新任务</h2>
              <p className="card-description">今天您需要完成什么？</p>
            </div>
            <div className="card-content">
              <form onSubmit={addTodo} className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="需要完成什么？"
                  className="input flex-1 text-sm md:text-base"
                  disabled={loading}
                />
                <button
                  type="submit"
                  className={`btn btn-primary btn-md text-sm md:text-base ${isAddingTodo ? 'animate-pulse' : ''}`}
                  disabled={loading || !newTodo.trim()}
                >
                  {isAddingTodo ? '添加中...' : '添加任务'}
                </button>
              </form>
            </div>
          </div>
            
          {/* Achievements Section */}
          <div className="card mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="card-header">
              <h2 className="card-title">成就</h2>
              <p className="card-description">完成任务解锁成就并获得奖励</p>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-3 md:p-4 rounded-lg border ${achievement.unlocked ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'} transition-all duration-300 hover:shadow-md`}
                  >
                    <div className="flex items-center">
                      <div className={`text-2xl md:text-3xl mr-2 md:mr-3 ${!achievement.unlocked && 'opacity-50'}`}>{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-base md:text-lg flex flex-wrap items-center">
                          <span className="mr-1">{achievement.title}</span>
                          {achievement.unlocked && (
                            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">已解锁</span>
                          )}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600">{achievement.description}</p>
                        
                        {/* Progress bar for achievements with progress */}
                        {achievement.target && (
                          <div className="mt-2">
                            <div className="h-1.5 md:h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 transition-all duration-500" 
                                style={{ width: `${((achievement.progress || 0) / achievement.target) * 100}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {achievement.progress || 0} / {achievement.target}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Todo List */}
          <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="card-header">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <h2 className="card-title text-lg md:text-xl">您的任务</h2>
                <div className="flex rounded-xl bg-gray-100/80 p-1.5 shadow-inner backdrop-blur-sm">
                  <button 
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-1.5 text-xs md:text-sm font-medium rounded-lg transition-all duration-300 ${filterStatus === 'all' 
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg transform scale-105' 
                      : 'text-gray-600 hover:bg-gray-200/70 hover:text-indigo-700'}`}
                  >
                    全部
                  </button>
                  <button 
                    onClick={() => setFilterStatus('active')}
                    className={`px-4 py-1.5 text-xs md:text-sm font-medium rounded-lg mx-1.5 transition-all duration-300 ${filterStatus === 'active' 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105' 
                      : 'text-gray-600 hover:bg-gray-200/70 hover:text-indigo-700'}`}
                  >
                    未完成
                  </button>
                  <button 
                    onClick={() => setFilterStatus('completed')}
                    className={`px-4 py-1.5 text-xs md:text-sm font-medium rounded-lg transition-all duration-300 ${filterStatus === 'completed' 
                      ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg transform scale-105' 
                      : 'text-gray-600 hover:bg-gray-200/70 hover:text-indigo-700'}`}
                  >
                    已完成
                  </button>
                </div>
              </div>
              <p className="card-description">
                {filterStatus === 'all' ? '您的所有任务' : 
                 filterStatus === 'active' ? '待完成的任务' : 
                 '已完成的任务'}
              </p>
            </div>
            <div className="card-content">
              {loading && todos.length === 0 ? (
                <div className="text-center py-8 md:py-10">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 md:h-10 md:w-10 border-t-2 border-b-2 border-indigo-600 border-opacity-70 mb-4">
                    <div className="h-full w-full rounded-full border-2 border-indigo-200 border-opacity-50"></div>
                  </div>
                  <p className="text-sm md:text-base text-indigo-500 font-medium">正在加载您的任务...</p>
                </div>
              ) : filteredTodos.length === 0 ? (
                <div className="text-center py-8 md:py-10 bg-gradient-to-b from-gray-50 to-white border border-gray-100 rounded-xl shadow-sm">
                  <div className="relative mx-auto w-16 h-16 md:w-20 md:h-20 mb-3">
                    <div className="absolute inset-0 bg-indigo-100 rounded-full opacity-50 animate-ping" style={{ animationDuration: '3s' }}></div>
                    <div className="relative flex items-center justify-center h-full w-full">
                      <svg className="h-10 w-10 md:h-12 md:w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {filterStatus === 'all' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        ) : filterStatus === 'active' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                    </div>
                  </div>
                  <p className="mt-3 text-sm md:text-base font-medium" 
                    style={{
                      background: filterStatus === 'all' ? 'linear-gradient(to right, #4f46e5, #3b82f6)' :
                               filterStatus === 'active' ? 'linear-gradient(to right, #6366f1, #a855f7)' :
                               'linear-gradient(to right, #10b981, #14b8a6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>
                    {filterStatus === 'all' ? '暂无任务。请在上方添加！' : 
                     filterStatus === 'active' ? '没有未完成的任务。很棒！' : 
                     '暂无已完成的任务。'}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredTodos.map((todo, index) => (
                    <li 
                      key={todo.id} 
                      className="py-3 md:py-4 px-3 my-2 hover:bg-gray-50/80 rounded-xl border border-gray-100 shadow-sm hover:shadow transition-all duration-300 stagger-item"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center overflow-hidden
                              transition-all duration-300 cursor-pointer
                              ${todo.isCompleted 
                                ? 'border-green-500 bg-green-100' 
                                : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'}"
                              onClick={() => toggleTodo(todo.id)}
                            >
                              {todo.isCompleted && (
                                <svg 
                                  className="h-3 w-3 md:h-4 md:w-4 text-green-500 animate-scale-in" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          <span 
                            className={`ml-3 md:ml-4 text-sm md:text-base transition-all duration-300 truncate ${todo.isCompleted 
                              ? 'line-through text-gray-400 font-normal' 
                              : 'text-gray-800 font-medium'}`}
                          >
                            {todo.value}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="ml-2 px-3 py-1 rounded-lg text-xs md:text-sm text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-sm md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 flex-shrink-0"
                          disabled={loading}
                          aria-label="删除任务"
                        >
                          删除
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {todos.length > 0 && (
              <div className="card-footer">
                <div className="text-sm text-gray-500">
                  {todos.filter(t => !t.isCompleted).length} items left to do
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 md:py-6 mt-auto animate-slide-up">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm md:text-base">待办事项应用 &copy; {new Date().getFullYear()}</p>
          <p className="text-gray-400 text-xs md:text-sm mt-1">使用 React, TypeScript 和 Tailwind CSS 构建</p>
        </div>
      </footer>
    </div>
  )
}

export default App
