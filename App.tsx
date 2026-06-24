import { StatusBar } from 'expo-status-bar';
import { CorrectionKeyboard } from './src/features/keyboard/components/CorrectionKeyboard';

export default function App() {
  return (
    <>
      <CorrectionKeyboard />
      <StatusBar style="dark" />
    </>
  );
}
