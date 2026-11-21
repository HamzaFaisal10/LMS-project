import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!tokenStore.get()) {
      setReady(true);
      return;
    }
    api('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => tokenStore.set(null))
      .finally(() => setReady(true));
  }, []);

  const handleAuth = useCallback((d) => {
    tokenStore.set(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      setUser,
      login: (email, password) =>
        api('/auth/login', { method: 'POST', body: { email, password } }).then(handleAuth),
      register: (payload) =>
        api('/auth/register', { method: 'POST', body: payload }).then(handleAuth),
      demoLogin: (role) => api(`/auth/demo/${role}`, { method: 'POST' }).then(handleAuth),
      logout: () => {
        tokenStore.set(null);
        setUser(null);
      },
    }),
    [user, ready, handleAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export const homeFor = (user) =>
  !user
    ? '/'
    : user.role === 'admin'
      ? '/admin'
      : user.role === 'instructor'
        ? '/instructor'
        : '/my-learning';
