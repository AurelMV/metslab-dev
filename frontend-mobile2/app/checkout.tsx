import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';

export default function Checkout() {
  const { cartItems, createOrder } = useApp();
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [paymentMethod, setPaymentMethod] = useState('mercadopago');

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryFee = deliveryMethod === 'delivery' ? 10.00 : 0;
  const total = subtotal + deliveryFee;

  const handleProcessPayment = () => {
    Alert.alert(
      'Procesar Pago',
      `¿Confirmas tu compra por S/ ${total.toFixed(2)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: () => {
            const order = createOrder(deliveryMethod);
            Alert.alert(
              'Compra Exitosa',
              `Tu pedido #${order.id} ha sido procesado exitosamente`,
              [
                { text: 'OK', onPress: () => router.replace('/(tabs)') }
              ]
            );
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Resumen de productos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de Productos</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.productItem}>
              <Text style={styles.productName}>{item.product.name}</Text>
              <Text style={styles.productPrice}>
                S/ {item.product.price.toFixed(2)} x {item.quantity}
              </Text>
            </View>
          ))}
        </View>

        {/* Método de entrega */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de Entrega</Text>
          
          <TouchableOpacity 
            style={[styles.optionItem, deliveryMethod === 'pickup' && styles.selectedOption]}
            onPress={() => setDeliveryMethod('pickup')}
          >
            <Ionicons name="storefront" size={24} color="#6366f1" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Recoger en Tienda</Text>
              <Text style={styles.optionSubtitle}>Gratis • Disponible hoy</Text>
            </View>
            <View style={styles.radioButton}>
              {deliveryMethod === 'pickup' && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionItem, deliveryMethod === 'delivery' && styles.selectedOption]}
            onPress={() => setDeliveryMethod('delivery')}
          >
            <Ionicons name="car" size={24} color="#10b981" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Delivery</Text>
              <Text style={styles.optionSubtitle}>S/ 10.00 • 2-3 días hábiles</Text>
            </View>
            <View style={styles.radioButton}>
              {deliveryMethod === 'delivery' && <View style={styles.radioButtonInner} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Método de pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Método de Pago</Text>
          
          <TouchableOpacity 
            style={[styles.optionItem, styles.selectedOption]}
            onPress={() => setPaymentMethod('mercadopago')}
          >
            <Ionicons name="card" size={24} color="#009ee3" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Mercado Pago</Text>
              <Text style={styles.optionSubtitle}>Tarjetas, efectivo y más</Text>
            </View>
            <View style={styles.radioButton}>
              <View style={styles.radioButtonInner} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Resumen de costos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de Costos</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Subtotal:</Text>
            <Text style={styles.costValue}>S/ {subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Envío:</Text>
            <Text style={styles.costValue}>
              {deliveryFee > 0 ? `S/ ${deliveryFee.toFixed(2)}` : 'Gratis'}
            </Text>
          </View>
          <View style={[styles.costRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>S/ {total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.payButton} onPress={handleProcessPayment}>
          <Text style={styles.payButtonText}>Procesar Pago</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  productName: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  productPrice: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  selectedOption: {
    borderColor: '#6366f1',
    backgroundColor: '#f8fafc',
  },
  optionContent: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366f1',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  costLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  costValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  payButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});