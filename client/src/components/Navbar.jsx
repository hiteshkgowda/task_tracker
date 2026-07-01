function Navbar() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          <h1 className="text-xl font-bold text-gray-800">Task Tracker</h1>
        </div>
        <span className="text-sm text-gray-400 hidden sm:block">
          Stay organized, stay ahead
        </span>
      </div>
    </header>
  );
}

export default Navbar;
