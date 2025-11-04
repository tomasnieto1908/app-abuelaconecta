import { TouchableOpacity, Text, StyleSheet, type ViewStyle, type TextStyle } from "react-native"

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: "primary" | "secondary"
  size?: "default" | "large"
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "default",
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyle = [styles.button, styles[variant], styles[size], disabled && styles.disabled, style]

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ]

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress} disabled={disabled} activeOpacity={0.8}>
      <Text style={textStyleCombined}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48, // Large touch target for elderly users
  },
  primary: {
    backgroundColor: "#000000",
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  default: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  large: {
    paddingHorizontal: 48,
    paddingVertical: 24,
  },
  disabled: {
    backgroundColor: "#666666",
    opacity: 0.6,
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  primaryText: {
    color: "#ffffff",
    fontSize: 18,
  },
  secondaryText: {
    color: "#ffffff",
    fontSize: 18,
  },
  defaultText: {
    fontSize: 18,
  },
  largeText: {
    fontSize: 20,
  },
  disabledText: {
    color: "#cccccc",
  },
})
