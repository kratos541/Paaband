import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, StatusBar, Animated, ActivityIndicator, RefreshControl, Linking,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FeedItem, loadInitialNews, loadMoreNews, resetNewsFeed } from '../services/newsService';
import UpgradeBanner from '../components/UpgradeBanner';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function NewsCard({ item }: { item: FeedItem }) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const onIn = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, damping: 10 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 10 }).start();

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={onIn}
      onPressOut={onOut}
      onPress={() => item.link && Linking.openURL(item.link)}
    >
      <Animated.View style={[s.card, { backgroundColor: colors.bg2, borderColor: colors.border, transform: [{ scale }] }]}>
        <Image source={{ uri: item.img }} style={s.cardImg} resizeMode="cover" defaultSource={require('../../android/app/src/main/res/mipmap-hdpi/ic_launcher.png')} />
        <View style={s.cardBody}>
          <View style={s.cardMeta}>
            <View style={[s.catBadge, { backgroundColor: item.catColor + '22' }]}>
              <Text style={[s.catText, { color: item.catColor }]}>{item.cat}</Text>
            </View>
            {item.mag === 'high' && (
              <View style={[s.urgentBadge, { backgroundColor: colors.redFaint }]}>
                <Text style={[s.urgentText, { color: colors.red }]}>URGENT</Text>
              </View>
            )}
            <Text style={[s.source, { color: colors.text3 }]}>{item.source}</Text>
            <Text style={[s.time, { color: colors.text3 }]}>{timeAgo(item.pubDate)}</Text>
          </View>

          <Text style={[s.headline, { color: colors.text }]} numberOfLines={2}>{item.headline}</Text>
          <Text style={[s.caption, { color: colors.text3 }]} numberOfLines={3}>{item.caption}</Text>

          <View style={[s.actionBox, { backgroundColor: colors.goldFaint, borderColor: colors.borderGold }]}>
            <Text style={[s.actionLabel, { color: colors.gold }]}>Action: </Text>
            <Text style={[s.actionText, { color: colors.text2 }]}>{item.action}</Text>
          </View>

          <View style={[s.readMore, { borderTopColor: colors.border }]}>
            <Text style={[s.readMoreText, { color: colors.gold }]}>Read full article ›</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function NewsFeedScreen() {
  const { colors, isDark } = useTheme();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    loadInitialNews().then(data => {
      setItems(data);
      setInitialLoad(false);
    });
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    const data = await loadMoreNews();
    setItems(data);
    setLoadingMore(false);
    loadingMoreRef.current = false;
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    resetNewsFeed();
    const data = await loadInitialNews();
    setItems(data);
    setRefreshing(false);
  }, []);

  const highCount = items.filter(n => n.mag === 'high').length;

  return (
    <View style={[s.container, { backgroundColor: colors.bg }]}>
      <StatusBar backgroundColor={colors.bg2} barStyle={isDark ? 'light-content' : 'dark-content'} />
      <UpgradeBanner />
      <View style={[s.header, { backgroundColor: colors.bg2, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[s.headerTitle, { color: colors.text }]}>📰 Pakistan Business News</Text>
          <Text style={[s.headerSub, { color: colors.text3 }]}>Live feed · Pull to refresh</Text>
        </View>
        {highCount > 0 && (
          <View style={[s.alertBadge, { backgroundColor: colors.redFaint, borderColor: colors.redBorder }]}>
            <Text style={[s.alertBadgeText, { color: colors.red }]}>{highCount} urgent</Text>
          </View>
        )}
      </View>

      {initialLoad ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={[s.loadingText, { color: colors.text3 }]}>Loading news…</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <NewsCard item={item} />}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={s.footerLoader}>
                <ActivityIndicator size="small" color={colors.gold} />
                <Text style={[s.loadingText, { color: colors.text3 }]}>Loading more…</Text>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.gold]}
              tintColor={colors.gold}
            />
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 16, paddingBottom: 16, paddingHorizontal: 20,
    borderBottomWidth: 0.5, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'flex-end',
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 3 },
  alertBadge: { borderWidth: 0.5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  alertBadgeText: { fontSize: 11, fontWeight: '700' },
  list: { padding: 16, paddingBottom: 40 },
  card: { borderRadius: 14, marginBottom: 16, borderWidth: 0.5, overflow: 'hidden' },
  cardImg: { width: '100%', height: 180, backgroundColor: '#1a1a1a' },
  cardBody: { padding: 14 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' },
  catBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  catText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  urgentBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  urgentText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  source: { fontSize: 11 },
  time: { fontSize: 11, marginLeft: 'auto' as any },
  headline: { fontSize: 15, fontWeight: '700', marginBottom: 6, lineHeight: 21 },
  caption: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  actionBox: { flexDirection: 'row', flexWrap: 'wrap', borderRadius: 8, padding: 10, borderWidth: 0.5, marginBottom: 10 },
  actionLabel: { fontSize: 12, fontWeight: '700' },
  actionText: { fontSize: 12, flex: 1, flexWrap: 'wrap' },
  readMore: { borderTopWidth: 0.5, paddingTop: 10, alignItems: 'flex-end' },
  readMoreText: { fontSize: 12, fontWeight: '700' },
  footerLoader: { paddingVertical: 20, alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 13, marginTop: 6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
