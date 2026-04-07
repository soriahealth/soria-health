import { Colors } from "@/constants/theme";
import { useThemeContext } from "@/context/ThemeContext";

export function useTheme() {
  const { isDark, mode, setMode, toggle } = useThemeContext();
  const theme = isDark ? Colors.dark : Colors.light;

  return {
    theme,
    isDark,
    mode,
    setMode,
    toggle,
  };
}
