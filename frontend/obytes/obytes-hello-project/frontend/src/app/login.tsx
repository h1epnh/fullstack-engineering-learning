import { useRouter } from 'expo-router';
import React from 'react';

import type { LoginFormProps } from '@/components/login-form';
import { LoginForm } from '@/components/login-form';
import { FocusAwareStatusBar } from '@/components/ui';
import { useAuth } from '@/lib';
import { loginUser } from '@/api/auth/auth';

export default function Login() {
  const router = useRouter();
  const signIn = useAuth.use.signIn();

  const onSubmit: LoginFormProps['onSubmit'] = async (data) => {
    try {
      const result = await loginUser(data.email, data.password);
      console.log(result); // Handle the result as needed
      signIn({ access: result.token, refresh: result.token }); // Adjust based on your API response
      router.push('/');
    } catch (error) {
      console.error('Error during login:', error);
      // Handle error (e.g., show a notification to the user)
    }
  };

  return (
    <>
      <FocusAwareStatusBar />
      <LoginForm onSubmit={onSubmit} />
    </>
  );
}
