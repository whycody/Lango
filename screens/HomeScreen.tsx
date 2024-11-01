import { ScrollView } from "react-native";
import HeaderCard from "../cards/home/HeaderCard";
import WordsSuggestionsCard from "../cards/home/WordsSuggestionsCard";
import StatisticsCard from "../cards/home/StatisticsCard";

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