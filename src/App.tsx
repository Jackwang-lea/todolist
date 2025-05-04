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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-indigo-600">我的待办事项</h1>
              <p className="text-gray-600 mt-1">高效管理您的任务</p>
            </div>
            
            {/* User Stats */}
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-100 px-4 py-2 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <span className="text-xl mr-2">⭐</span>
                  <div>
                    <p className="text-xs text-gray-500">积分</p>
                    <p className="font-bold text-indigo-700">{points}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-100 px-4 py-2 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <span className="text-xl mr-2">🏆</span>
                  <div className="w-full">
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">等级</p>
                      <p className="font-bold text-purple-700">{level}</p>
                    </div>
                    {/* Level progress bar */}
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
                      <div 
                        className="h-full bg-purple-500 transition-all duration-500" 
                        style={{ width: `${(points % 100) / 100 * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{points % 100}/100 距离等级 {level + 1}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-100 px-4 py-2 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <span className="text-xl mr-2">🔥</span>
                  <div>
                    <p className="text-xs text-gray-500">连续完成</p>
                    <p className="font-bold text-red-700">{streak}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="relative w-64 h-64 opacity-75">
                <div className="absolute top-0 left-0 w-full h-full bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                <div className="absolute top-0 right-0 w-full h-full bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-0 left-20 w-full h-full bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
              </div>
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
              <form onSubmit={addTodo} className="flex flex-col sm:flex-row gap-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="需要完成什么？"
                  className="input flex-1"
                  disabled={loading}
                />
                <button
                  type="submit"
                  className={`btn btn-primary btn-md ${isAddingTodo ? 'animate-pulse' : ''}`}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-4 rounded-lg border ${achievement.unlocked ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'} transition-all duration-300 hover:shadow-md`}
                  >
                    <div className="flex items-center">
                      <div className={`text-3xl mr-3 ${!achievement.unlocked && 'opacity-50'}`}>{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg flex items-center">
                          {achievement.title}
                          {achievement.unlocked && (
                            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">已解锁</span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        
                        {/* Progress bar for achievements with progress */}
                        {achievement.target && (
                          <div className="mt-2">
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
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
              <div className="flex items-center justify-between">
                <h2 className="card-title">您的任务</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setFilterStatus('all')}
                    className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    全部
                  </button>
                  <button 
                    onClick={() => setFilterStatus('active')}
                    className={`btn btn-sm ${filterStatus === 'active' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    未完成
                  </button>
                  <button 
                    onClick={() => setFilterStatus('completed')}
                    className={`btn btn-sm ${filterStatus === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
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
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                  <p className="text-gray-500">正在加载您的任务...</p>
                </div>
              ) : filteredTodos.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <svg className="mx-auto h-12 w-12 text-gray-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-2 text-gray-500">
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
                      className="py-4 px-2 hover:bg-gray-50 rounded-md transition-all duration-300 stagger-item"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between group">
                        <div className="flex items-center">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={todo.isCompleted}
                              onChange={() => toggleTodo(todo.id)}
                              className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-all duration-300"
                              disabled={loading}
                            />
                            {todo.isCompleted && (
                              <svg 
                                className="absolute top-0 left-0 h-5 w-5 text-indigo-600 animate-scale-in" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span 
                            className={`ml-3 text-lg transition-all duration-300 ${todo.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}
                          >
                            {todo.value}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="ml-2 btn btn-sm btn-danger opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          disabled={loading}
                        >
                          Delete
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
      <footer className="bg-gray-800 text-white py-6 mt-auto animate-slide-up">
        <div className="container mx-auto px-4 text-center">
          <p>Todo List Application &copy; {new Date().getFullYear()}</p>
          <p className="text-gray-400 text-sm mt-1">Built with React, TypeScript, and Tailwind CSS</p>
        </div>
      </footer>
    </div>
  )
}

export default App
