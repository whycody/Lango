import { ScrollView, RefreshControl } from "react-native";
import { useState, useCallback } from "react";
import HeaderCard from "../cards/home/HeaderCard";
import WordsSuggestionsCard from "../cards/home/WordsSuggestionsCard";
import StatisticsCard from "../cards/home/StatisticsCard";
import { useWords } from "../store/WordsContext";
import { useSessions } from "../store/SessionsContext";
import { useEvaluations } from "../store/EvaluationsContext";
import { useAuth } from "../hooks/useAuth";
import { useSuggestions } from "../store/SuggestionsContext";

const HomeScreen = () => {
  const auth = useAuth();
  const words = useWords();
  const sessions = useSessions();
  const suggestions = useSuggestions();
  const evaluations = useEvaluations();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      words.syncWords(),
      sessions.syncSessions(),
      suggestions.syncSuggestions(),
      evaluations.syncEvaluations(),
    ]);
    await auth.getSession();
    setRefreshing(false);
  }, [words]);

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