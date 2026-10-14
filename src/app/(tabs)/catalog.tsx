import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  BookOpen,
  Filter,
  Search,
  Sparkles,
  X,
} from 'lucide-react-native';
import { GlowCard, StandardsBadge, T } from '../../components/ui';
import { haptic } from '../../lib/haptics';
import {
  CATALOG_FILTERS,
  isContinuousSource,
  PRODUCT_CATALOG,
  unitLabel,
} from '../../lib/catalog';
import { getProductCatalog } from '../../services/supabaseService';
import { Product } from '../../types';

export default function CatalogTabScreen() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>(PRODUCT_CATALOG);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFilterId, setSelectedFilterId] = useState('all');

  useEffect(() => {
    let mounted = true;
    getProductCatalog().then((list) => {
      if (mounted && list && list.length > 0) {
        setProducts(list);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const activeFilter = CATALOG_FILTERS.find((f) => f.id === selectedFilterId) || CATALOG_FILTERS[0];

  const filteredProducts = products.filter((p) => {
    // Category filter
    if (activeFilter.categories.length > 0 && !activeFilter.categories.includes(p.category)) {
      return false;
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchBrand = (p.brand || '').toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      return matchName || matchSku || matchBrand || matchDesc;
    }

    return true;
  });

  return (
    <SafeAreaView className="flex-1 bg-[#0e0e0e]">
      {/* Top Header */}
      <View className="px-5 py-3 border-b border-white/[0.08] flex-row items-center justify-between bg-[#0e0e0e]">
        <View className="flex-row items-center gap-2">
          <BookOpen size={18} color="#d9b277" />
          <T variant="h3" className="text-white">
            Catálogo QLS & LEDYi
          </T>
        </View>
        <T variant="caption" className="text-zinc-500">
          {filteredProducts.length} itens
        </T>
      </View>

      {/* Search Input */}
      <View className="px-5 pt-3 pb-2">
        <View className="bg-[#181818] border border-white/10 rounded-[14px] px-3.5 py-2.5 flex-row items-center gap-2.5">
          <Search size={16} color="#71717a" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar por modelo, SKU ou categoria..."
            placeholderTextColor="#71717a"
            className="flex-1 text-white text-sm p-0"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} className="p-1">
              <X size={14} color="#a1a1aa" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View className="py-2 border-b border-white/[0.06]">
        <FlatList
          horizontal
          data={CATALOG_FILTERS}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          renderItem={({ item }) => {
            const isSelected = selectedFilterId === item.id;
            return (
              <Pressable
                onPress={() => {
                  haptic.tick();
                  setSelectedFilterId(item.id);
                }}
                className={`px-3.5 py-1.5 rounded-full border ${
                  isSelected
                    ? 'bg-[#d9b277] border-[#d9b277]'
                    : 'bg-[#181818] border-white/10'
                }`}
              >
                <T
                  variant="caption"
                  className={`text-xs font-medium ${
                    isSelected ? 'text-black font-bold' : 'text-zinc-300'
                  }`}
                >
                  {item.label}
                </T>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 80, gap: 14 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="py-12 items-center">
            <T variant="caption" className="text-zinc-400 text-center">
              Nenhum produto encontrado com os filtros aplicados.
            </T>
          </View>
        }
        renderItem={({ item }) => {
          const isContinuous = isContinuousSource(item) || item.unit === 'm';
          return (
            <Pressable
              onPress={() => {
                haptic.tick();
                router.push(`/catalog/${item.id}` as any);
              }}
            >
              <GlowCard className="p-3.5 flex-row gap-3.5">
                <Image
                  source={{ uri: item.imageUrl }}
                  className="w-24 h-24 rounded-[14px] bg-zinc-800"
                  resizeMode="cover"
                />

                <View className="flex-1 justify-between py-0.5">
                  <View>
                    <View className="flex-row items-center justify-between">
                      <T variant="caption" className="text-[#d9b277] text-[10px] font-bold uppercase tracking-wider">
                        {item.brand || 'LEDYi'} · {item.category.toUpperCase()}
                      </T>
                      {!item.verified && (
                        <View className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/10">
                          <T variant="caption" className="text-zinc-400 text-[9px]">
                            Referência
                          </T>
                        </View>
                      )}
                    </View>

                    <T variant="bodyMd" className="text-white font-bold text-sm mt-0.5" numberOfLines={2}>
                      {item.name}
                    </T>

                    <T variant="caption" className="text-zinc-400 text-[11px] mt-0.5">
                      SKU: {item.sku}
                    </T>
                  </View>

                  <View className="flex-row items-center justify-between pt-2 border-t border-white/[0.06]">
                    <View className="flex-row items-center gap-1.5">
                      {item.powerWatts > 0 && (
                        <View className="px-1.5 py-0.5 rounded bg-white/[0.06]">
                          <T variant="caption" className="text-zinc-300 text-[10px]">
                            {item.powerWatts} {isContinuous ? 'W/m' : 'W'}
                          </T>
                        </View>
                      )}
                      {item.cctKelvin > 0 && (
                        <View className="px-1.5 py-0.5 rounded bg-white/[0.06]">
                          <T variant="caption" className="text-zinc-300 text-[10px]">
                            {item.cctKelvin}K
                          </T>
                        </View>
                      )}
                      {item.ipRating && (
                        <View className="px-1.5 py-0.5 rounded bg-white/[0.06]">
                          <T variant="caption" className="text-zinc-300 text-[10px]">
                            {item.ipRating}
                          </T>
                        </View>
                      )}
                    </View>

                    <T variant="bodyMd" className="text-[#d9b277] font-bold text-sm">
                      ${item.basePrice.toFixed(2)} AUD {item.unit === 'm' ? '/m' : 'ea'}
                    </T>
                  </View>
                </View>
              </GlowCard>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}
