import * as z from 'zod';

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
      .min(8, 'validation.passwordMinLength'),
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

export { loginSchema, signupSchema }; 