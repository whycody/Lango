import { createContext, FC, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StatisticsContextProps {
  numberOfSessions: number;
  increaseNumberOfSessions: () => void;
  numberOfDays: number;
  increaseNumberOfDays: () => void;
}

export const StatisticsContext = createContext<StatisticsContextProps>({
  numberOfSessions: 0,
  increaseNumberOfSessions: () => {},
  numberOfDays: 0,
  increaseNumberOfDays: () => {},
});

export const StatisticsProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
  const [numberOfSessions, setNumberOfSessions] = useState(0);
  const [numberOfDays, setNumberOfDays] = useState(0);
  const [daysList, setDaysList] = useState<string[]>([]);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        const sessions = await AsyncStorage.getItem('numberOfSessions');
        const days = await AsyncStorage.getItem('daysList');

        if (sessions) {
          setNumberOfSessions(parseInt(sessions));
        }

        if (days) {
          const parsedDays = JSON.parse(days);
          setDaysList(parsedDays);
          setNumberOfDays(parsedDays.length);
        }
      } catch (error) {
        console.error("Failed to load statistics from AsyncStorage", error);
      }
    };

    loadStatistics();
  }, []);

  const increaseNumberOfSessions = async () => {
    const newSessionCount = numberOfSessions + 1;
    setNumberOfSessions(newSessionCount);
    await AsyncStorage.setItem('numberOfSessions', newSessionCount.toString());
  };

  const increaseNumberOfDays = async () => {
    const today = new Date().toISOString().split('T')[0];
    if (!daysList.includes(today)) {
      const updatedDaysList = [...daysList, today];
      setDaysList(updatedDaysList);
      setNumberOfDays(updatedDaysList.length);
      await AsyncStorage.setItem('daysList', JSON.stringify(updatedDaysList));
    }
  };

  return (
    <StatisticsContext.Provider
      value={{ numberOfSessions, increaseNumberOfSessions, numberOfDays, increaseNumberOfDays }}>
      {children}
    </StatisticsContext.Provider>
  );
};
