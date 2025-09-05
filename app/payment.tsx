import { processPayment } from "@/lib/payment";
import { useAuth } from "@/providers/AuthProvider";
import { useReports } from "@/providers/ReportsProvider";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, CreditCard, Smartphone } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PaymentScreen() {
  const { reportData, amount, tokensUsed } = useLocalSearchParams();
  const [selectedMethod, setSelectedMethod] = useState<"esewa" | "khalti">(
    "esewa"
  );
  const [loading, setLoading] = useState(false);

  const authContext = useAuth();
  const reportsContext = useReports();

  const { user, updateTokens } = authContext || {
    user: null,
    updateTokens: () => {},
  };
  const { createReport } = reportsContext || { createReport: async () => ({}) };

  const reportInfo = reportData ? JSON.parse(reportData as string) : null;
  const paymentAmount = parseInt(amount as string);
  const tokensToUse = parseInt(tokensUsed as string);

  const handlePayment = async () => {
    if (!reportInfo || !user) return;

    setLoading(true);

    try {
      const paymentResult = await processPayment(
        selectedMethod,
        paymentAmount,
        "temp_id"
      );

      if (paymentResult.success) {
        await createReport(reportInfo);
        await updateTokens(user.tokens - tokensToUse);

        Alert.alert(
          "Payment Successful",
          "Your missing child report has been posted and alerts are being sent to the community!",
          [{ text: "OK", onPress: () => router.replace("/(tabs)") }]
        );
      } else {
        Alert.alert(
          "Payment Failed",
          paymentResult.error || "Please try again"
        );
      }
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Error", "Payment processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!reportInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Invalid payment data</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Report Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Child:</Text>
            <Text style={styles.summaryValue}>{reportInfo.childName}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Broadcast area:</Text>
            <Text style={styles.summaryValue}>{reportInfo.broadcastArea}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Base cost:</Text>
            <Text style={styles.summaryValue}>Rs. {reportInfo.cost}</Text>
          </View>
          {tokensToUse > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Token discount:</Text>
              <Text style={styles.discountValue}>-Rs. {tokensToUse}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total amount:</Text>
            <Text style={styles.totalValue}>Rs. {paymentAmount}</Text>
          </View>
        </View>

        <View style={styles.paymentMethods}>
          <Text style={styles.methodsTitle}>Select Payment Method</Text>

          <TouchableOpacity
            style={[
              styles.methodButton,
              selectedMethod === "esewa" && styles.activeMethodButton,
            ]}
            onPress={() => setSelectedMethod("esewa")}
          >
            <CreditCard
              size={24}
              color={selectedMethod === "esewa" ? "white" : "#666"}
            />
            <Text
              style={[
                styles.methodText,
                selectedMethod === "esewa" && styles.activeMethodText,
              ]}
            >
              eSewa
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodButton,
              selectedMethod === "khalti" && styles.activeMethodButton,
            ]}
            onPress={() => setSelectedMethod("khalti")}
          >
            <Smartphone
              size={24}
              color={selectedMethod === "khalti" ? "white" : "#666"}
            />
            <Text
              style={[
                styles.methodText,
                selectedMethod === "khalti" && styles.activeMethodText,
              ]}
            >
              Khalti
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.payButton, loading && styles.disabledButton]}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.payButtonText}>
              Pay Rs. {paymentAmount} with{" "}
              {selectedMethod === "esewa" ? "eSewa" : "Khalti"}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          This is a demo payment. No actual money will be charged.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 24,
  },
  summaryCard: {
    backgroundColor: "#f8f9fa",
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
  },
  discountValue: {
    fontSize: 14,
    color: "#28a745",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF6B6B",
  },
  paymentMethods: {
    gap: 16,
  },
  methodsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  methodButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    gap: 12,
  },
  activeMethodButton: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  methodText: {
    fontSize: 16,
    color: "#333",
  },
  activeMethodText: {
    color: "white",
  },
  payButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  disclaimer: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
});
