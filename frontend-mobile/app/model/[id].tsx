import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Dimensions,
  Platform
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { mockModels } from '@/data/mockModels';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type TabType = 'description' | 'specs' | 'reviews';

// Mock data para la galería de imágenes
const getModelGallery = (modelId: string) => [
  `https://picsum.photos/400/30${modelId}`,
  `https://picsum.photos/400/31${modelId}`,
  `https://picsum.photos/400/32${modelId}`,
  `https://picsum.photos/400/33${modelId}`,
];

// Mock reviews
const mockReviews = [
  { id: 1, user: 'Carlos M.', rating: 5, comment: 'Excelente calidad, muy detallado' },
  { id: 2, user: 'Ana R.', rating: 4, comment: 'Buenos materiales, fácil de usar' },
  { id: 3, user: 'Pedro L.', rating: 5, comment: 'Perfecto para mi proyecto' },
];

export default function ModelDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState<TabType>('description');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [pendingCartAlert, setPendingCartAlert] = useState<null | boolean>(null);
  const isFirstRender = useRef(true);

  const model = mockModels.find(m => m.id === id);
  const gallery = model ? getModelGallery(model.id) : [];

  if (!model) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={64} color={Colors[colorScheme ?? 'light'].text} />
          <ThemedText type="title">Modelo no encontrado</ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ThemedText style={styles.backButtonText}>Volver</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    setIsInCart(prev => {
      const newValue = !prev;
      // Espera dos frames para asegurar el render antes del Alert
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!isFirstRender.current) {
            Alert.alert(
              newValue ? 'Agregado al carrito' : 'Eliminado del carrito',
              newValue
                ? 'El modelo fue agregado a tu carrito exitosamente'
                : 'El modelo fue eliminado de tu carrito'
            );
          }
        });
      });
      return newValue;
    });
  };

  const handleToggleFavorite = () => {
    setIsFavorite(prev => !prev);
  };

  const handleBuyNow = () => {
    Alert.alert(
      'Comprar ahora',
      '¿Deseas proceder con la compra de este modelo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Comprar', onPress: () => Alert.alert('Redirigiendo al pago...') }
      ]
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <View style={styles.tabContent}>
            <ThemedText style={styles.descriptionText}>
              {model.description || 'Este es un modelo 3D de alta calidad, perfecto para tus proyectos de diseño, juegos o visualizaciones. Creado con atención al detalle y optimizado para diferentes plataformas.'}
            </ThemedText>
            
            <View style={styles.featuresContainer}>
              <ThemedText type="defaultSemiBold" style={styles.featuresTitle}>Características:</ThemedText>
              <View style={styles.feature}>
                <IconSymbol name="checkmark.circle.fill" size={20} color="#4CAF50" />
                <ThemedText style={styles.featureText}>Modelo optimizado para juegos</ThemedText>
              </View>
              <View style={styles.feature}>
                <IconSymbol name="checkmark.circle.fill" size={20} color="#4CAF50" />
                <ThemedText style={styles.featureText}>Texturas PBR incluidas</ThemedText>
              </View>
              <View style={styles.feature}>
                <IconSymbol name="checkmark.circle.fill" size={20} color="#4CAF50" />
                <ThemedText style={styles.featureText}>Compatible con Unity y Unreal</ThemedText>
              </View>
              <View style={styles.feature}>
                <IconSymbol name="checkmark.circle.fill" size={20} color="#4CAF50" />
                <ThemedText style={styles.featureText}>Licencia comercial incluida</ThemedText>
              </View>
            </View>
          </View>
        );
      
      case 'specs':
        return (
          <View style={styles.tabContent}>
            <View style={styles.specRow}>
              <ThemedText style={styles.specLabel}>Formato:</ThemedText>
              <ThemedText style={styles.specValue}>{model.format || 'GLB/GLTF'}</ThemedText>
            </View>
            <View style={styles.specRow}>
              <ThemedText style={styles.specLabel}>Polígonos:</ThemedText>
              <ThemedText style={styles.specValue}>{model.polygons || '15,000'}</ThemedText>
            </View>
            <View style={styles.specRow}>
              <ThemedText style={styles.specLabel}>Texturas:</ThemedText>
              <ThemedText style={styles.specValue}>{model.textures || '2K PBR'}</ThemedText>
            </View>
            <View style={styles.specRow}>
              <ThemedText style={styles.specLabel}>Tamaño del archivo:</ThemedText>
              <ThemedText style={styles.specValue}>~25 MB</ThemedText>
            </View>
            <View style={styles.specRow}>
              <ThemedText style={styles.specLabel}>Animaciones:</ThemedText>
              <ThemedText style={styles.specValue}>No incluidas</ThemedText>
            </View>
            <View style={styles.specRow}>
              <ThemedText style={styles.specLabel}>Rigging:</ThemedText>
              <ThemedText style={styles.specValue}>Sí</ThemedText>
            </View>
            <View style={styles.specRow}>
              <ThemedText style={styles.specLabel}>Software compatible:</ThemedText>
              <ThemedText style={styles.specValue}>Blender, Maya, 3ds Max, Unity, Unreal Engine</ThemedText>
            </View>
          </View>
        );
      
      case 'reviews':
        return (
          <View style={styles.tabContent}>
            <View style={styles.reviewsHeader}>
              <View style={styles.ratingContainer}>
                <ThemedText type="title">4.7</ThemedText>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <IconSymbol 
                      key={star} 
                      name={star <= 4 ? "star.fill" : "star"} 
                      size={16} 
                      color="#FFD700" 
                    />
                  ))}
                </View>
                <ThemedText style={styles.reviewCount}>({mockReviews.length} reseñas)</ThemedText>
              </View>
            </View>
            
            {mockReviews.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <ThemedText type="defaultSemiBold">{review.user}</ThemedText>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <IconSymbol 
                        key={star} 
                        name={star <= review.rating ? "star.fill" : "star"} 
                        size={14} 
                        color="#FFD700" 
                      />
                    ))}
                  </View>
                </View>
                <ThemedText style={styles.reviewComment}>{review.comment}</ThemedText>
              </View>
            ))}
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {/* Header con imagen y controles */}
      <View style={styles.imageContainer}>
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.floor(event.nativeEvent.contentOffset.x / screenWidth);
            setCurrentImageIndex(index);
          }}
        >
          {gallery.map((imageUrl, index) => (
            <Image 
              key={index}
              source={{ uri: imageUrl }} 
              style={styles.heroImage}
              contentFit="cover"
            />
          ))}
        </ScrollView>
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        >
          <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
            <IconSymbol 
              name={isFavorite ? "heart.fill" : "heart"} 
              size={24} 
              color={isFavorite ? "#FF6B6B" : "white"} 
            />
          </TouchableOpacity>
          <View style={styles.pageIndicators}>
            {gallery.map((_, index) => (
              <View 
                key={index}
                style={[
                  styles.pageIndicator,
                  { opacity: index === currentImageIndex ? 1 : 0.5 }
                ]}
              />
            ))}
          </View>
          </LinearGradient>
      </View>

      {/* Contenido principal y tabs */}
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.modelInfo}>
            <ThemedText type="title" style={styles.modelTitle}>{model.title}</ThemedText>
            <ThemedText type="subtitle" style={styles.modelPrice}>${model.price.toFixed(2)}</ThemedText>
          </View>
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'description' && styles.activeTab]}
              onPress={() => setActiveTab('description')}
              activeOpacity={0.7}
            >
              <ThemedText style={[styles.tabText, activeTab === 'description' && styles.activeTabText]}>
                Descripción
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'specs' && styles.activeTab]}
              onPress={() => setActiveTab('specs')}
              activeOpacity={0.7}
            >
              <ThemedText style={[styles.tabText, activeTab === 'specs' && styles.activeTabText]}>
                Especificaciones
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
              onPress={() => setActiveTab('reviews')}
              activeOpacity={0.7}
            >
              <ThemedText style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
                Reseñas
              </ThemedText>
            </TouchableOpacity>
          </View>
          {renderTabContent()}
        </ScrollView>

        {/* Botones de acción fijos */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.cartButton, isInCart && styles.cartButtonActive]} 
            onPress={handleAddToCart}
            activeOpacity={0.7}
          >
            <IconSymbol 
              name={isInCart ? "cart.fill" : "cart"} 
              size={20} 
              color="white" 
            />
            <ThemedText style={styles.cartButtonText}>
              {isInCart ? 'En carrito' : 'Agregar'}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyButton} onPress={handleBuyNow} activeOpacity={0.7}>
            <ThemedText style={styles.buyButtonText}>Comprar ahora</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  imageContainer: {
    height: screenHeight * 0.4,
    position: 'relative',
  },
  heroImage: {
    width: screenWidth,
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 20,
  },
  backIconButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modelInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modelPrice: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    padding: 20,
    minHeight: 200,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    color: '#333',
  },
  featuresContainer: {
    gap: 12,
  },
  featuresTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  specLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    color: '#333',
  },
  specValue: {
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
    color: '#666',
  },
  reviewsHeader: {
    marginBottom: 20,
  },
  ratingContainer: {
    alignItems: 'center',
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  reviewItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  cartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#666',
    borderRadius: 12,
    gap: 8,
  },
  cartButtonActive: {
    backgroundColor: '#4CAF50',
  },
  cartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
