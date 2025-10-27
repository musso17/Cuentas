
import React from 'react';
import Button from '../ui/Button';

interface HomePageProps {
    onLoginClick: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onLoginClick }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <div className="max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-bold font-instrument tracking-tight text-foreground">
          Balance Compartido
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground">
          Finanzas en pareja, sin drama.
        </p>
        <p className="mt-2 text-md text-muted-foreground max-w-md mx-auto">
          La forma más simple y elegante de gestionar los gastos, ingresos y ahorros con tu persona favorita.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={onLoginClick} size="lg">
            Iniciar sesión / Ver demo
          </Button>
        </div>
      </div>
      <div className="mt-16 w-full max-w-4xl p-2 bg-white rounded-xl shadow-2xl ring-1 ring-black/5">
        <img 
            src="https://picsum.photos/seed/finance/1200/600" 
            alt="Dashboard de Balance Compartido"
            className="rounded-lg"
        />
      </div>
    </div>
  );
};

export default HomePage;
