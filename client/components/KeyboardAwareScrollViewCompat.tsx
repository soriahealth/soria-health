import { ScrollView, ScrollViewProps } from "react-native";

type Props = ScrollViewProps;

/**
 * KeyboardAwareScrollView — uses ScrollView with keyboard handling for Expo Go compatibility.
 */
export function KeyboardAwareScrollViewCompat({
  children,
  keyboardShouldPersistTaps = "handled",
  ...props
}: Props) {
  return (
    <ScrollView
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      {...props}
    >
      {children}
    </ScrollView>
  );
}
