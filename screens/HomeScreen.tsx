import { ScrollView, RefreshControl } from "react-native";
import { useState, useCallback } from "react";
import HeaderCard from "../cards/home/HeaderCard";
import WordsSuggestionsCard from "../cards/home/WordsSuggestionsCard";
import StatisticsCard from "../cards/home/StatisticsCard";
import { useWords } from "../store/WordsContext";

const HomeScreen = () => {
  const words = useWords();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await words.syncWords();
    setRefreshing(false);
  }, [words]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} progressViewOffset={50} />}
    >
      <HeaderCard />
      <WordsSuggestionsCard />
      <StatisticsCard />
    </ScrollView>
  );
};

export default HomeScreen;