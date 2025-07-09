import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
//import Model3DViewer from '@/components/Model3DViewer';
import { Ionicons } from '@expo/vector-icons';
import { getModeloById } from '@/services/modelo-service';
import { useApp } from '@/contexts/AppContext'; // Asegúrate de tener este contexto

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, isAuthenticated } = useApp(); // Usa tu contexto

  useEffect(() => {
    async function fetchProduct() {
      try {
        const modelo = await getModeloById(id);
        setProduct(modelo);
      } catch (error) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Iniciar Sesión',
        'Debes iniciar sesión para añadir productos al carrito',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Iniciar Sesión', onPress: () => router.push('/auth') },
        ]
      );
      return;
    }
    addToCart(product);
    Alert.alert(
      'Añadido al Carrito',
      `${product.nombre} ha sido añadido a tu carrito`,
      [
        { text: 'Seguir Comprando', style: 'cancel' },
        { text: 'Ver Carrito', onPress: () => router.push('/(tabs)/cart') },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Producto no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#1f2937" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: product.imagen_url }} style={styles.image} />

        <View style={styles.content}>
          <Text style={styles.title}>{product.nombre}</Text>
          <Text style={styles.category}>
            Categoría: {product.nombreCategoria}
          </Text>
          <Text style={styles.price}>S/ {product.precio.toFixed(2)}</Text>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{product.descripcion}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Dimensiones</Text>
            <Text style={styles.description}>{product.dimensiones}</Text>
          </View>

          {/* Botón para agregar al carrito */}
          <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
            <Ionicons name="cart" size={20} color="#fff" />
            <Text style={styles.cartButtonText}>Añadir al Carrito</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ...tus estilos previos...
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
    justifyContent: 'center',
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  container: { flex: 1, backgroundColor: '#fff' },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: '#6366f1',
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 22,
  },
  link: {
    fontSize: 14,
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 100,
  },
});
