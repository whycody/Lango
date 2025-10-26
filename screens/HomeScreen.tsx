import { RefreshControl, ScrollView } from "react-native";
import { useCallback, useState } from "react";
import HeaderCard from "../cards/home/HeaderCard";
import WordsSuggestionsCard from "../cards/home/WordsSuggestionsCard";
import StatisticsCard from "../cards/home/StatisticsCard";
import { useWords } from "../store/WordsContext";
import { useSessions } from "../store/SessionsContext";
import { useEvaluations } from "../store/EvaluationsContext";
import { useSuggestions } from "../store/SuggestionsContext";
import { useAuth } from "../api/auth/AuthProvider";

const HomeScreen = () => {
  const auth = useAuth();
  const words = useWords();
  const sessions = useSessions();
  const suggestions = useSuggestions();
  const evaluations = useEvaluations();
  const [refreshing, setRefreshing] = useState(false);

  const tryToRefreshData = async () => {
    try {
      setRefreshing(true);
      await words.syncWords();
      await Promise.all([
        sessions.syncSessions(),
        suggestions.syncSuggestions(),
        evaluations.syncEvaluations(),
      ]);
    } finally {
      await auth.getSession();
      setRefreshing(false);
    }
  }

  const onRefresh = useCallback(async () => {
    tryToRefreshData();
  }, [words, sessions, suggestions, evaluations, auth]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || words.loading}
          onRefresh={onRefresh}
          progressViewOffset={50}
        />
      }
    >
      <HeaderCard/>
      <WordsSuggestionsCard/>
      <StatisticsCard/>
    </ScrollView>
  );
};

export default HomeScreen;