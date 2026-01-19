import { useState, useEffect } from 'react'

function App() {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)

  // 1. Check Login Status from URL or LocalStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const avatar = params.get('avatar');
    const open_id = params.get('open_id');
    const access_token = params.get('access_token');

    if (name) {
      const userData = { name, avatar, open_id, access_token };
      setUser(userData);
      localStorage.setItem('lark_user', JSON.stringify(userData));
      // Clear URL params
      window.history.replaceState({}, document.title, "/");
    } else {
      const savedUser = localStorage.getItem('lark_user');
      if (savedUser) setUser(JSON.parse(savedUser));
    }
  }, []);

  // 2. Fetch Tasks
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // 3. Login Handler
  const handleLogin = () => {
    window.location.href = 'http://localhost:3000/api/auth/login';
  };

  const handleLogout = () => {
    localStorage.removeItem('lark_user');
    setUser(null);
  };

  // 4. Sync Handler
  const handleSync = async (taskId) => {
    if (!user) return alert('Vui lòng đăng nhập để đồng bộ!');

    setLoading(true);
    try {
      const res = await fetch('/api/tasks/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          ownerName: user.name,
          ownerOpenId: user.open_id
        })
      });
      const result = await res.json();
      if (result.success) {
        alert('Đồng bộ thành công!');
        fetchTasks(); // Refresh list (mock: in real app, backend should update task owner)
      } else {
        alert('Có lỗi xảy ra.');
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Lỗi kết nối server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncFromLark = async () => {
    if (!user || !user.access_token) return alert('Vui lòng đăng nhập lại để có quyền truy cập!');

    setLoading(true);
    try {
      const res = await fetch('/api/tasks/sync-from-lark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: user.access_token
        })
      });
      const result = await res.json();
      if (result.success) {
        alert(`Đã tìm thấy và đồng bộ ${result.added} task mới từ Lark!`);
        fetchTasks();
      } else {
        alert('Lỗi đồng bộ.');
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Lỗi kết nối server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <header className="bg-blue-600 text-white p-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Lark Task Sync</h1>
          <div>
            {user ? (
              <div className="flex items-center gap-3">
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border-2 border-white" />
                <span className="font-medium">{user.name}</span>
                <button onClick={handleLogout} className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm transition transition-colors">Logout</button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-white text-blue-600 px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition shadow-md"
              >
                Login with Lark
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Danh sách công việc</h2>

          <div className="grid gap-4">
            {tasks.map(task => (
              <div key={task.id} className="border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50 transition border-l-4 border-l-blue-500 shadow-sm">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{task.title}</h3>
                  <p className="text-gray-500 text-sm">Status: <span className="bg-gray-200 px-2 py-0.5 rounded text-xs">{task.status}</span></p>
                  {task.owner ? (
                    <p className="text-green-600 text-sm mt-1 font-medium">Owner: {task.owner.name}</p>
                  ) : (
                    <p className="text-gray-400 text-sm mt-1">Chưa có người nhận</p>
                  )}
                </div>

                <button
                  onClick={() => handleSync(task.id)}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50 shadow-md"
                >
                  {/* Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Nhận việc & Đồng bộ
                </button>
              </div>
            ))}
          </div>

          {!user && (
            <div className="mt-8 text-center bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-yellow-800">
              <p>🔔 Vui lòng đăng nhập để nhận nhiệm vụ.</p>
            </div>
          )}

          {user && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="font-bold text-gray-800 mb-3">Tính năng nâng cao</h3>
              <button
                onClick={handleSyncFromLark}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Đồng bộ Task từ Lark về đây
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
