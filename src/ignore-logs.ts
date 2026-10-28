import { LogBox } from 'react-native';

// NativeWind's JSX runtime touches ImageBackground on load, which warns on React Native 0.88.
// This must run before any JSX module loads, so it is imported first from the app entry.
LogBox.ignoreLogs(['ImageBackground is deprecated']);
