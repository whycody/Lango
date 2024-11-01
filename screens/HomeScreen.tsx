import { ScrollView } from "react-native";
import HeaderCard from "../components/cards/HeaderCard";
import WordsSuggestionsCard from "../components/cards/WordsSuggestionsCard";
import StatisticsCard from "../components/cards/StatisticsCard";

const HomeScreen = () => {

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <HeaderCard />
      <WordsSuggestionsCard />
      <StatisticsCard />
    </ScrollView>
  );
}

export default HomeScreen;