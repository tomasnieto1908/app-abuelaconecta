import { TextInput, View, Text, StyleSheet, type ViewStyle, type TextStyle } from "react-native"

interface InputProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  label?: string
  multiline?: boolean
  numberOfLines?: number
  style?: ViewStyle
  inputStyle?: TextStyle
  editable?: boolean
}

export default function Input({
  value,
  onChangeText,
  placeholder,
  label,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  editable = true,
}: InputProps) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, multiline && styles.multilineInput, !editable && styles.disabledInput, inputStyle]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999999"
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        editable={editable}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    color: "#000000",
    minHeight: 56, // Large touch target for elderly users
    borderWidth: 2,
    borderColor: "transparent",
  },
  multilineInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "#666666",
  },
})
