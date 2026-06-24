import { StatusBar } from 'expo-status-bar';
import { SpellingProgressScreen } from './src/features/analytics';

export default function App() {
  return (
    <>
      <SpellingProgressScreen />
      <StatusBar style="dark" />
    </>
  );
}
