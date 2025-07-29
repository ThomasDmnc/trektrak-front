'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from "sonner"

const FormSchema = z.object({
  email: z.email({
    message: 'Please enter a valid email address.',
  }),
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
  confirmationPassword: z.string().min(6, {
    message: 'Confirmation password must be at least 6 characters.',
  }),
});

type FormData = z.infer<typeof FormSchema>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const [error, setError] = useState('');

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmationPassword: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log('Form Data:', data);
    setError('');
    console.log('Hello')
    const { email, username, password, confirmationPassword } = data;

    if (password !== confirmationPassword) {
      setError('Passwords do not match.');
      toast.error('Passwords do not match.');
      return;
    }

    if (!email || !username || !password) {
      setError('All fields are required.');
      toast.error('All fields are required.');
      return;
    }
  
    try {
      const response = await fetch(
        `api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              email: email,
              username: username,
              password: password,
          }),
        }
      );

      const responseData = await response.json();
      console.log('Response Data:', responseData);
      
      if (response.ok && responseData.user) {
        console.log('Registration Successful', response);
        toast.message('User registered successfully', {
          description: 'You can now log in with your new account.',
        });
        router.push('/login');
        return;
      }

      // Si la réponse n'est pas ok, afficher l'erreur
      console.error('Registration failed:', responseData);
      setError(responseData.error || 'Registration failed. Please try again.');
      toast.error(responseData.error || 'Registration failed. Please try again.');
    } catch (error) {
      console.error('Error during registration:', error);
      setError('Registration failed. Please try again later.');
      return;
    }
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Enter your information below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Bob_Smith"
                  required
                  {...form.register('username')}
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  {...form.register('password')}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                )}
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="confirmationPassword">Confirm your password</Label>
                </div>
                <Input
                  id="confirmationPassword"
                  type="password"
                  {...form.register('confirmationPassword')}
                />
                {form.formState.errors.confirmationPassword && (
                  <p className="text-sm text-red-500">{form.formState.errors.confirmationPassword.message}</p>
                )}
              </div>
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Create your account
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
