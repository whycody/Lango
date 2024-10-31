import { ScrollView } from "react-native";
import HeaderCard from "../components/cards/HeaderCard";
import WordsSuggestionsCard from "../components/cards/WordsSuggestionsCard";

const HomeScreen = () => {

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <HeaderCard />
      <WordsSuggestionsCard />
    </ScrollView>
  );
}

export default HomeScreen;