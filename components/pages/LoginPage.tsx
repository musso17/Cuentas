import React, { useState } from 'react';
import Card, { CardHeader, CardContent, CardTitle, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useFinanceStore } from '../../store/useFinanceStore';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const { login, loading, magicLinkSent, error } = useFinanceStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      login(email);
    }
  };

  if (magicLinkSent) {
      return (
         <div className="flex items-center justify-center min-h-screen bg-background">
          <Card className="w-full max-w-sm text-center">
            <CardHeader>
              <CardTitle className="text-2xl font-instrument">¡Revisa tu correo!</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Te hemos enviado un enlace mágico a <strong>{email}</strong> para que puedas iniciar sesión de forma segura.</p>
            </CardContent>
          </Card>
        </div>
      )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-instrument">¡Hola de nuevo!</CardTitle>
          <CardDescription>Usa el Magic Link para entrar a tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Correo electrónico</label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || !email}>
              {loading ? 'Enviando...' : 'Enviar Magic Link'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;