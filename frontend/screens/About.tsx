import { RouteProp, useRoute } from '@react-navigation/native';
import { ScreenContent } from '../components/ScreenContent';
import { StyleSheet, View } from 'react-native';

import { RootStackParamList } from '../navigation';

type AboutScreenRouteProp = RouteProp<RootStackParamList, 'About'>;

const About = () => {
  const router = useRoute<AboutScreenRouteProp>();

  return (
    <View style={styles.container}>
      <ScreenContent path="screens/about.tsx" title={`About`} />
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});

export default About;
