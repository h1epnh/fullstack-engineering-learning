import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as z from 'zod';

import { Button, ControlledInput, Text, View } from '@/components/ui';

const baseSchema = z.object({
  name: z.string().optional(),
  email: z
    .string()
    .email('validation.emailInvalid')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'validation.phoneInvalid')
    .optional()
    .or(z.literal('')),
  password: z
    .string({
      required_error: 'validation.passwordRequired',
    })
    .min(6, 'validation.passwordMinLength'),
});

const loginSchema = baseSchema.refine((data) => data.email || data.phone, {
  message: 'validation.emailOrPhoneRequired',
  path: ['email'],
});

const signupSchema = z
  .object({
    name: z.string().min(2, 'validation.nameRequired'),
    email: z
      .string()
      .email('validation.emailInvalid')
      .optional()
      .or(z.literal('')),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'validation.phoneInvalid')
      .optional()
      .or(z.literal('')),
    password: z
      .string({
        required_error: 'validation.passwordRequired',
      })
      .min(6, 'validation.passwordMinLength'),
    confirmPassword: z.string({
      required_error: 'validation.confirmPasswordRequired',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'validation.passwordsDontMatch',
    path: ['confirmPassword'],
  })
  .refine((data) => data.email || data.phone, {
    message: 'validation.emailOrPhoneRequired',
    path: ['email'],
  });

type LoginFormType = z.infer<typeof loginSchema>;
type SignupFormType = z.infer<typeof signupSchema>;

export type FormType = LoginFormType | SignupFormType;

export type LoginFormProps = {
  onSubmit?: SubmitHandler<FormType>;
};

export const LoginForm = ({ onSubmit = () => {} }: LoginFormProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { t } = useTranslation();
  const { handleSubmit, control } = useForm<FormType>({
    resolver: zodResolver(isSignUp ? signupSchema : loginSchema),
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={10}
    >
      <View className="flex-1 justify-center p-4">
        <View className="mb-8 items-center">
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348',
            }}
            className="size-32 rounded-full"
            contentFit="cover"
            transition={1000}
          />
          <Text className="text-primary mt-4 text-center text-2xl font-bold">
            {t('auth.salonName')}
          </Text>
          <Text className="mt-1 text-center text-sm text-gray-500">
            {t('auth.salonTagline')}
          </Text>
        </View>

        <View className="items-center justify-center">
          <Text
            testID="form-title"
            className="pb-6 text-center text-4xl font-bold"
          >
            {isSignUp ? t('auth.signUp') : t('auth.signIn')}
          </Text>

          <Text className="mb-6 max-w-xs text-center text-gray-500">
            {t('auth.welcome')}{' '}
            {isSignUp ? t('auth.signUpMessage') : t('auth.signInMessage')}
          </Text>
        </View>

        {isSignUp && (
          <ControlledInput
            testID="name"
            control={control}
            name="name"
            label={t('auth.name')}
            placeholder={t('auth.namePlaceholder')}
          />
        )}

        <ControlledInput
          testID="email-input"
          control={control}
          name="email"
          label={t('auth.email')}
          placeholder={t('auth.emailPlaceholder')}
        />

        <ControlledInput
          testID="phone-input"
          control={control}
          name="phone"
          label={t('auth.phone')}
          placeholder={t('auth.phonePlaceholder')}
          keyboardType="phone-pad"
        />

        <ControlledInput
          testID="password-input"
          control={control}
          name="password"
          label={t('auth.password')}
          placeholder={t('auth.passwordPlaceholder')}
          secureTextEntry={true}
        />

        {isSignUp && (
          <ControlledInput
            testID="confirm-password-input"
            control={control}
            name="confirmPassword"
            label={t('auth.confirmPassword')}
            placeholder={t('auth.passwordPlaceholder')}
            secureTextEntry={true}
          />
        )}

        <Button
          testID="submit-button"
          label={isSignUp ? t('auth.signUp') : t('auth.signIn')}
          onPress={handleSubmit(onSubmit)}
        />

        <Pressable
          onPress={() => setIsSignUp(!isSignUp)}
          className="mt-4 items-center"
        >
          <Text className="text-primary">
            {isSignUp ? t('auth.haveAccount') : t('auth.noAccount')}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};
