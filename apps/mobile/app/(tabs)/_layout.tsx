import {
  faBagShopping,
  faHeart,
  faHouse,
  faMagnifyingGlass,
  faUser,
} from '@fortawesome/pro-regular-svg-icons';
import {
  faBagShopping as faBagShoppingSolid,
  faHeart as faHeartSolid,
  faHouse as faHouseSolid,
  faMagnifyingGlass as faMagnifyingGlassSolid,
  faUser as faUserSolid,
} from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Tabs } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useCart } from '@/contexts/cart';
import { useSaved } from '@/contexts/saved';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { totalQuantity } = useCart();
  const { savedItems } = useSaved();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopColor: Colors[colorScheme ?? 'light'].border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter18pt-Medium',
        },
        tabBarBadgeStyle: {
          backgroundColor: '#C5705D', // terracotta - matches web
          color: '#FFFFFF', // white text
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesomeIcon
              icon={focused ? faHouseSolid : faHouse}
              color={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesomeIcon
              icon={focused ? faMagnifyingGlassSolid : faMagnifyingGlass}
              color={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="bag"
        options={{
          title: 'Bag',
          tabBarBadge: totalQuantity > 0 ? totalQuantity : undefined,
          tabBarIcon: ({ color, focused }) => (
            <FontAwesomeIcon
              icon={focused ? faBagShoppingSolid : faBagShopping}
              color={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarBadge: savedItems.length > 0 ? savedItems.length : undefined,
          tabBarIcon: ({ color, focused }) => (
            <FontAwesomeIcon
              icon={focused ? faHeartSolid : faHeart}
              color={color}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <FontAwesomeIcon
              icon={focused ? faUserSolid : faUser}
              color={color}
              size={22}
            />
          ),
        }}
      />
    </Tabs>
  );
}
