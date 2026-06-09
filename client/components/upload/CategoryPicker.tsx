/*
GEN AI Use in file: Given design.ts file, implement a component to select category
My Code: Connecting React Logic + Animation
*/
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Pressable,
  ScrollView,
} from 'react-native';
import { Palette, Spacing, Radius, textVariants } from '@/constants/design';

type Props = {
  visible: boolean;
  title: string;
  subcategories: string[];
  onNext: (subcategory: string) => void;
  onClose: () => void;
};

export default function CategoryPicker({
  visible,
  title,
  subcategories,
  onNext,
  onClose,
}: Props) {
  const translateY = useRef(new Animated.Value(600)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (visible) setSelected(null);
  }, [visible]);

  useEffect(() => {
    if (visible) {
      translateY.setValue(600);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, damping: 24, stiffness: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 600, duration: 160, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={[textVariants.labelSm, styles.headerEyebrow]}>Select type</Text>
          <Text style={[textVariants.headlineMd, styles.headerTitle]}>{title}</Text>
        </View>

        <View style={styles.divider} />

        <ScrollView bounces={false} showsVerticalScrollIndicator={true} contentContainerStyle={styles.listContent} style={styles.list}>
          {subcategories.map((sub, index) => {
            const isSelected = selected === sub;
            return (
              <React.Fragment key={sub}>
                <TouchableOpacity
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => setSelected(prev => (prev === sub ? null : sub))}
                  activeOpacity={0.6}
                >
                  <Text style={[textVariants.bodyMd, styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {sub}
                  </Text>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
                {index < subcategories.length - 1 && <View style={styles.optionDivider} />}
              </React.Fragment>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          style={[styles.actionBtn, !selected && styles.actionBtnDisabled]}
          onPress={() => {
            if (selected) {
              handleClose();
              setTimeout(() => onNext(selected), 160);
            } else {
              handleClose();
            }
          }}
          activeOpacity={selected ? 0.7 : 1}
        >
          <Text style={[textVariants.labelSm, styles.actionLabel, !selected && styles.actionLabelDisabled]}>
            {selected ? 'Next' : 'Cancel'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  list: {
    maxHeight: 320, 
},
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Palette.surfaceContainerLowest,
    borderTopLeftRadius: Radius.lg * 2,
    borderTopRightRadius: Radius.lg * 2,
    paddingBottom: 36,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Palette.outlineVariant,
    alignSelf: 'center',
    marginTop: Spacing.stackMd,
    marginBottom: Spacing.stackSm,
  },
  header: {
    paddingHorizontal: Spacing.containerMargin,
    paddingTop: Spacing.stackSm,
    paddingBottom: Spacing.stackMd,
  },
  headerEyebrow: {
    color: Palette.onSurfaceVariant,
    marginBottom: 6,
  },
  headerTitle: {
    color: Palette.onBackground,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.outlineVariant,
  },
  listContent: {
    paddingTop: Spacing.stackMd,
    paddingHorizontal: Spacing.containerMargin,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.stackMd,
    paddingHorizontal: Spacing.stackMd,
    borderRadius: Radius.lg,
  },
  optionSelected: {
    backgroundColor: Palette.primary,
  },
  optionLabel: {
    color: Palette.onSurface,
  },
  optionLabelSelected: {
    color: Palette.onPrimary ?? '#fff',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: Palette.onPrimary ?? '#fff',
    fontWeight: '600',
  },
  optionDivider: {
    height: 1,
    backgroundColor: Palette.surfaceContainerHigh,
    marginVertical: Spacing.stackSm,
  },
  actionBtn: {
    marginHorizontal: Spacing.containerMargin,
    marginTop: Spacing.stackMd,
    paddingVertical: Spacing.stackMd,
    borderRadius: Radius.lg,
    backgroundColor: Palette.primary,
    alignItems: 'center',
  },
  actionBtnDisabled: {
    backgroundColor: Palette.surfaceContainer,
  },
  actionLabel: {
    color: Palette.onPrimary ?? '#fff',
  },
  actionLabelDisabled: {
    color: Palette.onSurfaceVariant,
  },
});