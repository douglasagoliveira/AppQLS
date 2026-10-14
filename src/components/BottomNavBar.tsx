import React from 'react';
import { Pressable, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BookOpen, FolderGit2, Layers, Sparkles, User } from 'lucide-react-native';
import { T } from './ui';
import { haptic } from '../lib/haptics';
import { countListItems } from '../lib/projectMath';
import { useProjectStore } from '../store/useProjectStore';

export function BottomNavBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { currentProject } = useProjectStore();
  const itemCount = countListItems(currentProject);

  const icons: Record<string, (color: string, focused: boolean) => React.ReactNode> = {
    index: (color) => <Layers size={20} color={color} />,
    consultant: (color) => <Sparkles size={20} color={color} />,
    catalog: (color) => <BookOpen size={20} color={color} />,
    profile: (color) => <User size={20} color={color} />,
  };

  const labels: Record<string, string> = {
    index: 'Projetos',
    consultant: 'Consultor IA',
    catalog: 'Catálogo',
    profile: 'Minha Conta',
  };

  return (
    <View className="bg-[#0e0e0e]/95 border-t border-white/[0.08] flex-row items-center justify-around pt-2 pb-5 px-3">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const color = isFocused ? '#d9b277' : '#71717a';
        const label = labels[route.name] || options.title || route.name;

        const onPress = () => {
          haptic.tick();
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            className="flex-1 items-center justify-center py-1 relative"
          >
            <View className="items-center justify-center">
              {icons[route.name] ? icons[route.name](color, isFocused) : null}

              {/* Badge on Projects tab showing items in current project */}
              {route.name === 'index' && itemCount > 0 && (
                <View className="absolute -top-1 -right-2.5 bg-[#d9b277] min-w-[16px] h-4 rounded-full items-center justify-center px-1">
                  <T variant="caption" className="text-black font-extrabold text-[9px] leading-none">
                    {itemCount}
                  </T>
                </View>
              )}
            </View>

            <T
              variant="caption"
              className={`text-[10px] mt-1 font-medium ${
                isFocused ? 'text-[#d9b277] font-bold' : 'text-zinc-500'
              }`}
            >
              {label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}
