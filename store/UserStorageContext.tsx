import React, { createContext, useContext } from 'react'
import { useMMKV } from 'react-native-mmkv'
import { useAuth } from "../api/auth/AuthProvider"

type UserStorageContextType = {
  storage: ReturnType<typeof useMMKV> | null
}

const UserStorageContext = createContext<UserStorageContextType>({ storage: null })

export const UserStorageProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()

  const storage = user?.userId ? useMMKV({ id: `user-${user.userId}` }) : null

  return (
    <UserStorageContext.Provider value={{ storage }}>
      {children}
    </UserStorageContext.Provider>
  )
}

export const useUserStorage = () => {
  const context = useContext(UserStorageContext)
  if (!context) throw new Error("useUserStorage must be used within a UserStorageProvider")
  return context
}