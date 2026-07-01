import { useEffect, useState } from "react";

function useLocalStorageState(key, defaultValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored !== null ? stored : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorageState;
