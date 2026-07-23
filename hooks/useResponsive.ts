import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isDesktop = width >= 768;
  const isTablet = width >= 600 && width < 768;
  const isMobile = width < 600;

  return {
    isDesktop,
    isTablet,
    isMobile,
    width,
    height,
  };
}
